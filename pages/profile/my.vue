<template>
	<view id="my">
		<view class="head">
			<image
				:src="userInfo.icon?userInfo.icon:'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png' "
				mode="" class="headIcon"></image>
			<view class="headInfo">
				<text class="nickName">{{ userInfo.name || newUser }}</text>
				<text class="account" @click="copyID">My Account:<text>{{ userInfo.uid }}</text></text>
			</view>
		</view>
		<view class="funtionArea">
			<uni-list>
				<uni-list-item thumb="../../static/changeAvatar.png" title="Change your Avatar" clickable
					@click="changeAvatar"></uni-list-item>
				<uni-list-item thumb="../../static/edit.png" title="Change nickname" clickable @click="goEditNickname">
				</uni-list-item>
				<uni-list-item thumb="../../static/blockList.png" title="Address book blacklist" clickable
					@click="goBlockList"></uni-list-item>
			</uni-list>

			<view class="logOutArea" @click="logout">
				<image src="../../static/logOut.png" mode="" class="logOutIcon"></image>
				<text class="logOutText">Log out</text>
			</view>
		</view>

		<u-modal confirm-text="confirm" cancel-text="cancel" title="notice" v-model="show" show-cancel-button @confirm="logoutConfirm" @cancel="logoutCancel"
			content="Are you sure you want to log out?"></u-modal>
	</view>
</template>

<script>
	import uploadFile from '../../uploadFile/index.js'
	export default {
		data() {
			return {
				linkValue: "1111122222222211111",
				userInfo: {},
				tt: 0,
				show: false,
			};
		},

		methods: {
			copyID() {
				uni.setClipboardData({
					data: this.userInfo.uid,
					success: () => {
						uni.hideToast()
						this.$u.toast("copy uerID success")
					}
				});
			},
			changeAvatar() {
				let _this = this;
				uni.chooseImage({
					count: 1,
					sizeType: ["original", "compressed"],
					sourceType: ["album"],
					success: async function(res) {
						const tempFilePaths = res.tempFilePaths;
						let upLoadImgUrl = await uploadFile(tempFilePaths[0],_this);
						console.log(upLoadImgUrl);
						let parameter = {};
						parameter.icon = upLoadImgUrl
						_this.$openSdk.setSelfInfo(parameter, (data) => {
							if (data.err) {
								_this.$u.toast('change fail：' + data.err)
							} else {
								const reqData = [_this.vuex_user_info[0].uid]
								_this.$openSdk.getUsersInfo(JSON.stringify(reqData), async data => {
									let userInfoRes = JSON.parse(data.msg)
									_this.$u.vuex('vuex_user_info',userInfoRes)
									_this.userInfo = _this.vuex_user_info[0];
								})

							}
						});
					},
				});
			},
			goEditNickname() {
				uni.navigateTo({
					url: "/pages/profile/editNickname?where=my",
				});
			},
			goBlockList() {
				uni.navigateTo({
					url: "/pages/profile/blockList",
				});
			},
			logout() {
				this.show = true;
			},

			logoutCancel() {
				this.show = false;
			},
			logoutConfirm() {
				this.$openSdk.logout((data) => {
					if (data.msg === "") {
						uni.reLaunch({
							url: "/pages/login/login",
						});
					}
				});
			},
		},
		onShow() {
			this.userInfo = this.vuex_user_info[0];
		},
	};
</script>

<style lang="scss" scoped>
	#my {
		height: 100% !important;
		background-color: #f0f6ff;

		.head {
			padding-top: 30rpx;
			height: 268rpx;
			background-color: #fff;
			display: flex;
			align-items: center;

			.headCircle {
				width: 120rpx;
				height: 120rpx;
				border-radius: 120rpx;
				background-image: linear-gradient(to right bottom, #74fad4, #0b8597);
				margin-left: 44rpx;
				margin-right: 40rpx;

				.lastname {
					font-size: 48rpx;
					font-weight: 500;
					color: #ffffff;
					line-height: 120rpx;
					text-align: center;
				}
			}

			.headIcon {
				width: 120rpx;
				height: 120rpx;
				border-radius: 120rpx;
				margin-left: 44rpx;
				margin-right: 40rpx;
			}

			.headInfo {
				display: flex;
				flex-direction: column;
				width: 480rpx;
				white-space: normal;
				word-break: break-all;
				overflow: hidden;

				.nickName {
					font-size: 40rpx;
					font-weight: 500;
					color: #333333;
				}

				.account {
					font-size: 24rpx;
					font-weight: 400;
					color: #666666;
					margin-top: 10rpx;
				}
			}
		}

		.funtionArea {
			margin-top: 28rpx;

			.logOutArea {
				height: 112rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #fff;
				margin-top: 240rpx;

				.logOutIcon {
					width: 40rpx;
					height: 40rpx;
				}

				.logOutText {
					font-size: 36rpx;
					font-weight: 500;
					color: #1b72ec;
					margin-left: 20rpx;
				}
			}
		}

		.linkPopup {
			width: 448rpx;
			height: 250rpx;
			border-radius: 20rpx;
			background-color: #fff;
			padding: 26rpx 40rpx;
			display: flex;
			flex-direction: column;

			text:nth-of-type(1) {
				font-size: 32rpx;
				font-weight: 500;
				color: #1b72ec;
				margin: 0 auto;
			}

			text:nth-of-type(2) {
				font-size: 24rpx;
				font-weight: 500;
				color: #999999;
				margin-top: 30rpx;
			}

			input {
				width: 438rpx;
				height: 56rpx;
				background-color: #f0f6ff;
				margin-top: 8rpx;
				font-size: 20rpx;
				font-weight: 500;
				color: #333333;
				padding-left: 10rpx;
			}

			.buttonArea {
				display: flex;
				margin-top: 30rpx;

				button:nth-of-type(1) {
					width: 104rpx;
					height: 42rpx;
					font-size: 24rpx;
					padding: 0;
					line-height: 42rpx;
					margin-left: 0rpx;
					box-shadow: 0px 4rpx 8rpx rgba(0, 0, 0, 0.5);
				}

				button:nth-of-type(2) {
					width: 134rpx;
					height: 42rpx;
					font-size: 24rpx;
					padding: 0;
					line-height: 42rpx;
					margin-right: 0rpx;
					box-shadow: 0px 4rpx 8rpx rgba(0, 0, 0, 0.5);
				}
			}
		}

		.logout {
			width: 528rpx;
			height: 300rpx;
			background-color: #fff;
			border-radius: 20rpx;
			display: flex;
			flex-direction: column;
			align-items: center;

			.title {
				font-size: 34rpx;
				font-weight: 500;
				color: #333333;
				margin-top: 60rpx;
				padding: 0 50rpx;
				text-align: center;
			}

			.buttonArea {
				width: 100%;
				display: flex;
				margin-top: 70rpx;

				button:nth-of-type(1) {
					width: 104rpx;
					height: 42rpx;
					font-size: 24rpx;
					padding: 0;
					line-height: 42rpx;
					margin-left: 70rpx;
					box-shadow: 0px 4rpx 8rpx rgba(0, 0, 0, 0.5);
				}

				button:nth-of-type(2) {
					width: 104rpx;
					height: 42rpx;
					font-size: 24rpx;
					padding: 0;
					line-height: 42rpx;
					margin-right: 70rpx;
					box-shadow: 0px 4rpx 8rpx rgba(0, 0, 0, 0.5);
				}
			}
		}
	}
</style>
