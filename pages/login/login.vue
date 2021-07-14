<template>
	<view id="login">
		<image src="../../static/logo.png" mode="" class="logo"></image>
		<text class="title">EEchat</text>
		<text class="childTitle">Digital currency address chat</text>
		<view class="tipsArea">
			<view class="tipsAreaItem">
				<view class="blackDot"></view>
				<text>Mnemonic login, anonymous identity</text>
			</view>
			<view class="tipsAreaItem">
				<view class="blackDot"></view>
				<text>End to end encryption, message security</text>
			</view>
		</view>

		<input type="text" value="" class="inputArea" placeholder="Enter your mnemonics, separated by spaces"
			v-model="account" />
		<button :loading="loginLoading" type="primary" class="loginButton" @click="login">Sign in</button>
		<text class="register" @click="goRegiester">Sign up for a new account</text>
	</view>
</template>

<script>
	const bip39 = require("bip39");
	const {
		hdkey
	} = require("ethereumjs-wallet");
	const util = require("ethereumjs-util");
	import {setMnemonic,getMnemonic} from "../../utils/storage.js"

	export default {
		data() {
			return {
				account: "",
				loginInfo: {
					mnemonic: "",
					publicKey: "",
					address: "",
				},
				loginLoading: false
			};
		},
		methods: {
			async login() {
				if (this.account === "") {
					this.$u.toast("please input your account")
					return false
				}
				this.loginLoading = true
				let seed = await bip39.mnemonicToSeed(this.account);
				let hdWallet = await hdkey.fromMasterSeed(seed);
				let key = await hdWallet.derivePath("m/44'/60'/0'/0/0");
				this.loginInfo.publicKey = util.bufferToHex(key._hdkey._publicKey);
				let address = await util.pubToAddress(key._hdkey._publicKey, true);
				this.loginInfo.address = address.toString("hex");
				let accountInfo = {};
				accountInfo.account = this.account.replace(/\s*/g, "");
				accountInfo.password = this.loginInfo.address.slice(0, 18);
				accountInfo.platform = 2
				accountInfo.operationID = this.loginInfo.address + Date.now().toString()
				let _this = this;
				uni.request({
					url: "https://open-im.rentsoft.cn/eechat/user/login",
					method: "POST",
					data: accountInfo,
					success(res) {
						console.log(res);
						_this.$openSdk.login(res.data.data.uid, res.data.data.openImToken.token, (val) => {
							if (!val.err) {
								setMnemonic(_this.account)
								const reqData = [res.data.data.uid]
								_this.$openSdk.getUsersInfo(JSON.stringify(reqData), data => {
									let userInfoRes = JSON.parse(data.msg)
									_this.$u.vuex('vuex_user_info',userInfoRes)
									_this.$u.vuex('vuex_token',res.data.data.token.accessToken)
								})
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
					fail(err) {
						console.log(err);
						_this.loginLoading = false
						_this.$u.toast('login fail：' + err)
					}
				});
			},
			goRegiester() {
				uni.navigateTo({
					url: "/pages/login/register",
				});
			},
			getLastAccount() {
				const lastWord = getMnemonic()
				if (lastWord) this.account = lastWord
			}
		},
		beforeMount() {
			this.getLastAccount()
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
			margin-top: 260rpx;
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
			margin-top: 20rpx;
			margin-left: 30rpx;

			.tipsAreaItem {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				font-size: 28rpx;
				font-weight: 400;
				color: #333330;

				.blackDot {
					width: 10rpx;
					height: 10rpx;
					border-radius: 10rpx;
					background-color: #666;
					margin-right: 24rpx;
				}
			}
		}

		.inputArea {
			width: 500rpx;
			font-weight: 500;
			color: #999999;
			padding: 0 50rpx 12rpx 50rpx;
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
