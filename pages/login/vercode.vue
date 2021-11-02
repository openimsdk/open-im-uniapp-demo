<template>
	<view>
		<view class="container">
			<u-icon @click="back" name="../../static/arrow_left.png" size="72" color="#1e6bed" />
			<view class="header-warper">
				<text class="header">验证码已发送至手机</text>
				<text class="num">{{`+86 ${num}`}}</text>
			</view>
			<text class="tip">请输入验证码</text>
			
			<view class="code-bar">
				<xt-verify-code :size="6" type="bottom" v-model="verifyCode" @confirm="confirm"></xt-verify-code>
				<view style="margin-top: 42rpx;font-size: 24rpx;">
					<text><text class="primary-text">{{`${time} s`}}</text>后<text @click="reSend" class="primary-text" :class="{'disable-text':!reSendStatus}">重发验证码</text></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { appServerSendMsg,appServerVerifyCode } from "../../utils/appServerApi.js"
	export default {
		data() {
			return {
				num:"",
				verifyCode:"",
				timer:null,
				time:60,
				reSendStatus:false
			}
		},
		methods: {
			confirm(code){
				appServerVerifyCode(this.num,code).then(res=>{
					if(res.verifyCode===1){
						this.$u.toast("验证成功")
						clearInterval(this.timer)
						uni.navigateTo({
							url:"./setpsd?no="+this.num+"&code="+code
						})
					}else{
						this.$u.toast("验证码已失效")
					}
				}).catch(err=>{
					this.$u.toast("验证失败")
				})
			},
			reSend(){
				if(this.reSendStatus&&this.time===0){
					appServerSendMsg(this.phoneNumber).then(res=>{
						this.$u.toast("验证码已发送")
						this.setTimer()
					}).catch(err=>{
						this.$u.toast("发送验证码失败")
					})
				}
			},
			setTimer(){
				this.time = 60
				this.reSendStatus = false
				this.timer = setInterval(()=>{
					if(this.time>0){
						this.time-=1
					}else{
						clearInterval(this.timer)
						this.reSendStatus = true
					}
				},1000)
			},
			back(){
				clearInterval(this.timer)
				uni.navigateBack()
			}
		},
		mounted() {
			this.setTimer()
		},
		onLoad:function(options){
			this.num = options.no
		},
		onUnload() {
			clearInterval(this.timer)
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 52rpx 80rpx 0 80rpx;
		.header-warper{
			display: flex;
			flex-direction: column;
			margin-top: 98rpx;
			.header {
				color: #333333;
				font-size: 52rpx;
				height: 74rpx;
				line-height: 74rpx;
			}
			.num{
				margin-top: 8rpx;
				margin-bottom: 56rpx;
				color: #1D6BED;
			}
		}
		.tip{
			font-size: 24rpx;
			color: #333333;
		}
		.code-bar{
			margin-top: 12rpx;
			.primary-text{
				color: #1D6BED;
			}
			.disable-text{
				color: #333333;
			}
		}
	}
</style>
