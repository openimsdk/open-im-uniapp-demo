<template>
	<view @click.stop="clickPage" class="chat-box">
		<view class="chat-content">
			<u-navbar>
				<view class="slot-wrap">
					<view class="nick-title">
						<text>{{vuex_conversation.showName||vuex_conversation.groupName||vuex_conversation.userID}}</text>
						<view v-if="groupID==''" class="user-status">
							<text>Mobile Online</text>
							<u-icon name="arrow-right" size="14" />
						</view>
					</view>
				</view>
				<view slot="right" class="slot-right">
					<u-icon @click="rightSet" name="more-dot-fill" size="48" />
				</view>
			</u-navbar>
			<scroll-view refresher-enabled refresher-default-style="white" :refresher-triggered="refresherState" @refresherabort="refreshAbort" @refresherrestore="refreshFnish" @refresherrefresh="refreshStart" @click="clickScroll" :scroll-into-view="listItem" :style="{height:scrollHeight+'px'}"
				class="chat-list" scroll-y>
				<template v-for="msg in msgList">
					<view :id="msg.positionId" v-if="!(contentTypeFilter(msg.contentType))" class="agree-msg">
						<text>{{JSON.parse(msg.content).defaultTips}}</text>
					</view>
					<OtherMsg v-if="msg.sendID!==vuex_user_info[0].uid&&!msg.isDelete&&contentTypeFilter(msg.contentType)" :msg="msg" :key="msg.positionId"
						:id="msg.positionId" @atOne="atOne" />
					<MyMsg v-if="msg.sendID==vuex_user_info[0].uid&&!msg.isDelete&&contentTypeFilter(msg.contentType)" :msg="msg" :key="msg.positionId"
						:id="msg.positionId" />
				</template>
			</scroll-view>
			<view class="bottom-bar">
				<view class="bar-list">
					<u-icon @click="voice" size="51" name="../../static/voice.png" />
					<u-input @focus="focusInput" v-model="inputValue" height="58" placeholder="" class="bottom-input"/>
					<u-icon @click="moreAction" size="51" name="../../static/moreOperation.png" />
					<u-button class="bottom-btn" size="mini" @click="sendTextMsg">Send</u-button>
				</view>
			</view>
			<view v-show="operationState" class="more-operation">
				<view @click="clickShot" class="operation-item">
					<u-icon size="51" name="../../static/camera.png" />
					<text>shot</text>
				</view>
				<view @click="clickAlbum" class="operation-item">
					<u-icon size="51" name="../../static/album.png" />
					<text>album</text>
				</view>
			</view>

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
					<view class="press-btn" @touchstart="startSpeack" @touchend="stopSpeack">long press when speacking
					</view>
				</view>
			</view>
		</u-mask>

		<u-action-sheet cancel-text="cancel" @click="imageOrVideo" :list="actionList" v-model="actionShow"></u-action-sheet>
	</view>
</template>

