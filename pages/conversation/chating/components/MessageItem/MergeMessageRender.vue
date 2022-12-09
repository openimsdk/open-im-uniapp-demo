<template>
	<view @click="toPreview" class="merge_message_container bg_container">
		<view class="merge_title">
			<text>{{message.mergeElem.title}}</text>
		</view>
		<view class="merge_desc">
			<text v-for="(item,idx) in message.mergeElem.abstractList" :key="idx" class="merge_item">{{item}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: "CardMessageRender",
		components: {},
		props: {
			message: Object
		},
		data() {
			return {

			};
		},
		methods: {
			toPreview() {
				
			}
		}
	}
</script>

<style lang="scss" scoped>
	.merge_message_container {
		padding: 0 !important;

		.merge_title {
			padding: 12rpx 24rpx;
			border-bottom: 1px solid #cdd8e7;

			text {
				@include ellipsisWithLine(1);
			}
		}

		.merge_desc {
			@include colBox(false);
			padding: 12rpx 24rpx;
			font-size: 24rpx;
			color: #666;

			.merge_item {
				@include ellipsisWithLine(2);
				padding: 4rpx 0;
			}
		}
	}
</style>
