<template>
	<view>
		<view class="container">
			<view class="header-warper">
				<text class="header">请设置账号密码</text>
				<text class="tip">登陆密码用于登陆OpenIM账号</text>
			</view>
			
			<view class="form-item">
				<text class="form-title">密码</text>
				<view class="form-input">
					<u-input placeholder="请输入密码" v-model="password" type="password" :border="false" />
				</view>
				<text class="tip2">需6～20位字符</text>
			</view>
			
			<u-button :loading="nextLoading" @click="setPwd" :class="{'next-step':password!=''}" class="ready" :hair-line="false">下一步</u-button>
		</view>
	</view>
</template>

<script>
	import { appServerSetPwd,importRelationShip } from "../../utils/appServerApi.js"
	import md5 from 'md5'
	export default {
		data() {
			return {
				password: '',
				checked: true,
				num:"",
				code:"",
				nextLoading:false
			}
		},
		methods: {
			setPwd(){
				if(this.password.length<6) {
					this.$u.toast("请输入正确格式的密码")
					return
				}
				appServerSetPwd(this.num,md5(this.password),this.code).then(res=>{
					console.log(res);
					this.sdkLogin(res.uid,res.token)
				}).catch(err=>console.log(err))
			},
			sdkLogin(uid,token){
					this.$openSdk.login(uid, token, async val => {
						console.log(val);
						if (val.err==undefined) {
							this.$u.vuex('vuex_last_user',uid)
							this.$u.vuex('vuex_token',token)
							const reqData = [uid]
							// await importRelationShip(this.num)
							this.nextLoading = false
							uni.navigateTo({
								url:"./setInfo"
							})
						} else {
							this.nextLoading = false
							this.$u.toast("注册失败")
						}
					});
			},
		},
		onLoad:function(options){
			this.num = options.no
			this.code = options.code
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 216rpx 80rpx 0 80rpx;

		.header-warper {
			margin-top: 98rpx;
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
				margin-bottom: 56rpx;
				color: #1D6BED;
				font-size: 32rpx;
			}
		}
		
		.form-item {
			margin-bottom: 76rpx;
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
				margin-bottom: 18rpx;
		
				.uni-input-placeholder {
					font-size: 32rpx;
					font-weight: 400;
				}
			}
			.tip2{
				font-size: 24rpx;
				color: #1D6BED;
			}
		}
		
		.ready {
			background-color: rgba($color: #D8D8D8, $alpha: 0.4);
			color: #898989;
			margin-bottom: 36rpx;
			border-radius: 8rpx;
		}
		
		.next-step {
			background-color: #1D6BED;
			color: #FFFFFF;
		}
		
		.u-btn--bold-border {
			border: none;
		}
	}
</style>
