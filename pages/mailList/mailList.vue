<template>
	<view @click="pageClick" id="mailList">
		<view class="head">
			<text class="title">mail list</text>
			<HeaderModal :showOperationsMenu="showOperationsMenu" @controlDisplay="controlDisplay"/>
		</view>
		<view class="newFriend" @click="goNewFriends">
			<view class="newFriendMain">
				<image src="../../static/newFriend.png" mode="" class="newFriendIcon"></image>
				<text class="newFriendText">New friends</text>
			</view>
			<view v-if="application>0" class="newFriendNumber">
				{{application}}
			</view>
		</view>
		<view class="newFriend" @click="goNewGroup">
			<view class="newFriendMain">
				<image src="../../static/group_notification.png" mode="" class="newFriendIcon"></image>
				<text class="newFriendText">Group notification</text>
			</view>
			<view v-if="groupApplication>0" class="newFriendNumber">
				{{groupApplication}}
			</view>
		</view>
		<view class="newFriend" @click="goGroupList">
			<view class="newFriendMain">
				<image src="../../static/group_list.png" mode="" class="newFriendIcon"></image>
				<text class="newFriendText">Group list</text>
			</view>
		</view>
		<u-empty v-if="originalList.length===0" class="empty" text="There is no contact" mode="list"/>
		<uni-indexed-list v-else :options="friendList" :showSelect="false" @click="bindClick"></uni-indexed-list>
	</view>
</template>

<script>
	import HeaderModal from '@/components/HeaderModal/HeaderModal.vue'
	export default {
		data() {
			return {
				// Initials: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
				// 	'T',
				// 	'U', 'V', 'W', 'X', 'Y', 'Z'
				// ],
				Initials: ['#'],
				friendList: [],
				originalList: [],
				groupList:[],
				applicationList: [],
				groupApplicationList: [],
				application: 0,
				groupApplication:0,
				showOperationsMenu: false,
			}
		},
		components:{
			HeaderModal
		},
		methods: {
			launchGroup(){
				uni.navigateTo({
					url:"/pages/conversation/Group/launchGroup?type=launch"
				})
			},
			addNewGroup(){
				uni.navigateTo({
					url:"/pages/mailList/addFriend?from=group"
				})
			},
			getMailList() {
				this.$openSdk.getFriendList((data) => {
					this.originalList = JSON.parse(data.msg)
					console.log(this.originalList);
					this.$u.vuex('vuex_mail_list',this.originalList)
					this.friendList = [{
						letter: "#",
						data: this.originalList
					}]
					uni.stopPullDownRefresh()
					// this.initMailList()
				})
			},
			// initMailList(){
			// 	this.friendList = [{
			// 		letter: "#",
			// 		data: [...this.originalList,...this.groupList]
			// 	}]
			// 	uni.stopPullDownRefresh()
			// 	console.log(this.friendList);
			// },
			getGroupList(){
				this.$openSdk.getJoinedGroupList(data=>{
					this.groupList = JSON.parse(data.msg)
					this.$u.vuex('vuex_group_list',this.groupList)
					// this.initMailList()
				})
			},
			getFriendApplicationList() {
				this.$openSdk.getFriendApplicationList((data) => {
					this.applicationList = JSON.parse(data.msg)
					const tmpArr = this.applicationList.filter(a => a.flag === 0)
					this.application = tmpArr.length
					const totalNum = this.groupApplication + this.application
					if(totalNum===0){
						uni.removeTabBarBadge({
							index: 1,
						});
					}else{
						uni.setTabBarBadge({
							index: 1,
							text: totalNum > 99 ? "99+" : totalNum+"",
						});
					}
				})
			},
			getGroupApplicationList(){
				this.$openSdk.getGroupApplicationList((data) => {
					const tmpInfo = JSON.parse(data.msg)
					this.groupApplicationList = tmpInfo.user;
					const tmpArr = this.groupApplicationList.filter(a => a.flag === 0)
					this.groupApplication = tmpArr.length;
					const totalNum = this.groupApplication + this.application
					if(totalNum===0){
						uni.removeTabBarBadge({
							index: 1,
						});
					}else{
						uni.setTabBarBadge({
							index: 1,
							text: totalNum > 99 ? "99+" : totalNum+"",
						});
					}
				})
			},
			bindClick(item) {
				this.pageClick()
				let newItem = item.item.name
				newItem.userID = newItem.uid
				newItem.conversationID = 'single_'+newItem.uid
				this.$u.vuex('vuex_conversation', newItem)
				this.$u.vuex('vuex_conversation_user', newItem.uid)
				uni.navigateTo({
					url: "/pages/conversation/chatWin",
				});
			},
			controlDisplay() {
				this.showOperationsMenu = !this.showOperationsMenu
			},
			pageClick() {
				console.log("pageClick1");
				if(this.showOperationsMenu) this.showOperationsMenu = false
			},
			goSearch() {
				uni.navigateTo({
					url: '/pages/mailList/searchFriend?list=' + JSON.stringify(this.originalList)
				});
			},
			goAddFriend() {
				uni.navigateTo({
					url: '/pages/mailList/addFriend?from=single'
				});
				this.showOperationsMenu = false
			},
			goNewFriends() {
				uni.navigateTo({
					url: '/pages/mailList/newFriends?list=' + JSON.stringify(this.applicationList)
				});
			},
			goNewGroup(){
				uni.navigateTo({
					url: '/pages/mailList/groupNotification?list=' + JSON.stringify(this.groupApplicationList)
				});
			},
			goGroupList(){
				uni.navigateTo({
					url: '/pages/mailList/groupList'
				});
			},
			friendsListener() {
				this.$globalEvent.addEventListener(
					"onFriendApplicationListAdded",
					(params) => {
						this.getFriendApplicationList()
					}
				);
				this.$globalEvent.addEventListener(
					"onFriendInfoChanged",
					(params) => {
						console.log('onFriendInfoChanged```````````````');
						this.getMailList()
					}
				);
				this.$globalEvent.addEventListener("onFriendListAdded", (params) => {
					console.log(params);
					this.getMailList()
				});
				this.$globalEvent.addEventListener("onFriendListDeleted", (params) => {
					console.log(params);
					this.getMailList()
				});
				
			},
			groupListner(){
				// this.$globalEvent.addEventListener("onGroupInfoChanged", (params) => {
				// 	console.log('onGroupInfoChanged-------------------');
				// 	const tmpData = JSON.parse(params.msg)
				// 	console.log(tmpData);
				// 	const tmpInfo = JSON.parse(tmpData.groupInfo)
				// 	for(let i=0;i<this.groupList.length;i++){
				// 		console.log(this.groupList[i].groupID);
				// 		console.log(tmpData.groupId);
				// 		if(this.groupList[i].groupID===tmpData.groupId){
				// 			this.groupList[i] = {...this.groupList[i],...tmpInfo}
				// 			console.log(this.groupList);
				// 			this.initMailList();
				// 		}
				// 	}
				// });
				// this.$globalEvent.addEventListener("onApplicationProcessed", (params) => {
				// 	console.log('onApplicationProcessed----------');
				// 	console.log(params);
				// 	this.getGroupList()
				// });
				// this.$globalEvent.addEventListener("onMemberEnter", (params) => {
				// 	console.log('onMemberEnter----------');
				// 	console.log(params);
				// 	this.getGroupList()
				// });
				this.$globalEvent.addEventListener("onReceiveJoinApplication", (params) => {
					console.log('onReceiveJoinApplication----------');
					console.log(params);
					this.getGroupApplicationList()
				});
				// this.$globalEvent.addEventListener("onGroupCreated", (params) => {
				// 	console.log('onGroupCreated----------');
				// 	console.log(params);
				// 	this.getGroupList()
				// });
				// this.$globalEvent.addEventListener("onMemberKicked", (params) => {
				// 	console.log('onMemberKicked----------');
				// 	console.log(params);
				// 	this.getGroupList()
				// });
				// uni.$on('quitGroup',()=>{
				// 	this.getGroupList()
				// })
			}
		},
		onHide() {
			if(this.showOperationsMenu) this.showOperationsMenu = false
		},
		onPullDownRefresh(){
			this.getMailList()
			// this.getGroupList()
			this.getFriendApplicationList()
			this.getGroupApplicationList()
		},
		beforeMount() {
			this.friendsListener()
			this.groupListner()
			this.getMailList()
			// this.getGroupList()
		},
		onShow() {
			// this.getMailList()
			this.getFriendApplicationList()
			this.getGroupApplicationList()
		}
	}
