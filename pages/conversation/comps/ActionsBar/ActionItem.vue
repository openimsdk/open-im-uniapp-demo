<template>
	<view @click="clickAction" class="operation-item">
		<u-icon class="op-icon" :style="{marginTop:text=='视频通话'?'12rpx':'0rpx'}" :size="size" :name="icon" />
		<text class="op-text">{{text}}</text>
	</view>
</template>

<script>
	export default {
		props:{
			icon:String,
			text:String,
			size:Number
		},
		data(){
			return {
				
			}
		},
		methods:{
			clickAction(){
				this.$emit("click",this.text)
			}
		}
	}
</script>

<style lang="scss">
	.op-icon{
		margin-bottom: 12rpx;
	}
	.op-text{
		color: #5B97EB;
		font-size: 24rpx;
	}
</style>
