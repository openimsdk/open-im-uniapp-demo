<template>
	<view @click="pageClick" id="home">
		<view class="head">
			<text class="title">EEchat</text>
			<HeaderModal :showOperationsMenu="showOperationsMenu" @controlDisplay="controlDisplay" />
		</view>
		<view class="main">
			<view class="chatList">
				<u-empty v-if="sessionList.length===0" class="empty" text="There is no conversation" mode="message"/>
				<ConversationIist v-else :sessionList="sessionList" />
			</view>
		</view>
	</view>
</template>

<script>
	import HeaderModal from '@/components/HeaderModal/HeaderModal.vue'
	import ConversationIist from './comps/ConversationIist.vue'
	export default {
		data() {
			return {
				sessionList: [],
				userInfo: null,
				startData: {},
				isLatestSeq: true,
				addNewMessage: false,
				showOperationsMenu: false,
				listener: null,
			};
		},
		components: {
			HeaderModal,
			ConversationIist
		},
		methods: {
			pageClick() {
				console.log("pageClick");
				if (this.showOperationsMenu) this.showOperationsMenu = false
			},
			setConversationListener() {
				let _this = this;
				_this.$globalEvent.addEventListener("onNewConversation", (params) => {
					let res = JSON.parse(params.msg);
					res.forEach((r) => (r.latestMsg = JSON.parse(r.latestMsg)));
					_this.sessionList = res.concat(_this.sessionList);
				});
				_this.$globalEvent.addEventListener("onConversationChanged", (params) => {
					let res = JSON.parse(params.msg);
					console.log(res);
					if (res) {
						res.forEach((r) => {
							if (r.latestMsg !== "") {
								r.latestMsg = JSON.parse(r.latestMsg)
							}
						});
						_this.sessionList = res;
					}
				});
				_this.$globalEvent.addEventListener(
					"onTotalUnreadMessageCountChanged",
					(params) => {
						_this.getTotalUnreadMsgCount();
					}
				);
				_this.$globalEvent.addEventListener("onSyncServerStart", (params) => {
					console.log(params.msg);
				});
				_this.$globalEvent.addEventListener("onSyncServerFailed", (params) => {
					console.log(params.msg);
				});
				_this.$globalEvent.addEventListener("onSyncServerFinish", (params) => {
					console.log(params.msg);
				});
			},
			getAllConversationListList() {
				this.$openSdk.getAllConversationList((data) => {
					let tmpList = JSON.parse(data.msg);
					console.log(tmpList);
					for (let i = 0; i < tmpList.length; i++) {
						if (tmpList[i].latestMsg !== '') {
							tmpList[i].latestMsg = JSON.parse(tmpList[i].latestMsg);
							tmpList[i].isShow = false;
						}
					}
					this.sessionList = tmpList;
					uni.stopPullDownRefresh()
					// console.log(this.sessionList);
				});
			},
			getTotalUnreadMsgCount() {
				this.$openSdk.getTotalUnreadMsgCount((data) => {
					if (data.msg) {
						if (Number(data.msg) > 0) {
							uni.setTabBarBadge({
								index: 0,
								text: data.msg > 99 ? "99+" : data.msg,
							});
						} else {
							uni.removeTabBarBadge({
								index: 0,
							});
						}
					}
				});
			},
			controlDisplay() {
				this.showOperationsMenu = !this.showOperationsMenu;
			},
			
			getGroupList(){
				this.$openSdk.getJoinedGroupList(data=>{
					const originalList = JSON.parse(data.msg)
					this.$u.vuex('vuex_group_list',originalList)
				})
			},
			groupListner(){
				this.$globalEvent.addEventListener("onGroupInfoChanged", (params) => {
					console.log('onGroupInfoChanged-------------------');
					const tmpData = JSON.parse(params.msg)
					console.log(tmpData);
					this.getGroupList()
					// const tmpInfo = JSON.parse(tmpData.groupInfo)
					// for(let i=0;i<this.originalList.length;i++){
					// 	console.log(this.originalList[i].groupID);
					// 	console.log(tmpData.groupId);
					// 	if(this.originalList[i].groupID===tmpData.groupId){
					// 		this.originalList[i] = {...this.originalList[i],...tmpInfo}
					// 		this.groupList[0].data = this.originalList
					// 	}
					// }
				});
				this.$globalEvent.addEventListener("onApplicationProcessed", (params) => {
					console.log('onApplicationProcessed----------');
					console.log(params);
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onMemberEnter", (params) => {
					console.log('onMemberEnter----------');
					console.log(params);
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onGroupCreated", (params) => {
					console.log('onGroupCreated----------');
					console.log(params);
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onMemberKicked", (params) => {
					console.log('onMemberKicked----------');
					console.log(params);
					// this.getGroupList()
				});
				uni.$on('quitGroup',()=>{
					this.getGroupList()
				})
			}
		},
		onHide() {
			if (this.showOperationsMenu) this.showOperationsMenu = false
		},
		onPullDownRefresh(){
			this.getAllConversationListList()
		},
		beforeMount() {
			this.setConversationListener();
			this.getAllConversationListList();
			this.getTotalUnreadMsgCount();
			this.getGroupList()
		},
	};
</script>

<style lang="scss" scoped>
	#home {
		position: relative;

		.head {
			position: fixed;
			z-index: 99;
			width: 100%;
			height: 90rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.15);

			.title {
				font-size: 44rpx;
				font-weight: 500;
				color: #1b72ec;
				line-height: 90rpx;
				margin-left: 44rpx;
			}

			.headRight {
				.headIcon {
					width: 48rpx;
					height: 48rpx;
					margin-right: 40rpx;
				}

				.my-menuCon {
					z-index: 99;
					position: absolute;
					top: 86rpx;
					right: 1.5%;
					display: flex;
					flex-direction: column;

					&::after {
						content: "";
						position: absolute;
						top: -36rpx;
						right: 36rpx;
						border: 20rpx solid;
						border-color: transparent transparent #1b72ec transparent;
					}

					.operationsMenu {
						background-color: #1b72ec;
						box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.5);
						border-radius: 18rpx;
						padding: 24rpx;

						.operationsMenu-item {
							display: flex;
							align-items: center;
							font-size: 30rpx;
							font-weight: 600;
							color: #ffffff;

							&:nth-child(2) {
								padding: 24rpx 0;
							}

							.itemImg {
								width: 36rpx;
								height: 36rpx;
								margin-right: 24rpx;
							}
						}
					}
				}
			}
		}

		.main {
			padding-top: 90rpx;
			// padding-bottom: 120rpx;

			.chatList {
				margin-top: 6rpx;
				.empty{
					padding-top: 120rpx;
				}
			}
		}
	}
</style>