</script>

<style lang="scss" scoped>
	#mailList {

		.head {
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
				color: #1B72EC;
				margin-left: 44rpx;
			}

			.headRight {
				.headIcon {
					width: 48rpx;
					height: 48rpx;
					margin-right: 40rpx;

				}

				.menuCon {
					z-index: 99;
					position: absolute;
					top: 86rpx;
					right: 1.5%;
					display: flex;
					flex-direction: column;

					&::after {
						content: '';
						position: absolute;
						top: -36rpx;
						right: 36rpx;
						border: 20rpx solid;
						border-color: transparent transparent #1b72ec transparent;
					}

					.operationsMenu {
						background-color: #1B72EC;
						box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.5);
						border-radius: 18rpx;
						padding: 32rpx;

						.operationsMenu-item {
							display: flex;
							align-items: center;
							font-size: 30rpx;
							font-weight: 600;
							color: #FFFFFF;
							&:nth-child(2){
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

		.newFriend {
			height: 100rpx;
			line-height: 100rpx;
			background-color: #fff;
			margin-top: 6rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.newFriendMain {
				display: flex;
				align-items: center;

				.newFriendIcon {
					width: 66rpx;
					height: 66rpx;
					margin-left: 44rpx;
				}

				.newFriendText {
					font-size: 36rpx;
					font-weight: 500;
					color: #333333;
					margin-left: 32rpx;
				}
			}

			.newFriendNumber {
				width: 32rpx;
				height: 32rpx;
				border-radius: 32rpx;
				background-color: #F44038;
				text-align: center;
				line-height: 32rpx;
				font-size: 24rpx;
				font-weight: 600;
				color: #FFFFFF;
				margin-right: 24rpx;
			}
		}
		.uni-indexed-list{
			top: 402rpx; 
		}
		.empty{
			padding-top: 120rpx;
		}
	}
</style>