<script>
	import OtherMsg from "./comps/OtherMsg.vue"
	import MyMsg from "./comps/MyMsg.vue"
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
				tmpStr:"You have successfully become friends, so start chatting",
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
						text: "picture",
					},
					{
						text: "video",
					},
				],
				percent: 0,
				timer: null,
				isRecord: false,
				intervalTime: 0,
				voicePath: "",
				myList: [],
				conversationID:"",
				groupID:"",
				groupInfo:{},
				groupMemberList:[],
				refresherState:false,
				refreshing:false,
				atUserId:[],
				atStatus:false
			}
		},
		computed: {
			intIntervalTime() {
				return Math.round(this.intervalTime);
			},
		},
		components: {
			OtherMsg,
			MyMsg
		},
		methods: {
			contentTypeFilter(type){
				const msgTypeList = [101,102,103,104,106]
				return msgTypeList.indexOf(type)>-1
			},
			refreshStart(){
				console.log(this.refreshing);
				if(this.refreshing) return false
				this.refreshing = true
				if(!this.refresherState) this.refresherState = true
				console.log('refreshStart');
				this.getHistoryMessageList(this.msgList[0])
			},
			refreshFnish(){
				console.log('refreshFnish');
				// this.refresherState = "restore"
				// this.refreshing = false
			},
			refreshAbort(){
				console.log('refreshAbort');
			},
			rightSet() {
				if(this.recvID){
					uni.navigateTo({
						url: '/pages/conversation/setFriend'
					});
				}else{
					uni.navigateTo({
						url: '/pages/conversation/Group/setsGroup'
					});
				}
			},
			focusInput() {
				if (this.operationState){
					this.getScreen()
					this.operationState = false
				}
			},
			clickAlbum() {
				this.actionShow = true
			},
			getHistoryMessageList(start) {
				let reqData = {
					groupID: this.vuex_conversation.groupID||"",
					startMsg: start,
					count: 12,
					userID: this.vuex_conversation.userID||""
				};
				console.log(reqData);
				this.$openSdk.getHistoryMessageList(JSON.stringify(reqData), data => {
					const tmpArr = JSON.parse(data.msg)
					console.log(tmpArr);
					// const msgTypeList = [101, 102, 103, 104,201]
					// let newArr = tmpArr.filter(m => msgTypeList.includes(m.contentType))
					// newArr.forEach(m => m.positionId = "msg" + randomString(19))
					tmpArr.forEach(m => m.positionId = "msg" + randomString(19))
					this.msgList = [...tmpArr,...this.msgList]
					this.refresherState = false
					this.refreshing = false
					// this.getMemberList()
				})
			},

			newMsgListener() {
				this.$globalEvent.addEventListener("onRecvNewMessage", (params) => {
					let res = JSON.parse(params.msg)
					console.log(res);
					if (res.recvID === this.vuex_user_info[0].uid || res.recvID === this.groupID) this.msgList.push(res);
				});
			},
			sendMessageListener() {
				this.$globalEvent.addEventListener("sendMessageSuccess", (params) => {
					const res = JSON.parse(params.msg);
					_this.myList.forEach(myMsg => {
						if (myMsg.clientMsgID == res.clientMsgID && myMsg.contentType == 101) {
							const tmpArr = Object.assign([], _this.msgList)
							const reversIndex = tmpArr.findIndex(t => t.clientMsgID == myMsg.clientMsgID)
							_this.msgList[reversIndex].status = 2
						}
					})
				});
				this.$globalEvent.addEventListener("sendMessageFailed", (params) => {
					const res = JSON.parse(params.msg);
					_this.myList.forEach(myMsg => {
						if (myMsg.clientMsgID == res.clientMsgID) {
							const tmpArr = Object.assign([], _this.msgList)
							const reversIndex = tmpArr.findIndex(t => t.clientMsgID == myMsg.clientMsgID)
							_this.msgList[reversIndex].status = 3
						}
					})
				});
				this.$globalEvent.addEventListener("sendMessageProgress", (params) => {
					const res = JSON.parse(params.msg)
					// _this.myList.forEach(myMsg=>{
					// 	if(myMsg.clientMsgID==res.clientMsgID){
					// 		const tmpArr = Object.assign([],_this.msgList)
					// 		const reversIndex = tmpArr.findIndex(t=>t.clientMsgID==myMsg.clientMsgID)
					// 		_this.msgList[reversIndex].percent = params.percent
					// 	}
					// })
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
				this.scrollHeight = uni.getSystemInfoSync().safeArea.height - 109
			},
			moreAction() {
				if (this.operationState) {
					this.getScreen()
					this.operationState = false
				} else {
					this.scrollHeight = uni.getSystemInfoSync().safeArea.height - 209
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
							console.log(res.tempFilePath);
							console.log(res.duration);
							const thumbPath = getAndroidVideoThumb(res.tempFilePath)
							const fileIndex = res.tempFilePath.indexOf("__UNI__C117447") + 14
							const thumbIndex = thumbPath.indexOf("__UNI__C117447") + 14
							const suffixIndex = res.tempFilePath.lastIndexOf(".") + 1
							const suffix = res.tempFilePath.slice(suffixIndex)
							let url = res.tempFilePath.slice(fileIndex)
							url = '../..' + url
							const snapshot = '../..' + thumbPath.slice(thumbIndex)
							let newVideoMessage = _this.$openSdk.createVideoMessage(url, suffix, res.duration,
								snapshot);
								console.log(newVideoMessage);
							const clientMsgID = _this.$openSdk.sendMessage(
								newVideoMessage,
								_this.recvID,
								_this.groupID,
								false
							);
							let newVideoMessage2 = JSON.parse(newVideoMessage)
							console.log(newVideoMessage2);
							newVideoMessage2.clientMsgID = clientMsgID
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
							const tmpPath = tempFilePath.slice(4);
							const contactPath = ".." + tmpPath;
							let newImgMessage = _this.$openSdk.createImageMessage(contactPath);
							const clientMsgID = _this.$openSdk.sendMessage(
								newImgMessage,
								_this.recvID,
								_this.groupID,
								false
							);
							let newImgMessage2 = JSON.parse(newImgMessage)
							newImgMessage2.clientMsgID = clientMsgID
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
						const tmpPath = tempFilePaths.slice(4);
						const contactPath = ".." + tmpPath;
						let newImgMessage = _this.$openSdk.createImageMessage(contactPath);
						const clientMsgID = _this.$openSdk.sendMessage(
							newImgMessage,
							_this.recvID,
							_this.groupID,
							false
						);
						let newImgMessage2 = JSON.parse(newImgMessage)
						newImgMessage2.clientMsgID = clientMsgID
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
					if(this.atStatus){
						newTextMessage = this.$openSdk.createTextAtMessage(this.inputValue,JSON.stringify(this.atUserId))
					}else{
						newTextMessage = this.$openSdk.createTextMessage(
							this.inputValue
						);
					}
					console.log(newTextMessage);
					const clientMsgID = this.$openSdk.sendMessage(
						newTextMessage,
						_this.recvID,
						_this.groupID,
						false
					);
					// console.log(clientMsgID);
					let newTextMessage2 = JSON.parse(newTextMessage)
					newTextMessage2.clientMsgID = clientMsgID
					this.inputValue = "";
					this.myList.push(newTextMessage2)
					this.msgList.push(newTextMessage2);
					this.atStatus = false
					this.atUserId = []
				}
			},
			atOne(item){
				console.log(222222222);
				this.atStatus = true
				this.atUserId.push(item.sendID)
				this.inputValue += `@${item.senderNickName} `
			},
			sendVoice() {
				if (this.voicePath == "") return false
				const tmpPath = this.voicePath.slice(4);
				const contactPath = ".." + tmpPath;
				let newVoiceMessage = _this.$openSdk.createSoundMessage(contactPath, this.intervalTime);
				const clientMsgID = _this.$openSdk.sendMessage(
					newVoiceMessage,
					_this.recvID,
					_this.groupID,
					false
				);
				let newVoiceMessage2 = JSON.parse(newVoiceMessage)
				newVoiceMessage2.clientMsgID = clientMsgID
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
				if(this.recvID){
					this.$openSdk.markSingleMessageHasRead(this.recvID, data => {
						console.log(data);
					})
				}else{
					this.$openSdk.markGroupMessageHasRead(this.groupID, data => {
						console.log(data);
					})
				}
			},
			delMsgListen() {
				uni.$on("deleteMsg", ({
					id,
					isRevoke
				}) => {
					const delIndex = this.msgList.findIndex(m => m.positionId == id)
					this.msgList.splice(delIndex, 1)
					if (isRevoke) {
						this.$u.toast("revoke msg")
					} else {
						this.$u.toast("delete success")
					}
				})
			},
			reSendListen() {
				uni.$on("reSend", (item) => {
					console.log(item);
				})
			},
			setDraft(){
				if(this.conversationID){
					this.$openSdk.setConversationDraft(this.conversationID,this.inputValue,(data)=>{
						console.log(data);
					})
				}
			},
			getMemberList() {
				if(this.groupID=="") return false
				this.$openSdk.getGroupMemberList(this.groupID, 0, 0, (data) => {
					const tmpArr = JSON.parse(data.msg).data
					this.groupMemberList = tmpArr
					this.msgList.forEach(msg=>{
						this.groupMemberList.forEach(member=>{
							if(msg.sendID===member.userId){
								msg.senderNickName = member.nickName
								msg.senderFaceUrl = member.faceUrl
							}
						})
					})
					console.log(this.msgList);
				})
			},
		},
		watch: {
			msgList: {
				handler(val, oldVal) {
					if (val.length === 0) return false
					if (!val[val.length - 1].positionId) {
						val[val.length - 1].positionId = "msg" + randomString(19)
						console.log(val[val.length - 1]);
					}
					setTimeout(() => this.listItem = val[val.length - 1].positionId, 200)
				},
				deep: true
			}
		},
		beforeMount() {
			this.recvID = this.vuex_conversation.userID||""
			this.groupID = this.vuex_conversation.groupID||""
			this.conversationID = this.vuex_conversation.conversationID
			this.getScreen()
			this.delMsgListen()
			this.reSendListen()
			this.getHistoryMessageList(null);
			this.newMsgListener();
			this.sendMessageListener()
			this.marAsRead()
		},
		onLoad: function(options) {
			_this = this
			if(options.draft)this.inputValue = options.draft
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
		max-height: 57px;
		.bar-list{
			display: flex;
			align-items: center;
			justify-content: space-around;
			background-color: #e8f2ff;
			padding: 16rpx 0;
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
		.agree-msg{
			    height: 80rpx;
			    line-height: 80rpx;
			    text-align: center;
			    font-size: 24rpx;
			    color: #e5e5e5;
		}
	}

	.more-operation {
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: space-around;

		.operation-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.u-icon {
				margin-bottom: 12rpx;
			}
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
				margin: 10vh 0 3vh 0;
				display: flex;
				justify-content: space-between;

				uni-button {
					margin: 0;
				}
			}
		}

		.press-btn {
			background-color: #1B72EC;
			color: #FFFFFF;
			padding: 8px 14px;
			border-radius: 4px;
		}
	}
</style>
