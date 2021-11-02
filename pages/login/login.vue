<template>
	<view>
		<view class="container">
			<text class="header">欢迎使用OpenIM</text>
			<view class="form-container">
				<view class="form-item">
					<text class="form-title">手机号码</text>
					<view class="form-input">
						<text>+86</text>
						<u-icon name="arrow-down" />
						<view class="divider"></view>
						<u-input placeholder="请输入手机号码" v-model="phoneNumber" type="number" :border="false" />
					</view>
				</view>
				<view class="form-item password-item">
					<text class="form-title">密码</text>
					<view class="form-input">
						<u-input placeholder="请输入密码" v-model="password" type="password" :border="false" />
					</view>
				</view>
				<view class="bottom-action">
					<text @click="missPwd">忘记密码</text>
					<text @click="newUser" class="new-user">新用户注册</text>
				</view>
			</view>

			<u-button :loading ="loginLoading"  @click="login" :class="{'start-login':password!=''}" class="login-btn" :hair-line="false">登录</u-button>

			<view>
				<u-checkbox shape="circle" v-model="checked">我已阅读并同意：<text>《服务协议》</text>，<text>《隐私政策》</text></u-checkbox>
			</view>
		</view>
	</view>
</template>

<script>
	import { appServerLogin } from "../../utils/appServerApi.js"
	import md5 from 'md5'
	export default {
		data() {
			return {
				phoneNumber: "",
				password: "",
				checked: true,
				loginLoading:false
			}
		},
		onLoad() {

		},
		methods: {
			login(){
				if(this.phoneNumber.length!==11||this.password==""||!this.checked){
					this.$u.toast("请先正确填写信息并勾选协议")
					return
				}
				this.loginLoading = true
				const loginInfo = {
					phoneNumber:this.phoneNumber,
					password:md5(this.password),
					// password:this.password,
					platform:uni.getSystemInfoSync().platform == 'ios' ? 1 : 2
				}
				appServerLogin(loginInfo).then(res=>{
					this.sdkLogin(res.uid,res.token)
				}).catch(err=>{
					this.loginLoading = false
					this.$u.toast('login fail：' + err.errMsg)
				})
			},
			sdkLogin(uid,token){
					this.$openSdk.login(uid, token, async val => {
						if (val.err==undefined) {
							this.$u.vuex('vuex_last_user',uid)
							this.$u.vuex('vuex_token',token)
							const reqData = [uid]
							this.$openSdk.getUsersInfo(reqData, data => {
								let userInfoRes = JSON.parse(data.msg)
								this.$u.vuex('vuex_user_info',userInfoRes[0])
							})
							this.loginLoading = false
							uni.switchTab({
								url: '/pages/conversation/home'
							})
						} else {
							this.loginLoading = false
							this.$u.toast('login fail：' + val.err)
						}
					});
			},
			missPwd(){
				// uni.na
			},
			newUser(){
				uni.navigateTo({
					url:'./register'
				})
			}
		}
	}
</script>

<style lang="scss">
	// page{
	// 	overflow-y:hidden;
	// }
	.container {
		padding: 204rpx 80rpx 0 80rpx;

		.header {
			color: #333333;
			font-size: 64rpx;
			height: 90rpx;
			line-height: 90rpx;
		}

		.form-container {
			margin-top: 84rpx;
			margin-bottom: 168rpx;

			.form-item {
				.form-title {
					font-size: 28rpx;
					height: 40rpx;
					line-height: 40rpx;
					color: #333333;
				}

				.form-input {
					display: flex;
					flex-direction: row;
					align-items: center;
					border-bottom: 1px solid #D8D8D8;
					margin-top: 6rpx;

					.u-icon {
						padding: 0 40rpx 0 20rpx
					}

					.uni-input-placeholder {
						font-size: 32rpx;
						font-weight: 400;
					}

					.divider {
						border: 1px dashed #D8D8D8;
						height: 32rpx;
						margin-right: 56rpx;
					}
				}
			}

			.password-item {
				margin-top: 56rpx;
				margin-bottom: 28rpx;
			}

			.bottom-action {
				display: flex;
				justify-content: space-between;
				font-size: 24rpx;

				.new-user {
					color: #1D6BED;
				}
			}
		}

		.login-btn {
			background-color: rgba($color: #D8D8D8, $alpha: 0.4);
			color: #898989;
			margin-bottom: 36rpx;
			border-radius: 8rpx;
		}
		
		.start-login {
			background-color: #1D6BED;
			color: #FFFFFF;
		}

		.u-btn--bold-border {
			border: none;
		}

		/deep/.u-checkbox__label {
			font-size: 24rpx;
			text{
				color: #1D6BED;
			}
		}
	}
</style>
