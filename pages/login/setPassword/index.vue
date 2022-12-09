<template>
	<view class="set_password_container content_with_back">
		<view class="title">请设置账号密码</view>
		<view class="sub_title">登陆密码用于登陆OpenIM账号</view>
		<u-form class="loginForm commonPage-form" labelPosition="top" :model="formData" :rules="rules" :labelStyle="{
        fontSize:'14px',
        marginTop: '20rpx',
		minWidth: '200rpx'
      }" ref="loginForm">
			<u-form-item label="密码" prop="password" borderBottom>
				<u-input v-model="formData.password" border="none" placeholder="请输入密码" :password="!passwordEying">
					<u-icon @click="updateEye('passwordEying')" slot="suffix" :name="passwordEying ? 'eye-off' :'eye'"></u-icon>
				</u-input>
			</u-form-item>
			<u-form-item label="确认密码" prop="confirmPassword" borderBottom>
				<u-input v-model="formData.confirmPassword" border="none" placeholder="请输入密码" :password="!comfirmEying">
					<u-icon @click="updateEye('comfirmEying')" slot="suffix" :name="comfirmEying ? 'eye-off' :'eye'"></u-icon>
				</u-input>
			</u-form-item>
		</u-form>
		<view class="feild_desc">需6～20位字符</view>
		<view class="action_btn">
			<u-button type="primary" @click="doNext">
				{{ isRegister ? "下一步" : "重置密码" }}
			</u-button>
		</view>
	</view>
</template>

<script>
	import {
		businessReset
	} from '@/api/login';
	export default {
		data() {
			return {
				isRegister: false,
				codeValue: "",
				userInfo: {
					phoneNumber: "",
					areaCode: ""
				},
				formData: {
					password: "",
					confirmPassword: "",
				},
				passwordEying: false,
				comfirmEying: false,
				rules: {
					password: [{
							type: "string",
							required: true,
							message: "请输入密码",
							trigger: ["blur", "change"],
						},
						{
							validator: (rule, value, callback) => {
								return value.length >= 6;
							},
							message: "密码太短",
							trigger: ["change", "blur"],
						},
					],
					confirmPassword: [{
							type: "string",
							required: true,
							message: "请输入确认密码",
							trigger: ["blur", "change"],
						},
						{
							validator: (rule, value, callback) => {
								return value === this.formData.password;
							},
							message: "两次密码不一致",
							trigger: ["change", "blur"],
						},
					],
				},
			};
		},
		onLoad(options) {
			const {
				userInfo,
				isRegister,
				codeValue
			} = options
			this.userInfo = JSON.parse(userInfo)
			this.isRegister = isRegister
			this.codeValue = codeValue
		},
		onBackPress() {
			return true
		},
		methods: {
			doNext() {
				this.$refs.loginForm.validate().then((valid) => {
					if (valid) {
						if (this.isRegister) {
							uni.$u.route("/pages/login/setSelfInfo/index", {
								userInfo: JSON.stringify(this.userInfo),
								codeValue: this.codeValue,
								passWord: this.formData.password
							})
						} else {
							const options = {
								phoneNumber: this.userInfo.phoneNumber,
								areaCode: `+${this.userInfo.areaCode}`,
								verificationCode: this.codeValue,
								password: this.formData.password,
								platform: uni.$u.os() === 'ios' ? 1 : 2,
								operationID: Date.now() + ""
							}
							businessReset(options).then(() => {
								uni.$u.toast('密码重置成功，请前往登录！')
								setTimeout(() => uni.$u.route("/pages/login/index"), 1000)
							}).catch((err)=>uni.$u.toast('密码重置失败'))
						}
					}
				});
			},
			updateEye(key){
				this[key] = !this[key]
			}
		},
	};
</script>
<style lang="scss" scoped>
	.set_password_container {
		margin-top: var(--status-bar-height);
		padding-top: 150rpx;

		.title {
			padding-bottom: 8rpx;
		}

		.feild_desc {
			font-size: 28rpx;
			color: $u-primary;
			margin-top: 24rpx;
		}

		.action_btn {
			margin-top: 12vh;
		}
	}
</style>
