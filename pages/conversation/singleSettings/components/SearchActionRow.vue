<template>
	<view class="search_row">
		<text>查找聊天记录</text>
		<view class="action_list">
			<view @click="clickAction(item)" class="action_item" v-for="item in searchActions" :key="item.idx">
				<image :src="item.icon" alt="">
					<text>{{item.title}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "",
		components: {},
		props: {},
		data() {
			return {
				searchActions: [{
						idx: 0,
						title: '搜索',
						icon: require('static/images/single_setting_text.png')
					},
					{
						idx: 1,
						title: '图片',
						icon: require('static/images/single_setting_image.png')
					},
					{
						idx: 2,
						title: '视频',
						icon: require('static/images/single_setting_video.png')
					},
					{
						idx: 3,
						title: '文件',
						icon: require('static/images/single_setting_file.png')
					},
				],
			};
		},
		methods: {
			clickAction({
				idx
			}) {
				
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search_row {
		@include colBox(false);
		padding: 36rpx 44rpx;
		margin: 12rpx 0;
		background-color: #fff;
		color: $uni-text-color;

		.action_list {
			display: flex;
			justify-content: space-around;
			margin-top: 36rpx;
			margin-bottom: 12rpx;

			.action_item {
				@include colBox(true);
				padding: 0 48rpx;

				image {
					width: 46rpx;
					height: 46rpx;
				}

				text {
					font-size: 24rpx;
					color: #666;
					margin-top: 16rpx;
				}
			}
		}
	}
</style>
