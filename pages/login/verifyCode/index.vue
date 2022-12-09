<template>
	<view class="verify_code content_with_back">
		<view class="back_icon">
			<u-icon name="arrow-leftward" bold size="36" color="#1D6BED" @click="back" />
		</view>
		<view class="title">验证码已发送至手机</view>
		<view class="sub_title">
			{{ `+${userInfo.areaCode} ${userInfo.phoneNumber}`}}
		</view>
		<view class="code_container">
			<view class="code_title">请输入验证码</view>
			<u-code-input fontSize='24' color="#000" :focus="true" v-model="codeValue" mode="line" hairline space="20"
				@finish="checkCode" />
			<view class="code_des">
				<text class="blue_text">
					{{ `${count}s` }}
				</text>
				后
				<text @click="getSmsAgain" class="blue_text">
					重发验证码
				</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		businessSendSms,
		businessVerifyCode
	} from '@/api/login';
	import {
		SmsUserFor
	} from '@/constant';
	import {
		checkLoginError
	} from '@/util/common';
	let timer
	export default {
		data() {
			return {
				codeValue: "",
				count: 60,
				userInfo: {
					phoneNumber: "",
					areaCode: ""
				},
				isRegister: false
			};
		},
		onLoad(options) {
			const {
				userInfo,
				isRegister
			} = options
			this.userInfo = JSON.parse(userInfo)
			this.isRegister = isRegister
			this.startCount();
		},
		onReady() {},
		methods: {
			back() {
				uni.$u.route("/pages/login/registerOrForget/index", {
					isRegister: this.isRegister,
				});
			},
			checkCode(value) {
				const options = {
					phoneNumber: this.userInfo.phoneNumber,
					areaCode: `+${this.userInfo.areaCode}`,
					usedFor: this.isRegister ? SmsUserFor.Register : SmsUserFor.Reset,
					verificationCode: value,
					operationID: Date.now() + ""
				}
				businessVerifyCode(options).then(() => {
					if (this.isRegister) {
						uni.$u.route("/pages/login/setPassword/index", {
							userInfo: JSON.stringify(this.userInfo),
							isRegister: this.isRegister,
							codeValue: this.codeValue
						})
					}
				}).catch(err => {
					uni.$u.toast(checkLoginError(err))
					// uni.$u.toast('验证失败')
				})
			},
			startCount() {
				if (timer) {
					clearInterval(timer)
				}
				timer = setInterval(() => {
					if (this.count > 0) {
						this.count--
					}
				}, 1000)
			},
			getSmsAgain() {
				if (this.count === 0) {
					const options = {
						phoneNumber: this.userInfo.phoneNumber,
						areaCode: `+${this.userInfo.areaCode}`,
						usedFor: this.isRegister ? SmsUserFor.Register : SmsUserFor.Reset,
						invitationCode: null,
						operationID: Date.now() + ""
					}
					businessSendSms(options).then(() => {
						this.count = 60
						this.startCount();
						uni.$u.toast('验证码已发送！')
					}).catch(err => uni.$u.toast('验证码发送失败'))
				}
			}
		},
	};
</script>
<style lang="scss" scoped>
	.verify_code {
		margin-top: var(--status-bar-height);

		.title {
			padding-bottom: 6rpx;
		}

		.code_container {
			.code_title {
				font-size: 28rpx;
				margin-bottom: 24rpx;
			}

			.code_des {
				margin-top: 24rpx;
				font-size: 28rpx;

				.blue_text {
					color: $u-primary;

					&:nth-child(2) {
						margin-left: 12rpx;
						cursor: pointer;
					}
				}
			}
		}
	}
</style>
