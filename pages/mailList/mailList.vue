<template>
	<view @click="pageClick" id="mailList">
		<view class="head">
			<text class="title">mail list</text>
			<view class="headRight">
				<image src="../../static/search.png" mode="" class="headIcon" @click="goSearch"></image>
				<image src="../../static/more-operations.png" mode="" class="headIcon" @click.stop="controlDisplay"></image>
				<view class="menuCon" v-if="showOperationsMenu">
					<view class="operationsMenu">
						<view class="operationsMenu-item" @click="goAddFriend">
							<image src="../../static/addFriend.png" mode="" class="itemImg"></image>
							<text>Add friends</text>
						</view>
					</view>
				</view>
			</view>
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
		<view class="">
			<!-- 	<u-index-list :sticky="false" :scrollTop="scrollTop">
				<view v-for="(item, index) in indexList" :key="index">
					<u-index-anchor :index="item" />
					<view v-for="dataItem in data" v-if="dataItem.title==item" class="list-cell">
						{{dataItem.msg}}
					</view>
				</view>
			</u-index-list> -->
			<uni-indexed-list :options="friendList" :showSelect="false" @click="bindClick"></uni-indexed-list>
		</view>
	</view>
</template>

<script>
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
				applicationList: [],
				application: 0,
				showOperationsMenu: false,
			}
		},
		methods: {
			getMailList() {
				this.$openSdk.getFriendList((data) => {
					this.originalList = JSON.parse(data.msg)
					this.originalList.map(i => {
						i.img =
							"https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
					})
					console.log(this.originalList);
					this.friendList = [{
						letter: "#",
						data: this.originalList
					}]
				})
			},
			getFriendApplicationList() {
				this.$openSdk.getFriendApplicationList((data) => {
					this.applicationList = JSON.parse(data.msg)
					const tmpArr = this.applicationList.filter(a => a.flag === 0)
					this.application = tmpArr.length
					if(this.application===0){
						uni.removeTabBarBadge({
							index: 1,
						});
					}else{
						uni.setTabBarBadge({
							index: 1,
							text: this.application > 99 ? "99+" : this.application,
						});
					}
				})
			},
			bindClick(item) {
				this.pageClick()
				const user = item.item.name
				this.$store.dispatch("setConversationUser", user.uid);
				uni.navigateTo({
					url: "/pages/conversation/chatWin",
				});
			},
			controlDisplay() {
				this.showOperationsMenu = !this.showOperationsMenu
			},
			pageClick() {
				console.log("pageClick");
				if(this.showOperationsMenu) this.showOperationsMenu = false
			},
			goSearch() {
				uni.navigateTo({
					url: '/pages/mailList/searchFriend?list=' + JSON.stringify(this.originalList)
				});
			},
			goAddFriend() {
				uni.navigateTo({
					url: '/pages/mailList/addFriend'
				});
				this.showOperationsMenu = false
			},
			goNewFriends() {
				uni.navigateTo({
					url: '/pages/mailList/newFriends?list=' + JSON.stringify(this.applicationList)
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
			}
		},
		onHide() {
			if(this.showOperationsMenu) this.showOperationsMenu = false
		},
		beforeMount() {
			this.friendsListener()
			this.getMailList()
		},
		onShow() {
			// this.getMailList()
			this.getFriendApplicationList()
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
						padding: 24rpx;

						.operationsMenu-item {
							display: flex;
							align-items: center;
							font-size: 30rpx;
							font-weight: 600;
							color: #FFFFFF;

							.itemImg {
								width: 44rpx;
								height: 44rpx;
								margin-right: 28rpx;
							}
						}
					}
				}


			}
		}

		.newFriend {
			// padding-top: 90rpx;
			height: 90rpx;
			line-height: 90rpx;
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
	}
</style>
