<template>
	<view>
		<view class="container">
			<u-icon @click="back" name="../../static/arrow_left.png" size="72" color="#1e6bed" />
			<view class="header-warper">
				<text class="header">新用户注册</text>
			</view>
			
			<view class="form-item">
				<text class="form-title">手机号码</text>
				<view class="form-input">
					<text>+86</text>
					<u-icon name="arrow-down" />
					<view class="divider"></view>
					<u-input placeholder="请输入手机号码" v-model="phoneNumber" type="number" :border="false" />
				</view>
			</view>
			
			<u-button :loading="registerLoading" @click="register" :class="{'start-login':phoneNumber!=''}" class="login-btn" :hair-line="false">立即注册</u-button>
			
			<view>
				<u-checkbox shape="circle" v-model="checked">我已阅读并同意：<text>《服务协议》</text>，<text>《隐私政策》</text></u-checkbox>
			</view>
			
		</view>
	</view>
</template>

<script>
	import { appServerSendMsg } from "../../utils/appServerApi.js"
	export default {
		data() {
			return {
				phoneNumber: '',
				checked:true,
				registerLoading:false
			}
		},
		onLoad() {
			
		},
		methods: {
			register(){
				if(this.phoneNumber.length!==11){
					this.$u.toast("请输入正确手机号")
					return
				}
				this.registerLoading = true
				appServerSendMsg(this.phoneNumber).then(res=>{
					this.$u.toast("验证码已发送")
					this.registerLoading = false
					uni.navigateTo({
						url:"./vercode?no="+this.phoneNumber
					})
				}).catch(err=>{
					console.log(err);
					this.$u.toast("发送验证码失败")
					this.registerLoading = false
				})
			},
			back(){
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	.container{
		padding: 52rpx 80rpx 0 80rpx;
		.header-warper{
			margin-top: 98rpx;
			.header {
				color: #333333;
				font-size: 52rpx;
				height: 74rpx;
				line-height: 74rpx;
			}
		}
		
		.form-item {
			margin: 88rpx 0 118rpx 0;
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
