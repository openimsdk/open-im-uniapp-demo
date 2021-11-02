<template>
	<view @click.stop="clickPage" class="chat-box">
		<view class="chat-content">
			<u-navbar>
				<view class="slot-wrap">
					<view class="nick-title">
						<text>{{vuex_conversation.name||vuex_conversation.showName||vuex_conversation.groupName||vuex_conversation.userID}}</text>
						<view v-if="groupID==''" class="user-status">
							<text>{{tip}}</text>
						</view>
					</view>
				</view>
				<view slot="right" class="slot-right">
					<u-icon @click="rightSet" name="more-dot-fill" size="48" />
				</view>
			</u-navbar>

			<scroll-view refresher-enabled refresher-default-style="white" :refresher-triggered="refresherState"
				@refresherabort="refreshAbort" @refresherrestore="refreshFnish" @refresherrefresh="refreshStart"
				@click="clickScroll" :scroll-into-view="listItem" :style="{height:scrollHeight+'px'}" class="chat-list"
				scroll-y>
				<template v-for="msg in msgList">
					<view :id="msg.positionId" v-if="!(contentTypeFilter(msg.contentType))&&msg.contentType!=112" class="agree-msg">
						<text v-if="msg.contentType==111">{{msg.sendID==vuex_user_info.uid?"你撤回了一条消息":msg.senderNickName+" 撤回了一条消息"}}</text>
						<text v-else>{{JSON.parse(msg.content).defaultTips}}</text>
						<!-- <text>you revoke a message you revoke a message you revoke a message you revoke a message you revoke a message</text> -->
					</view>
					<OtherMsg
						v-if="msg.sendID!==vuex_user_info.uid&&!msg.isDelete&&contentTypeFilter(msg.contentType)"
						:msg="msg" :key="msg.positionId" :id="msg.positionId" @atOne="atOne" />
					<MyMsg v-if="msg.sendID==vuex_user_info.uid&&!msg.isDelete&&contentTypeFilter(msg.contentType)"
						:msg="msg" :key="msg.positionId" :id="msg.positionId" />
				</template>
			</scroll-view>
			
			<view class="bottom-bar">
				<view :style="{visibility:replyStatus?'visible':'hidden'}" class="reply-msg">
					<text>{{replyMsg}}</text>
				</view>
				<view class="bar-list">
					<u-icon @click="voice" size="51" name="../../static/voice.png" />
					<u-input confirm-type="send" @confirm="sendTextMsg" @focus="focusInput" v-model="inputValue"
						height="58" placeholder="" class="bottom-input" />
					<u-icon @click="moreAction" size="51" name="../../static/moreOperation.png" />
					<u-button class="bottom-btn" size="mini" @click="sendTextMsg">发送</u-button>
				</view>
			</view>
			
			<ActionsBar v-show="operationState" @clickShot="clickShot" @clickAlbum="clickAlbum" @clickVoice="clickVoice" @clickVideo="clickVideo" @clickFile="clickFile" @clickIDcard="clickIDcard" @clickLocation="clickLocation" />
		</view>
		<u-mask :mask-click-able="false" :show="showMask">
			<view class="mask-warp">
				<view class="voice-icon-box">
					<image class="icon-item" src="../../static/press-voice.png" mode=""></image>
					<view class="interval-time"><text>{{intIntervalTime+'s'}}</text></view>
					<view class="bottom-icon" />
				</view>
				<view class="btn-list">
					<view class="action-btn">
						<u-button @click="cancelVoice" type="default" size="mini">cancel</u-button>
						<u-button @click="sendVoice" size="mini" type="default">send</u-button>
					</view>
					<view class="press-btn" @touchstart="startSpeack" @touchend="stopSpeack">长按讲话
					</view>
				</view>
			</view>
		</u-mask>

		<u-action-sheet cancel-text="取消" @click="imageOrVideo" :list="actionList" v-model="actionShow">
		</u-action-sheet>
		<SelectFile v-model="showSelectFile" @confirm="getFilePath"></SelectFile>
	</view>
</template>

