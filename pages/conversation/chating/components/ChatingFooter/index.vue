<template>
	<view :snapFlag="snapFlag" :change:snapFlag="snap.getSnapFlagUpdate"
		>
		<view class="chat_footer">
			<img @click="updateRecordBtn" style="width: 26px;height: 26px;"
				:src="showRecord ? 'static/images/chating_footer_audio_recording.png' : 'static/images/chating_footer_audio.png'">
			<view class="input_content">
				<CustomEditor v-show="!showRecord" class="custom_editor"
					ref="customEditor" @ready="editorReady" @focus="editorFocus" @blur="editorBlur"
					@input="editorInput" />
				<view v-if="storeQuoteMessage" class="quote_message">
					<view class="content">
						<u-parse :content="getQuotedContent" />
					</view>
					<image @click="cancelQuote" style="width: 16px;height: 16px;"
						src="@/static/images/chating_footer_quote_close.png" alt="">
				</view>
				<button class="record_btn" @longpress="longpressRecord" @touchmove="touchMoveSpeech"
					@touchend="endRecord" v-show='showRecord' customStyle="height:30px;" type="primary">
					按住说话
				</button>
			</view>

			<view class="footer_action_area">
				<image @click="updateEmojiBar" class="emoji_action" src="@/static/images/chating_footer_emoji.png"
					alt="" srcset="">
					<image v-show="!hasContent" @click.prevent="updateActionBar"
						src="@/static/images/chating_footer_add.png" alt="" srcset="">
						<view class="send_btn" @touchend.prevent="sendTextMessage"
							v-show="hasContent && !emojiBarVisible">
							发送
						</view>
						<view class="send_btn" @click.prevent="sendTextMessage" v-show="hasContent && emojiBarVisible">
							发送
						</view>
			</view>
		</view>
		<chating-action-bar @sendMessage="sendMessage" @prepareMediaMessage="prepareMediaMessage"
			v-show="actionBarVisible" />
		<chating-emoji-bar @emojiClick="emojiClick" v-show="emojiBarVisible" />
		<u-action-sheet :safeAreaInsetBottom="true" round="12" :actions="actionSheetMenu" @select="selectClick"
			:closeOnClickOverlay="true" :closeOnClickAction="true" :show="showActionSheet"
			@close="showActionSheet=false">
		</u-action-sheet>
		<record-overlay @recordFinish="recordFinish" ref="recordOverlayRef" :visible="recording" />
	</view>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from "vuex";
	import {
		base64ToPath
	} from 'image-tools'
	import {
		formatInputHtml,
		getPurePath,
		html2Text
	} from "@/util/common"
	import {
		parseMessageByType,
	} from "@/util/imCommon"
	import {
		MessageStatus,
		ChatingFooterActionTypes,
		UpdateMessageTypes,
		SessionType,
		MessageType,
		GroupStatus,
		GroupMemberRole
	} from "@/constant"
	import IMSDK from '@/util/compatibleIM'
	import UParse from '@/components/gaoyia-parse/parse.vue'
	import CustomEditor from "./CustomEditor.vue"
	import ChatingActionBar from "./ChatingActionBar.vue"
	import ChatingEmojiBar from "./ChatingEmojiBar.vue"
	import RecordOverlay from "./RecordOverlay.vue"
	import {
		gotoAppPermissionSetting,
		requestAndroidPermission
	} from "@/util/permission";


	const needClearTypes = [
		MessageType.ADVANCETEXTMESSAGE,
		MessageType.TEXTMESSAGE,
		MessageType.ATTEXTMESSAGE,
		MessageType.QUOTEMESSAGE,
	]

	const albumChoose = [{
			name: '图片',
			type: ChatingFooterActionTypes.Album,
			idx: 0
		},
		{
			name: '视频',
			type: ChatingFooterActionTypes.Album,
			idx: 1
		}
	]
	const cameraChoose = [{
			name: '拍照',
			type: ChatingFooterActionTypes.Camera,
			idx: 0
		},
		{
			name: '录制',
			type: ChatingFooterActionTypes.Camera,
			idx: 1
		}
	]

	export default {
		components: {
			CustomEditor,
			ChatingActionBar,
			ChatingEmojiBar,
			UParse,
			RecordOverlay
		},
		props: {
			footerOutsideFlag: Number
		},
		data() {
			return {
				customEditorCtx: null,
				inputHtml: '',
				showRecord: false,
				actionBarVisible: false,
				emojiBarVisible: false,
				isInputFocus: false,
				actionSheetMenu: [],
				showActionSheet: false,
				snapFlag: null,
				recording: false,
				recordTop: uni.getWindowInfo().windowHeight - 130
			}
		},
		computed: {
			...mapGetters(['storeQuoteMessage', 'storeCurrentConversation', 'storeCurrentGroup',
				'storeCurrentMemberInGroup', 'storeBlackList'
			]),
			getQuotedContent() {
				if (!this.storeQuoteMessage) {
					return ""
				}
				return `回复${this.storeQuoteMessage.senderNickname}：${parseMessageByType(this.storeQuoteMessage)}`
			},
			hasContent() {
				return html2Text(this.inputHtml) !== ""
			},
		},
		watch: {
			footerOutsideFlag(newVal) {
				this.onClickActionBarOutside();
				this.onClickEmojiBarOutside();
			},
		},
		mounted() {
			this.setSendMessageListener();
			this.setKeyboardListener();
		},
		beforeDestroy() {
			this.disposeSendMessageListener();
			this.disposeKeyboardListener();
		},
		methods: {
			...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
			longpressRecord() {
				this.recording = true;
				this.$nextTick(() => this.getRecordAreaData())
			},
			touchMoveSpeech(e) {
				uni.$u.throttle(this.$refs.recordOverlayRef.touchMoveSpeech(e, this.recordTop), 250)
			},
			endRecord() {
				this.recording = false;
				this.$refs.recordOverlayRef.checkStopType();
			},
			recordFinish(path, duration) {
				const message = IMSDK.IMApi.createSoundMessageFromFullPath(IMSDK.uuidv4(), getPurePath(path), duration)
				this.sendMessage(message)
			},
			getRecordAreaData() {
				this.getEl('.record_area').then((data) => {
					if (data) {
						this.recordTop = data.top
					}
				})
			},
			getEl(el) {
				return new Promise((resolve) => {
					const query = uni.createSelectorQuery().in(this)
					query.select(el).boundingClientRect(data => {
						resolve(data)
					}).exec();
				})
			},
			createTextMessage() {
				let message = ''
				const text = formatInputHtml(this.inputHtml)
				if (this.storeQuoteMessage) {
						message = IMSDK.IMApi.createQuoteMessage(IMSDK.uuidv4(), text, JSON.stringify(this
							.storeQuoteMessage))
					} else {
						message = IMSDK.IMApi.createTextMessage(IMSDK.uuidv4(), text)
					}
				return message
			},
			sendTextMessage() {
				if (!this.hasContent) return;
				const message = this.createTextMessage();
				this.sendMessage(message)
			},
			sendMessage(message) {
				const parsedMessage = JSON.parse(message)
				this.pushNewMessage(parsedMessage)
				if (needClearTypes.includes(parsedMessage.contentType)) {
					this.customEditorCtx.clear();
				}
				this.$emit('scrollToBottom', parsedMessage.clientMsgID)
				IMSDK.IMApi.sendMessage(IMSDK.uuidv4(), message, this.storeCurrentConversation
					.userID, this.storeCurrentConversation.groupID, IMSDK.offlinePushInfo);
				if (this.storeQuoteMessage) {
					this.$store.commit('message/SET_QUOTE_MESSAGE', undefined)
				}
			},

			// action
			cancelQuote() {
				this.$store.commit('message/SET_QUOTE_MESSAGE', undefined)
			},
			onClickActionBarOutside() {
				if (this.actionBarVisible) {
					this.actionBarVisible = false
				}
			},
			onClickEmojiBarOutside() {
				if (this.emojiBarVisible) {
					this.emojiBarVisible = false
				}
			},
			updateActionBar() {
				this.onClickEmojiBarOutside()
				this.actionBarVisible = !this.actionBarVisible
			},
			updateEmojiBar() {
				this.onClickActionBarOutside()
				this.emojiBarVisible = !this.emojiBarVisible
			},
			editorReady(e) {
				this.customEditorCtx = e.context;
				this.customEditorCtx.clear();
			},
			editorFocus() {
				this.isInputFocus = true
			},
			editorBlur() {
				this.isInputFocus = false
			},
			editorInput(e) {
				this.inputHtml = e.detail.html
			},
			async updateRecordBtn() {
				if (!this.showRecord) {
					const flag = await requestAndroidPermission('android.permission.RECORD_AUDIO')
					if (flag === -1) {
						uni.$u.toast('您已禁止访问麦克风，请前往开启')
						setTimeout(() => gotoAppPermissionSetting(), 250)
					}

					if (flag === 1) {
						this.showRecord = !this.showRecord
					}
				} else {
					this.showRecord = !this.showRecord
				}
			},
			prepareMediaMessage(type) {
				if (type === ChatingFooterActionTypes.Album) {
					this.actionSheetMenu = [...albumChoose]
				} else {
					this.actionSheetMenu = [...cameraChoose]
				}
				this.showActionSheet = true;
			},

			// from comp
			emojiClick(emoji) {
				const options = {
					src: emoji.src,
					width: "24px",
					height: "18px",
					data: {
						emojiText: emoji.context
					},
					extClass: 'emoji_el'
				}
				this.$refs.customEditor.insertImage(options);
			},
			batchCreateImageMesage(paths) {
				paths.forEach(path => {
					const message = IMSDK.IMApi.createImageMessageFromFullPath(IMSDK.uuidv4(),
						getPurePath(
							path));
					this.sendMessage(message)
				})
			},
			receiveSnapBase64({
				base64,
				path,
				duration,
				videoType
			}) {
				base64ToPath(base64).then(snapRelativePath => {
					const absolutePath = plus.io.convertLocalFileSystemURL(snapRelativePath);
					const message = IMSDK.IMApi.createVideoMessageFromFullPath(IMSDK.uuidv4(),
						getPurePath(
							path),
						videoType,
						Number(duration.toFixed()), absolutePath);
					this.sendMessage(message)
				})

			},
			selectClick({
				idx
			}) {
				if (idx === 0) {
					if (this.actionSheetMenu[0].type === ChatingFooterActionTypes.Album) {
						this.chooseOrShotImage(['album'])
							.then(paths => this.batchCreateImageMesage(paths))
					} else {
						this.chooseOrShotImage(['camera'])
							.then(paths => this.batchCreateImageMesage(paths))
					}
				} else {
					if (this.actionSheetMenu[0].type === ChatingFooterActionTypes.Album) {
						this.chooseOrShotVideo(['album'])
							.then(data => this.snapFlag = data)
					} else {
						this.chooseOrShotVideo(['camera'])
							.then(data => this.snapFlag = data)
					}
				}
			},
			chooseOrShotImage(sourceType) {
				return new Promise((resolve, reject) => {
					uni.chooseImage({
						count: 9,
						sizeType: ['compressed'],
						sourceType,
						success: function({
							tempFilePaths
						}) {
							resolve(tempFilePaths)
						},
						fail: function(err) {
							console.log(err);
							reject(err)
						}
					})
				})
			},
			chooseOrShotVideo(sourceType) {
				return new Promise((resolve, reject) => {
					uni.chooseVideo({
						compressed: true,
						sourceType,
						success: function({
							tempFilePath,
							duration
						}) {
							const idx = tempFilePath.lastIndexOf('.')
							const videoType = tempFilePath.slice(idx + 1)
							if (tempFilePath.includes('_doc/')) {
								tempFilePath =
									`file://${plus.io.convertLocalFileSystemURL(tempFilePath)}`
							}
							resolve({
								path: tempFilePath,
								videoType,
								duration
							})
						},
						fail: function(err) {
							console.log(err);
							reject(err)
						}
					})
				})
			},

			// message status
			sendSuccessHandler({
				message
			}) {
				const successMessage = JSON.parse(message)
				this.updateOneMessage({
					message: successMessage,
					isSuccess: true
				})
			},
			sendFailedHandler({
				message,
				errCode,
				errMsg
			}) {
				console.log(errCode, errMsg);
				const failedMessage = JSON.parse(message)
				this.updateOneMessage({
					message: failedMessage,
					type: UpdateMessageTypes.KeyWords,
					keyWords: {
						key: 'status',
						value: MessageStatus.Failed
					}
				})
			},
			sendProgressHandler({
				message,
				progress
			}) {
				const progressMessage = JSON.parse(message)
				this.updateOneMessage({
					message: progressMessage,
					type: UpdateMessageTypes.KeyWords,
					keyWords: {
						key: 'uploadProgress',
						value: progress
					}
				})
			},
			setSendMessageListener() {
				IMSDK.subscribe(IMSDK.IMEvents.SendMessageSuccess, this.sendSuccessHandler)
				IMSDK.subscribe(IMSDK.IMEvents.SendMessageFailed, this.sendFailedHandler)
				IMSDK.subscribe(IMSDK.IMEvents.SendMessageProgress, this.sendProgressHandler)
			},
			disposeSendMessageListener() {
				IMSDK.unsubscribe(IMSDK.IMEvents.SendMessageSuccess, this.sendSuccessHandler)
				IMSDK.unsubscribe(IMSDK.IMEvents.SendMessageFailed, this.sendFailedHandler)
				IMSDK.unsubscribe(IMSDK.IMEvents.SendMessageProgress, this.sendProgressHandler)
			},

			// keyboard
			keyboardChangeHander({
				height
			}) {
				if (height > 0) {
					if (this.emojiBarVisible) {
						this.emojiBarVisible = false
					}
					if (this.actionBarVisible) {
						this.actionBarVisible = false
					}
				}
			},
			setKeyboardListener() {
				uni.onKeyboardHeightChange(this.keyboardChangeHander)
			},
			disposeKeyboardListener() {
				uni.offKeyboardHeightChange(this.keyboardChangeHander)
			}
		}
	}
