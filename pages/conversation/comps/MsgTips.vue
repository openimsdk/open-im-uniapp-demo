<template>
	<view :id="msg.positionId" v-if="!(contentTypeFilter(msg.contentType))&&msg.contentType!=112" class="agree-msg">
		<text v-if="ms.contentType==111">{{msg.sendID==vuex_user_info.uid?"你撤回了一条消息":msg.senderNickName+" 撤回了一条消息"}}</text>
		<text>{{JSON.parse(msg.content).defaultTips}}</text>
	</view>
</template>

<script>
	export default {
		props:{
			msg:Object
		},
		data(){
			return {
				
			}
		},
		methods:{
			contentTypeFilter(type) {
				const msgTypeList = [101, 102, 103, 104, 106]
				return msgTypeList.indexOf(type) > -1
			},
		}
	}
</script>

<style>
	.agree-msg {
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		font-size: 24rpx;
		color: #e5e5e5;
	}
</style>