<script>
	import OtherMsg from "./comps/OtherMsg.vue"
	import MyMsg from "./comps/MyMsg.vue"
	import SelectFile from "../../components/SelectFile/SelectFile.vue"
	import ActionsBar from "./comps/ActionsBar/ActionsBar.vue"
	import {
		asyncGetImgInfo,
		randomString,
		getAndroidVideoThumb
	} from '../../utils/tools.js'
	import {
		requestAndroidPermission
	} from '../../utils/permission.js'
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	let _this = null
	export default {
		data() {
			return {
				nickname: "",
				tmpStr: "You have successfully become friends, so start chatting",
				scrollHeight: 0,
				inputValue: "",
				operationState: false,
				listItem: null,
				showMask: false,
				actionShow: false,
				voicePath: "",
				recvID: "",
				recorderManager: null,
				msgList: [],
				actionList: [{
						text: "图片",
					},
					{
						text: "视频",
					},
				],
				percent: 0,
				timer: null,
				isRecord: false,
				intervalTime: 0,
				voicePath: "",
				myList: [],
				conversationID: "",
				groupID: "",
				groupInfo: {},
				groupMemberList: [],
				refresherState: false,
				refreshing: false,
				atUserId: [],
				atStatus: false,
				lastState: false,
				tip: "",
				typingTimer:null,
				inputTimer:null,
				showSelectFile:false,
				replyStatus:false,
				replyMsg:"",
				screenHeight:0
			}
		},
		computed: {
			intIntervalTime() {
				return Math.round(this.intervalTime);
			},
		},
		components: {
			OtherMsg,
			MyMsg,
			SelectFile,
			ActionsBar
		},
		methods: {
			getFilePath(e){
				console.log(e);
				console.log(plus.io.convertAbsoluteFileSystem(e[0].url));
			},
			contentTypeFilter(type) {
				const msgTypeList = [101, 102, 103, 104, 106]
				return msgTypeList.indexOf(type) > -1
			},
			refreshStart() {
				if (this.refreshing || this.lastState) return false
				this.refreshing = true
				if (!this.refresherState) this.refresherState = true
				console.log('refreshStart');
				this.getHistoryMessageList(this.msgList[0])
			},
			refreshFnish() {
				console.log('refreshFnish');
			},
			refreshAbort() {
				console.log('refreshAbort');
			},
			rightSet() {
				if (this.recvID) {
					uni.navigateTo({
						url: '/pages/conversation/setFriend'
					});
				} else {
					uni.navigateTo({
						url: '/pages/conversation/Group/setsGroup'
					});
				}
			},
			focusInput() {
				if (this.operationState) {
					this.getScreen()
					this.operationState = false
				}
			},
			clickAlbum() {
				this.actionShow = true
			},
			clickVoice(){
				this.$u.toast("developing")
			},
			clickVideo(){
				this.$u.toast("developing")
			},
			clickFile(){
				this.$u.toast("developing")
				// this.showSelectFile = true
			},
			clickIDcard(){
				this.$u.toast("developing")
			},
			clickLocation(){
				this.$u.toast("developing")
			},
			getHistoryMessageList(start) {
				let reqData = {
					groupID: this.vuex_conversation.groupID || "",
					startMsg: start,
					count: 10,
					userID: this.vuex_conversation.userID || ""
				};
				this.$openSdk.getHistoryMessageList(reqData, data => {
					const tmpArr = JSON.parse(data.msg)
					console.log(tmpArr);
					// const msgTypeList = [101, 102, 103, 104,201]
					if(tmpArr.length==0){
						setTimeout(() => {
							this.refresherState = false
							this.refreshing = false
							this.lastState = true
						},0)
						return false
					}
					if(this.vuex_conversation.userID!=""){
						let cids = []
						tmpArr.map(m=>{
							if(m.sendID!=this.vuex_user_info.uid) cids.push(m.clientMsgID)
						})
						console.log(cids);
						if(cids.length>0){
							this.$openSdk.markC2CMessageAsRead(this.vuex_conversation.userID, cids, (data) => {
								// console.log(data);
								if(data.err==undefined){
									cids.map(cid=>{
										tmpArr.map(t=>{
											if(t.clientMsgID==cid) t.isRead = true
										})
									})
									
								}
							})
						}
					}

					tmpArr.forEach(msg =>{
						msg.positionId = "msg" + randomString(19)
						if(msg.sendID!=this.vuex_user_info.uid&&msg.sessionType==1){
							msg.senderFaceUrl = this.vuex_conversation.icon || this.vuex_conversation.faceUrl
						}
					})
					
					this.msgList = [...tmpArr, ...this.msgList]
					setTimeout(() => {
						this.refresherState = false
						this.refreshing = false
					})
				})
			},
			newMsgListener() {
				this.$globalEvent.addEventListener("onRecvNewMessage", (params) => {
					console.log(params);
					let res = JSON.parse(params.msg)
					console.log(res);
					if (res.contentType === 113) {
						this.getTypingStatus()
					} else {
						console.log(res.recvID);
						console.log(this.groupID);
						console.log(this.vuex_user_info);
						if (res.recvID === this.vuex_user_info.uid || res.recvID === this.groupID){
							this.msgList.push(res);
							this.markC2CRead(this.vuex_conversation.userID, [res.clientMsgID],(params)=>console.log(params))
						}
					}
				});
				this.$globalEvent.addEventListener("onRecvC2CReadReceipt",(params)=>{
					console.log(params);
					let res = JSON.parse(params.msg)
					const cids = res[0].msgIDList
					this.msgList.map(msg=>{
						cids.map(cid=>{
							if(msg.clientMsgID==cid) msg.isRead = true;
						})
					})
				});
				this.$globalEvent.addEventListener("onRecvMessageRevoked",(params)=>{
					console.log(params);
					const delIndex = this.msgList.findIndex(m => m.clientMsgID == params.msg)
					this.msgList.splice(delIndex, 1)
				});
			},
			sendMessageListener() {
				this.$globalEvent.addEventListener("sendMessageSuccess", (params) => {
					console.log(params);
					const res = JSON.parse(params.sucMsg);
					console.log(res);
					_this.myList.forEach(myMsg => {
						if (myMsg.clientMsgID === res.clientMsgID) {
							const tmpArr = Object.assign([], _this.msgList)
							const reversIndex = tmpArr.findIndex(t => t.clientMsgID == myMsg.clientMsgID)
							_this.msgList[reversIndex].status = 2
						}
					})
				});
				this.$globalEvent.addEventListener("sendMessageFailed", (params) => {
					const res = JSON.parse(params.errMsg);
					console.log(params);
					_this.myList.forEach(myMsg => {
						if (myMsg.clientMsgID == res.clientMsgID) {
							const tmpArr = Object.assign([], _this.msgList)
							const reversIndex = tmpArr.findIndex(t => t.clientMsgID == myMsg.clientMsgID)
							_this.msgList[reversIndex].status = 3
						}
					})
				});
				this.$globalEvent.addEventListener("sendMessageProgress", (params) => {
					const res = JSON.parse(params.progressMsg)
				});
			},
			clickPage() {
				uni.$emit("clickPage")
			},
			clickScroll() {
				if (this.operationState) {
					this.getScreen()
					this.operationState = false
				}
			},
			getScreen() {
				this.scrollHeight = this.screenHeight - 111;
			},
			getEle(){
				// console.log(plus.navigator.getStatusbarHeight());
				uni.createSelectorQuery().select(".reply-msg").boundingClientRect((val) => {
					// this.bottomBarHeight = val.height
					console.log(val.height);
				}).exec();
			},
			moreAction() {
				if (this.operationState) {
					this.getScreen()
					this.operationState = false
				} else {
					this.scrollHeight = this.screenHeight - 271
					this.operationState = true
					this.listItem = null
					if (this.msgList.length === 0) return false
					setTimeout(() => this.listItem = this.msgList[this.msgList.length - 1].positionId, 100)
				}
			},
			imageOrVideo(index) {
				if (index === 0) {
					this.album();
				} else {
					uni.chooseVideo({
						sourceType: ["album"],
						success: (res) => {
							const thumbPath = getAndroidVideoThumb(res.tempFilePath)
							const suffixIndex = res.tempFilePath.lastIndexOf(".") + 1
							const suffix = res.tempFilePath.slice(suffixIndex)

							const fullPath = plus.io.convertLocalFileSystemURL(res.tempFilePath)
							const snapshotFullPath = plus.io.convertLocalFileSystemURL(thumbPath)
							let newVideoMessage = _this.$openSdk.createVideoMessageFromFullPath(fullPath,
								suffix, res.duration,
								snapshotFullPath);


							const clientMsgID = _this.$openSdk.sendMessage(
								newVideoMessage,
								_this.recvID,
								_this.groupID,
								false
							);
							let newVideoMessage2 = JSON.parse(newVideoMessage)
							newVideoMessage2.clientMsgID = clientMsgID
							newVideoMessage2.localFlag = 1
							_this.myList.push(newVideoMessage2)
							_this.msgList.push(newVideoMessage2)
						},
					});
				}
			},
			album() {
				uni.chooseImage({
					count: 9,
					sizeType: ["original", "compressed"],
					sourceType: ["album"],
					success: function(res) {
						for (let i = 0; i < res.tempFilePaths.length; i++) {
							const tempFilePath = res.tempFilePaths[i];
							const fullPath = plus.io.convertLocalFileSystemURL(tempFilePath)
							let newImgMessage = _this.$openSdk.createImageMessageFromFullPath(fullPath);
							const clientMsgID = _this.$openSdk.sendMessage(
								newImgMessage,
								_this.recvID,
								_this.groupID,
								false
							);
							let newImgMessage2 = JSON.parse(newImgMessage)
							newImgMessage2.clientMsgID = clientMsgID
							newImgMessage2.localFlag = 1
							_this.myList.push(newImgMessage2)
							_this.msgList.push(newImgMessage2);
						}
					},
				});
			},
			clickShot() {
				uni.chooseImage({
					sizeType: ["original", "compressed"],
					sourceType: ["camera"],
					success: function(res) {
						const tempFilePaths = res.tempFilePaths[0];
						const fullPath = plus.io.convertLocalFileSystemURL(tempFilePaths)
						console.log(fullPath);
						let newImgMessage = _this.$openSdk.createImageMessageFromFullPath(fullPath);
						const clientMsgID = _this.$openSdk.sendMessage(
							newImgMessage,
							_this.recvID,
							_this.groupID,
							false
						);
						let newImgMessage2 = JSON.parse(newImgMessage)
						newImgMessage2.clientMsgID = clientMsgID
						newImgMessage2.localFlag = 1
						_this.myList.push(newImgMessage2)
						_this.msgList.push(newImgMessage2);
					},
				});
			},
			async voice() {
				const num = await requestAndroidPermission("android.permission.RECORD_AUDIO")
				this.showMask = true
			},
			sendTextMsg() {
				if (this.inputValue) {
					let newTextMessage
					if (this.atStatus && this.inputValue.indexOf('@') > -1) {
						let atList = []
						this.atUserId.forEach(user => {
							if (this.inputValue.indexOf('@' + user.name) > -1) atList.push(user.id)
						})
						console.log(atList);
						newTextMessage = this.$openSdk.createTextAtMessage(this.inputValue,atList)
					} else {
						if(this.replyStatus){
							newTextMessage = this.$openSdk.createQuoteMessage(this.inputValue,JSON.stringify(this.replyMsg))
						}else{
							newTextMessage = this.$openSdk.createTextMessage(
								this.inputValue
							);
						}
						
					}
					// console.log(newTextMessage);
					const clientMsgID = this.$openSdk.sendMessage(
						newTextMessage,
						_this.recvID,
						_this.groupID,
						false
					);
					console.log(clientMsgID);
					let newTextMessage2 = JSON.parse(newTextMessage)
					newTextMessage2.clientMsgID = clientMsgID
					this.inputValue = "";
					this.myList.push(newTextMessage2)
					this.msgList.push(newTextMessage2);
					this.atStatus = false
					this.atUserId = []
				}
			},
			atOne(item) {
				if (this.recvID) return false
				this.atStatus = true
				this.atUserId.push({
					id: item.sendID,
					name: item.senderNickName
				})
				this.inputValue += `@${item.senderNickName} `
			},
			sendVoice() {
				if (this.voicePath == "") return false
				// const tmpPath = this.voicePath.slice(4);
				// const contactPath = ".." + tmpPath;
				// let newVoiceMessage = _this.$openSdk.createSoundMessage(contactPath, this.intervalTime);

				const fullPath = plus.io.convertLocalFileSystemURL(this.voicePath)
				let newVoiceMessage = _this.$openSdk.createSoundMessageFromFullPath(fullPath, this.intervalTime);
				const clientMsgID = _this.$openSdk.sendMessage(
					newVoiceMessage,
					_this.recvID,
					_this.groupID,
					false
				);
				let newVoiceMessage2 = JSON.parse(newVoiceMessage)
				newVoiceMessage2.clientMsgID = clientMsgID
				newVoiceMessage2.localFlag = 1
				newVoiceMessage2.soundElem.uuid = new Date().getTime()
				this.myList.push(newVoiceMessage2)
				this.msgList.push(newVoiceMessage2)
				this.intervalTime = 0
				this.showMask = false
			},
			cancelVoice() {
				this.showMask = false
				this.voicePath = ""
				this.intervalTime = 0
			},
			startTouch() {
				console.log('startTouch')
			},
			startSpeack() {
				this.timer = setInterval(() => {
					_this.intervalTime += 0.5;
					if (_this.intervalTime >= 0.5 && !_this.isRecord) {
						_this.isRecord = true;
						_this.intervalTime = 0;
						recorderManager.start({
							format: "wav"
						});
					}
				}, 500);
			},
			stopSpeack() {
				if (this.intervalTime <= 0.5) {
					console.log("short voice!!!");
				}
				clearInterval(this.timer);
				if (this.isRecord) {
					setTimeout(() => {
						recorderManager.stop();
						_this.isRecord = false;
					}, 500);
				}
			},
			marAsRead() {
				if (this.recvID) {
					this.$openSdk.markSingleMessageHasRead(this.recvID, data => {
						console.log(data);
					})
				} else {
					this.$openSdk.markGroupMessageHasRead(this.groupID, data => {
						console.log(data);
					})
				}
			},
			markC2CRead(receiverID,msgIDList) {
				if(receiverID === "") return
				this.$openSdk.markC2CMessageAsRead(receiverID, msgIDList, (data) => {
					console.log(data);
				})
			},
			setTypingStatus(receiverID,msgTip) {
				this.$openSdk.typingStatusUpdate(receiverID, msgTip)
			},
			getTypingStatus() {
				this.tip = 'typing...'
				if(this.typingTimer!=null) clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(() => {
					this.tip = ''
				},3000)
			},
			delMsgListen() {
				uni.$on("deleteMsg", ({
					msgId,
					isRevoke
				}) => {
					const delIndex = this.msgList.findIndex(m => m.clientMsgID == msgId)
					this.msgList.splice(delIndex, 1)
					if (isRevoke) {
						const revokeItem = {
							contentType:111,
							sendID:this.vuex_user_info.uid,
							positionId:"msg" + randomString(19)
							}
						this.msgList.push(revokeItem)
						this.$u.toast("revoke msg")
					} else {
						this.$u.toast("delete success")
					}
				})
			},
			reSendListen() {
				uni.$on("reSend", (item) => {
					console.log(item);
					const clientMsgID = _this.$openSdk.sendMessage(
						JSON.stringify(item),
						_this.recvID,
						_this.groupID,
						false
					);
					const idx = this.msgList.findIndex(msg => msg.clientMsgID === item.clientMsgID)
					item.localFlag = 1
					this.msgList.splice(idx, 1)
					this.myList.push(item)
					this.msgList.push(item)
					console.log(clientMsgID);
					// this.msgList.findIndex(msg=>msg.)
				})
			},
			replayListen(){
				uni.$on('replyMsg',msgContent => {
					this.replyMsg = msgContent.content
					this.replyStatus = true;
				})
			},
			setDraft() {
				if (this.conversationID) {
					this.$openSdk.setConversationDraft(this.conversationID, this.inputValue, (data) => {
						console.log(data);
					})
				}
			},
			getMemberList() {
				if (this.groupID == "") return false
					this.$openSdk.getGroupMemberList(this.groupID, 0, 0, (data) => {
						if(data.err==undefined){
							this.groupMemberList = JSON.parse(data.msg).data
						}
					})
			},
		},
		watch: {
			msgList: {
				handler(val, oldVal) {
					if (val.length === 0) return false
					if (!val[val.length - 1].positionId) {
						val[val.length - 1].positionId = "msg" + randomString(19)
					}
					setTimeout(() => this.listItem = val[val.length - 1].positionId, 200)
				},
				deep: true
			},
			inputValue(newVal,oldVal){
				if(this.inputTimer==null){
					this.inputTimer = setTimeout(()=>{
						this.setTypingStatus(this.vuex_conversation.userID,"yes")
						this.inputTimer = null
					},1500)
				}
			}
		},
		beforeMount() {
			this.screenHeight = uni.getSystemInfoSync().safeArea.height
			this.recvID = this.vuex_conversation.userID || ""
			this.groupID = this.vuex_conversation.groupID || ""
			this.conversationID = this.vuex_conversation.conversationID
			this.getMemberList()
			this.getScreen()
			this.delMsgListen()
			this.reSendListen()
			this.replayListen()
			this.getHistoryMessageList(null);
			this.newMsgListener();
			this.sendMessageListener()
			// this.marAsRead()
		},
		onLoad: function(options) {
			_this = this
			if (options.draft) this.inputValue = options.draft
			recorderManager.onStop(function(res) {
				_this.voicePath = res.tempFilePath;
			});
		},
		onUnload() {
			this.setDraft()
			this.marAsRead()
		}
	}