</script>


<script module="snap" lang="renderjs">
	export default {
		methods: {
			getSnapFlagUpdate(newValue, oldValue, ownerVm, vm) {
				if (newValue === null) {
					return;
				}
				const {
					path
				} = newValue
				this.getVideoSnshot(path).then(base64 => {
					ownerVm.callMethod('receiveSnapBase64', {
						...newValue,
						base64
					})
				})
			},
			getVideoSnshot(item) {
			      return this.getVideoBasicInfo(item).then(videoInfo => {
				// const { video, duration,width,height } = videoInfo
				// video.currentTime = targetTime
				return this.getVideoPosterInfo(videoInfo)
			      })
			},
		     getVideoBasicInfo(videoSrc) {
			return new Promise((resolve, reject) => {
			    const video = document.createElement('video')
			    video.src = videoSrc
			    // 视频一定要添加预加载
			    video.preload = 'auto'
			    // 视频一定要同源或者必须允许跨域
			    video.crossOrigin = 'Anonymous'
			    // 监听：异常
			    video.addEventListener('error', error => {
				reject(error)
			    })
			    // 监听：加载完成基本信息,设置要播放的时常
			    video.addEventListener('loadedmetadata', () => {
				const videoInfo = {
				    video,
				    width: video.videoWidth,
				    height: video.videoHeight,
				    duration: video.duration
				}
				resolve(videoInfo)
			    })
			})
		      },
		      getVideoPosterInfo(videoInfo) {
			  return new Promise(resolve => {
			      const { video, width, height } = videoInfo
			      video.addEventListener('canplay', () => {
				  const canvas = document.createElement('canvas')
				  canvas.width = width
				  canvas.height = height
				  const ctx = canvas.getContext('2d')
				  ctx.drawImage(video, 0, 0, width, height)
				  const posterUrl = canvas.toDataURL('image/png')
				  resolve(posterUrl);
			      })
			  })
		      }
		},
	}
