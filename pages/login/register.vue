<template>
	<view id="register">
		<view class="returnArea" @click="goLogin">
			<image src="../../static/return.png" mode="" class="returnIcon"></image><text class="returnText">Your mnemonics</text>
		</view>
		<view class="tipsCon">
			<view class="circle">
			</view>
			<text class="tipsInfo">It is the only voucher for your account</text>
		</view>
		<view class="tipsCon">
			<view class="circle">
			</view>
			<text class="tipsInfo">Eechat will not save your mnemonics. Once lost, it cannot be retrieved</text>
		</view>
		<view class="tipsCon">
			<view class="circle">
			</view>
			<text class="tipsInfo">Please record your mnemonics and keep them in a safe place</text>
		</view>
		<view class="mnemonic-words-area">
			<view class="mnemonic-words-item" v-for="item in mnemonicArr" :key="item">{{item}}</view>
		</view>
		<view @click="copySecret" class="copyArea">
			<text>Copy your mnemonics:</text><br />
			<text>{{registerInfo.mnemonic}}</text>
		</view>
		<button :loading="registerLoading" type="primary" class="nextStep" @click="goConfirm">next step</button>
	</view>
</template>

<script>
	const bip39 = require("bip39");
	const {
		hdkey
	} = require("ethereumjs-wallet");
	const util = require("ethereumjs-util");
	
	import {setMnemonic} from "../../utils/storage.js"
	export default {
		data() {
			return {
				registerInfo: {
					mnemonic: "",
					publicKey: "",
					address: "",
				},
				mnemonicArr: [],
				registerLoading: false
			}
		},
		methods: {
			copySecret() {
				uni.setClipboardData({
					data: this.registerInfo.mnemonic,
					success: () => {
						uni.hideToast()
						this.$u.toast("copy mnemonic success")
					}
				});
			},
			async obtainAccount() {
				this.registerInfo.mnemonic = bip39.generateMnemonic();
				this.mnemonicArr = this.registerInfo.mnemonic.split(" ")
				let seed = await bip39.mnemonicToSeed(this.registerInfo.mnemonic);
				let hdWallet = await hdkey.fromMasterSeed(seed);
				let key = await hdWallet.derivePath("m/44'/60'/0'/0/0");
				this.registerInfo.publicKey = util.bufferToHex(key._hdkey._publicKey)
				let address = await util.pubToAddress(key._hdkey._publicKey, true);
				this.registerInfo.address = address.toString("hex")
			},
			goLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			goConfirm() {
				this.registerLoading = true
				let accountInfo = {};
				accountInfo.account = this.registerInfo.mnemonic.replace(/\s*/g, "")
				accountInfo.password = this.registerInfo.address.slice(0, 18);
				accountInfo.platform = 2
				accountInfo.operationID = this.registerInfo.address + Date.now().toString()
				let _this = this
				uni.request({
					url: "https://open-im.rentsoft.cn/eechat/user/register",
					method: 'POST',
					data: JSON.stringify(accountInfo),
					success(res) {
						console.log(res);
						if (res.data.errCode == 0) {
							uni.request({
								url: "https://open-im.rentsoft.cn/eechat/user/login",
								method: 'POST',
								data: JSON.stringify(accountInfo),
								success(res) {
									console.log(res);
									_this.$openSdk.login(res.data.data.uid, res.data.data.openImToken
										.token, (val) => {
											if (!val.err) {
												setMnemonic(_this.registerInfo.mnemonic)
												const reqData = [res.data.data.uid]
												_this.$openSdk.getUsersInfo(reqData, data => {
													let userInfoRes = JSON.parse(data.msg)
													_this.$u.vuex('vuex_user_info',userInfoRes[0])
													_this.$u.vuex('vuex_token',res.data.data.token.accessToken)
												})
												_this.registerLoading = false
												uni.switchTab({
													url: '/pages/conversation/home'
												})
											} else {
												console.log(val.err);
												_this.registerLoading = false
												_this.$u.toast('login fail：' + val.err)
											}
										});
								},
								fail(err) {
									_this.registerLoading = false
									_this.$u.toast('login fail：' + err)
								}
							})

						}
					},
					fail(err) {
						_this.registerLoading = false
						_this.$u.toast('login fail：' + err)
						console.log(err);
					}
				})
			}
		},
		created() {
			this.obtainAccount()
		},

	}
</script>

<style lang="scss" scoped>
	#register {
		background-image: url(../../static/registerBackground.png);
		background-size: 100% 100%;
		height: 100vh;
		// flex: 1;
		padding: 0 48rpx;
		display: flex;
		flex-direction: column;

		.returnArea {
			display: flex;
			align-items: center;
			margin-top: 36rpx;
			margin-bottom: 36rpx;

			.returnIcon {
				width: 29rpx;
				height: 53rpx;

			}

			.returnText {
				font-size: 56rpx;
				font-weight: 600;
				color: #1D6BED;
				margin-left: 20rpx;
			}
		}

		.tipsCon {
			display: flex;
			align-items: flex-start;
			margin-top: 12rpx;

			.circle {
				width: 10rpx;
				height: 10rpx;
				border-radius: 10rpx;
				background-color: #1D6BED;
				flex-shrink: 0;
				margin-top: 16rpx;
				margin-right: 14rpx;
			}

			.tipsInfo {
				font-size: 28rpx;
				font-weight: 400;
				color: #333333;

			}
		}


		.mnemonic-words-area {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			margin-top: 60rpx;

			.mnemonic-words-item {
				width: 260rpx;
				height: 60rpx;
				border-radius: 8rpx;
				box-shadow: 0 4rpx 10rpx 0 rgba(0, 69, 185, 0.46);
				text-align: center;
				line-height: 60rpx;
				font-size: 32rpx;
				font-weight: 500;
				color: #333333;
				margin-bottom: 28rpx;
			}
		}

		.copyArea {
			margin-top: 48rpx;
			padding: 12rpx;
			border: 0.5px solid #ED1D1D;
			border-radius: 8rpx;
		}

		.nextStep {
			width: 294rpx;
			height: 68rpx;
			line-height: 68rpx;
			margin-top: 48rpx;
			margin-bottom: 48rpx;
		}
	}
</style>