</script>

<style lang="scss">
	page{
		overflow-y: hidden;
	}
	/deep/.u-slot-content {
		justify-content: center;
	}

	.slot-wrap {
		display: flex;
		align-items: center;

		.nick-title {
			text-align: center;
			font-size: 36rpx;

			.user-status {
				font-size: 20rpx;
			}
		}
	}

	.slot-right {
		padding: 14rpx 26rpx 14rpx 14rpx;
	}

	.bottom-bar {
		height: 67px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		
		
		.reply-msg{
			padding-left: 24rpx;
			height: 20px;
			background-color: #e8f2ff;
		}

		.bar-list {
			display: flex;
			align-items: center;
			justify-content: space-around;
			padding: 16rpx 0;
			background-color: #e8f2ff;

			.bottom-input {
				background-color: #FFFFFF;
				border-radius: 12rpx;
				// height: 56rpx;
			}

			.bottom-btn {
				color: #FFFFFF;
				background-color: #1b72ec;
				font-size: 28rpx;
				margin-right: 16rpx;
			}

			.u-icon {
				margin: 0 16rpx;
			}
		}
	}

	.chat-list {
		// height: calc(100vh - 202rpx);
		background-color: #FFFFFF;

		.agree-msg {
			height: 80rpx;
			padding: 24rpx;
			// line-height: 80rpx;
			text-align: center;
			font-size: 24rpx;
			color: #e5e5e5;
		}
	}

	.mask-warp {
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;

		.voice-icon-box {
			position: relative;
			width: 192px;
			height: 110px;
			background-color: white;
			margin-top: 40vh;
			text-align: center;
			line-height: 110px;

			.icon-item {
				width: 104px;
				height: 28px;
			}

			.interval-time {
				position: absolute;
				top: 24px;
				left: 50%;
				transform: translateX(-50%);
			}

			.bottom-icon {
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				width: 0;
				height: 0;
				border: 30rpx solid;
				border-color: white transparent transparent transparent;
			}
		}

		.btn-list {
			.action-btn {
				// margin: 10vh 0 3vh 0;
				margin-top: 10vh;
				width: 80vw;
				display: flex;
				justify-content: space-between;

				uni-button {
					margin: 0;
				}
			}
			
			.press-btn {
				margin-top: 5vh;
				text-align: center;
				background-color: #1B72EC;
				color: #FFFFFF;
				padding-top: 8px;
				padding-bottom: 8px;
				border-radius: 4px;
			}
		}
	}
</style>
