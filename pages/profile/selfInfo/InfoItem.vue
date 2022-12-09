<template>
	<view @click="clickItem" class="info_item">
		<view class="left_label">
			<text>{{title}}</text>
		</view>
		<view class="right_value">
			<slot name="value">
				<text class="content">{{content}}</text>
			</slot>
			<u-icon v-if="showArrow" name="arrow-right" size="16" color="#999"></u-icon>
		</view>
		<u-loading-icon v-show="loading" class="loading_icon"></u-loading-icon>
	</view>
</template>

<script>
	export default {
		name:"",
		props:{
			title: String,
			content: String,
			showArrow: {
				type: Boolean,
				default: true,
			},
			loading: {
				type: Boolean,
				default: false,
			}
		},
		data() {
			return {
				
			};
		},
		methods:{
			clickItem(){
				this.$emit('click')
			}
		}
	}
</script>

<style lang="scss" scoped>
.info_item {
			@include btwBox();
			height: 112rpx;
			padding: 0 44rpx;
			color: $uni-text-color;
			border-bottom: 1px solid rgba(153,153,153,0.3);
			position: relative;
			
			.right_value {
				@include vCenterBox();
				.content {
					font-size: 28rpx;
					color: #999;
				}
				.u-icon {
					margin-left: 12rpx;
				}
			}
			
			.loading_icon {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%,-50%);
			}
		}
</style>