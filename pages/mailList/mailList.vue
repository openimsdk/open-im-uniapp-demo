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
			<view v-if="vuex_friend_application_num>0" class="newFriendNumber">
				{{vuex_friend_application_num}}
			</view>
		</view>
		<view class="newFriend" @click="goNewGroup">
			<view class="newFriendMain">
				<image src="../../static/group_notification.png" mode="" class="newFriendIcon"></image>
				<text class="newFriendText">Group notification</text>
			</view>
			<view v-if="vuex_group_application_num>0" class="newFriendNumber">
				{{vuex_group_application_num}}
			</view>
		</view>
		<view class="newFriend" @click="goGroupList">
			<view class="newFriendMain">
				<image src="../../static/group_list.png" mode="" class="newFriendIcon"></image>
				<text class="newFriendText">Group list</text>
			</view>
		</view>
		<u-empty v-if="vuex_original_mail_list.length===0" class="empty" text="There is no contact" mode="list"/>
		<uni-indexed-list v-else :options="vuex_mail_list" :showSelect="false" @click="bindClick"></uni-indexed-list>
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
				// friendList: [],
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
					this.$u.vuex('vuex_original_mail_list',this.originalList)
					const friendList = [{
						letter: "#",
						data: this.originalList
					}]
					this.$u.vuex('vuex_mail_list',friendList)
					uni.stopPullDownRefresh()
				})
			},
			getFriendApplicationList() {
				this.$openSdk.getFriendApplicationList((data) => {
					this.applicationList = JSON.parse(data.msg)
					this.$u.vuex('vuex_group_application_list', this.applicationList)
					const tmpArr = this.applicationList.filter(a => a.flag === 0)
					this.application = tmpArr.length
					this.$u.vuex('vuex_friend_application_num', this.application)
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
					this.$u.vuex('vuex_group_application_list', this.groupApplicationList)
					const tmpArr = this.groupApplicationList.filter(a => a.flag === 0)
					this.groupApplication = tmpArr.length;
					this.$u.vuex('vuex_group_application_num', this.groupApplication)
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
					url: '/pages/mailList/newFriends'
				});
			},
			goNewGroup(){
				uni.navigateTo({
					url: '/pages/mailList/groupNotification'
				});
			},
			goGroupList(){
				uni.navigateTo({
					url: '/pages/mailList/groupList'
				});
			},
		},
		onHide() {
			if(this.showOperationsMenu) this.showOperationsMenu = false
		},
		onPullDownRefresh(){
			this.getMailList()
			this.getFriendApplicationList()
			this.getGroupApplicationList()
		},
		onShow() {
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
