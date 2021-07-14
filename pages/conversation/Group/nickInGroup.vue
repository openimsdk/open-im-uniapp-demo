<template>
	<view class="">
		<u-navbar title-width="400" title="My nickName in the group"/>
		
		<view class="nick-bar">
			<u-avatar size="72" src="../../../static/user.png"/>
			<u-input class="input-nick" v-model="nickName"/>
		</view>
		
		<view class="notice">
			<text>After the nickname is modified, it will only be displayed in this group, and members of the group can see it.</text>
		</view>
		
		<u-button class="complete-btn" type="primary">complete</u-button>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				nickName:""
			}
		},
		methods:{
			
		}
	}
</script>

<style lang="scss">
	.nick-bar{
		display: flex;
		align-items: center;
		margin-top: 24rpx;
		height: 96rpx;
		border-top: 1px solid #e0e0e0;
		border-bottom: 1px solid #e0e0e0;
		margin: 48rpx 96rpx;
		.input-nick{
			margin-left: 24rpx;
		}
	}
	.notice{
		margin: 30vh auto 10vh auto;
		color: #666666;
		text-align: center;
		width: 80vw;
	}
	.complete-btn{
		width: 40vw;
		margin: 0 auto;
	}
</style>
