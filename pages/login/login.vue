<template>
	<view id="login">
		<image src="../../static/logo.png" mode="" class="logo"></image>
		<text class="title">Open IM</text>
		<view class="tipsArea">
			<text>开源OpenIM体验Demo</text>
			<text class="tipsArea-item">体验群组聊天，音视频通话等IM功能</text>
			<!-- <view class="tipsAreaItem">
				<view class="blackDot"></view>
				<text>开源Demo，高效体验</text>
			</view>
			<view class="tipsAreaItem">
				<view class="blackDot"></view>
				<text>体验群组聊天，在线沟通</text>
			</view>
			<view class="tipsAreaItem">
				<view class="blackDot"></view>
				<text>音视频会议，一键通话</text>
			</view> -->
		</view>

		<input type="text" value="" class="inputArea" placeholder="请输入账号"
			v-model="account" />
		<button :loading="loginLoading" type="primary" class="loginButton" @click="login">登录</button>
	</view>
</template>

<script>
let _this;
import { SECRET,appServerLogin,appServerRegiester,importRelationShip } from '../../utils/appServerApi.js'
import md5 from 'md5'

	export default {
		data() {
			return {
				account: "",
				loginLoading: false,
			};
		},
		methods: {
			login(){
				this.loginLoading = true
				if (this.account === "") {
					this.$u.toast("please input your account")
					return false
				}
				let registerInfo = {
					secret: SECRET, 
					platform: 2, 
					uid: this.account, 
					name: "0x"+this.account.slice(0,4), 
					icon: "https://api.prodless.com/avatar.png?size=60", 
					gender: 1, 
					mobile: "", 
					birth: "", 
					email: "", 
					ex: ""
				};
				appServerRegiester(registerInfo).then(res=>{
					this.sdkLogin(res.data.uid,res.data.token,"register")
				}).catch(err=>{
					if(err.errMsg==`rpc error: code = Unknown desc = Error 1062: Duplicate entry '${this.account}' for key 'PRIMARY'`){
						let loginInfo = {
							secret:SECRET,
							platform:2,
							uid:this.account
						};
						appServerLogin(loginInfo).then(res=>{
							this.sdkLogin(res.data.uid,res.data.token,"login")
						}).catch(err=>{
							_this.loginLoading = false
							_this.$u.toast('login fail：' + err)
						})
					}
				})
			},
			
			sdkLogin(uid,token,type){
				console.log("login type:"+type);
					_this.$openSdk.login(uid, token, async val => {
						if (val.err==undefined) {
							_this.$u.vuex('vuex_last_user',uid)
							const reqData = [uid]
							_this.$openSdk.getUsersInfo(reqData, data => {
								let userInfoRes = JSON.parse(data.msg)
								console.log(userInfoRes[0]);
								_this.$u.vuex('vuex_user_info',userInfoRes[0])
							})
							if(type === "register") await importRelationShip(this.account)
							_this.loginLoading = false
							uni.switchTab({
								url: '/pages/conversation/home'
							})
						} else {
							_this.loginLoading = false
							_this.$u.toast('login fail：' + val.err)
						}
					});
			},
			initAccount() {
				const lastWord = this.vuex_last_user
				if (lastWord){
					this.account = lastWord
				}else{
					const accountStr = md5(new Date().getTime())
					this.account = accountStr.slice(0,10)
				}
			},
		},
		beforeMount() {
			this.initAccount()
		},
		onLoad() {
			_this = this
		}
	};
</script>

<style lang="scss" scoped>
	#login {
		background-image: url(../../static/loginBackground.png);
		background-size: 100% 100vh;
		height: 100vh !important;
		display: flex;
		flex-direction: column;
		align-items: center;

		.logo {
			height: 220rpx;
			min-height: 220rpx;
			width: 220rpx;
			margin-top: 220rpx;
		}

		.title {
			font-size: 52rpx;
			font-weight: 600;
			color: #333333;
			margin-top: 10rpx;
		}

		.childTitle {
			font-size: 38rpx;
			font-weight: 500;
			color: #333333;
			margin-top: 18rpx;
		}

		.tipsArea {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 32rpx;
			.tipsArea-item{
				margin-top: 24rpx;
			}
			// .tipsAreaItem {
			// 	display: flex;
			// 	align-items: center;
			// 	margin-bottom: 10rpx;
			// 	font-size: 28rpx;
			// 	font-weight: 400;
			// 	color: #333330;

			// 	.blackDot {
			// 		width: 10rpx;
			// 		height: 10rpx;
			// 		border-radius: 10rpx;
			// 		background-color: #666;
			// 		margin-right: 24rpx;
			// 	}
			// }
		}

		.inputArea {
			width: 500rpx;
			font-weight: 500;
			color: #999999;
			padding-bottom: 12rpx;
			border-bottom: 1px solid #979797;
			margin-top: 120rpx;
		}

		.loginButton {
			width: 290rpx;
			// height: 66rpx;
			min-height: 66rpx;
			font-size: 32rpx;
			font-weight: 600;
			color: #ffffff;
			line-height: 66rpx;
			box-shadow: 0 8rpx 26rpx rgba(0, 76, 203, 0.7);
			margin-top: 120rpx;
		}

		.register {
			font-size: 28rpx;
			font-weight: 600;
			color: #1d6bed;
			margin-top: 32rpx;
		}
	}
</style>
