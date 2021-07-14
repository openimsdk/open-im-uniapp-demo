<template>
	<view id="setFriend">
		<uni-nav-bar left-icon="back" title="Friends settings" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<view class="mainHead">
				<view class="imageCon">
					<image
						src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
						mode="" class="headIcon"></image>
				</view>
				<text>{{ friendData.comment||friendData.name || friendData.uid }}</text>
			</view>
			<view class="operationSet">
				<view class="operationSetItem" @click="goEditNickname">
					<text>Set notes</text>
					<image src="../../static/arrow.png" mode="" class="arrow"></image>
				</view>
				<view class="operationSetItem">
					<text>Top contact</text>
					<u-switch @change="topContact" v-model="val" />
				</view>
				<view class="operationSetItem">
					<text>Join the blacklist</text>
					<u-switch @change="changeBlackStatus" v-model="friendData.blackStatus" :active-value="1"
						:inactive-value="0" />
				</view>
				<view class="operationSetItem" @click="deleteRecord">
					<text>Empty chat record</text>
					<image src="../../static/arrow.png" mode="" class="arrow"></image>
				</view>
			</view>
		</view>

		<view class="deleteBtn" @click="deleteFriend"> Delete friend </view>

		<uni-popup ref="deleteConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">Are you sure to delete "{{ friendData.name }}"?</text>
				</view>
				<view class="footerArea">
					<view type="primary" @click="confirmCancel" class="confirmCancel">cancel</view>
					<view type="primary" @click="deleteConfirm" class="deleteConfirm">delete</view>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="blockConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">Are you sure to blacklist "{{ friendData.name }}"?</text>
				</view>
				<view class="footerArea">
					<view type="primary" @click="addBlackCancel" class="confirmCancel">cancel</view>
					<view type="primary" @click="addBlackConfirm" class="deleteConfirm">determine</view>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="deleteRecordConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">Are you sure you want to delete the record with "{{
              friendData.name
            }}"?</text>
				</view>

				<view class="footerArea">
					<view type="primary" @click="deleteRecordCancel" class="confirmCancel">cancel</view>
					<view type="primary" @click="deleteRecordConfir" class="deleteConfirm">empty</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				friendData: {},
				val: false,
			};
		},
		methods: {
			goEditNickname() {
				uni.navigateTo({
					url: "/pages/profile/editNickname?where=setFriend&friendData="+JSON.stringify(this.friendData),
				});
			},
			topContact(e) {
				this.$u.toast("developing")
				// console.log(e);
			},

			//blackList
			changeBlackStatus(val) {
				if (val === 1) {
					this.$refs.blockConfirm.open();
				} else {
					this.$openSdk.deleteFromBlackList(JSON.stringify(this.friendData.uid), () => {});
				}
			},
			addBlackConfirm() {
				this.$openSdk.addToBlackList(JSON.stringify(this.friendData.uid), (data) => {
					console.log(data);
					if (data.msg === "") {
						this.$u.toast("add black list success！");
						this.$refs.blockConfirm.close();
					}else{
						this.$u.toast("add black list failed！");
						this.$refs.blockConfirm.close();
					}
				});
			},
			addBlackCancel() {
				this.friendData.blackStatus = false;
				this.$refs.blockConfirm.close();
			},

			//record
			deleteRecord() {
				this.$refs.deleteRecordConfirm.open();
			},
			deleteRecordConfir() {
				this.$u.toast("developing")
			},
			deleteRecordCancel() {
				this.$refs.deleteRecordConfirm.close();
			},

			//friend
			deleteFriend() {
				this.$refs.deleteConfirm.open();
			},
			deleteConfirm() {
				this.$openSdk.deleteFromFriendList(JSON.stringify(this.friendData.uid), (data) => {
					console.log(data);
					if (data.msg === "") {
						this.$u.toast("delete success！");
						this.$refs.deleteConfirm.close();
						uni.switchTab({
							url:"/pages/conversation/home"
						})
					}
				});
			},
			confirmCancel() {
				this.$refs.deleteConfirm.close();
			},

			goBack() {
				uni.navigateBack();
			},
			initData() {
				const reqData = [this.vuex_conversation_user]
				this.$openSdk.getFriendsInfo(JSON.stringify(reqData), (data) => {
					if (data.msg) {
						const tmpArr = JSON.parse(data.msg)
						this.friendData = tmpArr[0]
					}
				})
			}
		},
		beforeMount() {
			this.initData()
		},
		onShow() {
			this.initData()
		}
	};
</script>

<style lang="scss" scoped>
	#setFriend {
		.confirm {
			width: 500rpx;
			background: #ffffff;
			border-radius: 12rpx;
			text-align: center;

			.titleArea {
				padding: 28rpx 50rpx;

				.titleInfo {
					height: 140rpx;
				}
			}

			.footerArea {
				height: 92rpx;
				display: flex;
				line-height: 92rpx;
				font-size: 32rpx;
				font-weight: 400;
				border-top: 1px solid rgba(151, 151, 151, 0.5);

				.confirmCancel {
					width: 50%;
					color: #333333;
					border-right: 1px solid rgba(151, 151, 151, 0.5);
				}

				.deleteConfirm {
					width: 50%;
					color: #1b72ec;
					background-color: #e8f2ff;
					border-bottom-right-radius: 12rpx;
				}
			}
		}

		.main {
			.mainHead {
				height: 324rpx;
				background-color: #fff;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border-bottom: 2rpx solid rgba(153, 153, 153, 0.4);

				.imageCon {
					width: 160rpx;
					height: 160rpx;
					border-radius: 160rpx;
					border: 6rpx solid #c0dcff;

					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 10rpx;
					font-size: 36px;
					font-weight: 500;
					color: #333333;

					.headIcon {
						width: 114rpx;
						height: 114rpx;
						border-radius: 114rpx;
					}
				}
			}

			.operationSet {
				.operationSetItem {
					height: 88rpx;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 0 44rpx;
					background-color: #fff;
					border-bottom: 2rpx solid rgba(153, 153, 153, 0.4);
					font-size: 32rpx;
					font-weight: 400;
					color: #333333;

					.arrow {
						width: 20rpx;
						height: 34rpx;
					}
				}
			}
		}

		.deleteBtn {
			margin-top: 310rpx;
			font-size: 32rpx;
			font-weight: 500;
			color: #ffffff;
			width: 100%;
			height: 90rpx;
			background: #1b72ec;
			text-align: center;
			line-height: 90rpx;
		}

		.deleteBtn:active {
			background: #1b72ec;
			color: #ffffff;
		}
	}
</style>