</script>

<style lang="scss" scoped>
	.custom_editor {
		img {
			vertical-align: sub;
		}
	}

	.chat_footer {
		display: flex;
		align-items: center;
		background-color: #e9f4ff;
		// height: 50px;
		max-height: 120px;
		padding: 24rpx 20rpx;

		.input_content {
			flex: 1;
			min-height: 30px;
			max-height: 120px;
			margin: 0 24rpx;
			border-radius: 8rpx;
			position: relative;

			.record_btn {
				background-color: #3c9cff;
				height: 30px;
				font-size: 24rpx;
			}
		}

		.quote_message {
			@include vCenterBox();
			justify-content: space-between;
			margin-top: 12rpx;
			padding: 8rpx;
			// padding-top: 20rpx;
			border-radius: 6rpx;
			background-color: #fff;
			color: #666;

			.content {
				/deep/ uni-view {
					@include ellipsisWithLine(2);
				}
			}

		}

		.footer_action_area {
			display: flex;
			align-items: center;

			.emoji_action {
				margin-right: 24rpx;
			}

			image {
				width: 26px;
				height: 26px;
			}
		}

		.send_btn {
			height: 30px;
			line-height: 30px;
			background-color: #4a9cfc;
			padding: 0 8px;
			border-radius: 4px;
			color: #fff;
		}
	}
</style>
