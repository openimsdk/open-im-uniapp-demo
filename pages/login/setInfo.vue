<template>
	<view>
		<view class="container">
			<view class="header-warper">
				<text class="header">欢迎使用OpenIM</text>
				<text class="tip">请完善个人信息</text>
			</view>

			<view @click="changeAvatar" class="avator-area">
				<u-avatar size="160" :src="icon==''?staticIcon:icon"></u-avatar>
				<text class="tip1">点击上传头像</text>
			</view>

			<view class="form-item">
				<view class="form-input">
					<text>你的姓名</text>
					<u-input placeholder="请输入姓名" v-model="name" type="text" :border="false" />
				</view>

			</view>

			<u-button :loading="enterLoaing" @click="setSelfInfo" class="ready" :hair-line="false">进入</u-button>
		</view>
	</view>
</template>

<script>
	import uploadFile from '../../uploadFile/index.js'
	export default {
		data() {
			return {
				name: '',
				checked: true,
				enterLoaing: false,
				icon: "",
				staticIcon: "../../static/avator_set.png"
			}
		},
		methods: {
			changeAvatar() {
				let _this = this;
				uni.chooseImage({
					count: 1,
					sizeType: ["original", "compressed"],
					sourceType: ["album"],
					success: async function(res) {
						const tempFilePaths = res.tempFilePaths;
						_this.icon = await uploadFile(tempFilePaths[0], _this);
					},
				});
			},
			setSelfInfo() {
				if (this.name == "" || this.icon == "") {
					this.$u.toast("请先填写信息")
					return
				}
				const userInfo = {
					name: this.name,
					icon: this.icon
				}
				console.log(userInfo);
				this.enterLoaing = true
				this.$openSdk.setSelfInfo(userInfo, data => {
					console.log(data);
					const reqData = [this.vuex_last_user]
					this.$openSdk.getUsersInfo(reqData, async data => {
						let userInfoRes = JSON.parse(data.msg)
						this.$u.vuex('vuex_user_info', userInfoRes[0])
						this.enterLoaing = false
						uni.switchTab({
							url: '/pages/conversation/home'
						})
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 96rpx 80rpx 0 80rpx;

		.header-warper {
			display: flex;
			flex-direction: column;

			.header {
				color: #333333;
				font-size: 52rpx;
				height: 74rpx;
				line-height: 74rpx;
			}

			.tip {
				margin-top: 8rpx;
				// margin-bottom: 56rpx;
				color: #999999;
				font-size: 32rpx;
				height: 44rpx;
				line-height: 44rpx;
			}
		}

		.avator-area {
			margin: 100rpx 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.tip1 {
				font-size: 24rpx;
				color: #999999;
				padding-top: 12rpx;
			}
		}

		.form-item {
			margin-bottom: 76rpx;

			.form-input {
				display: flex;
				flex-direction: row;
				align-items: center;
				border-bottom: 1px solid #D8D8D8;
				margin-top: 6rpx;
				margin-bottom: 18rpx;

				/deep/.u-input__input {
					margin-left: 78rpx;
				}

				.uni-input-placeholder {
					font-size: 32rpx;
					font-weight: 400;
				}
			}
		}

		.ready {
			background-color: #1D6BED;
			color: #FFFFFF;
			margin-bottom: 36rpx;
			border-radius: 8rpx;
		}

		.u-btn--bold-border {
			border: none;
		}
	}
</style>
