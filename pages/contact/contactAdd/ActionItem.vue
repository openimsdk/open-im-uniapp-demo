<template>
	<view class="action_item" @click="onClick">
		<slot name="icon">
			<view class="action_icon">
				<image :src="action.icon" mode=""></image>
			</view>
		</slot>

		<view class="action_details">
			<text class="title">{{action.title}}</text>
			<text class="desc">{{action.desc}}</text>
			<view class="bottom_line"></view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "",
		props: {
			action: Object
		},
		data() {
			return {

			};
		},
		methods: {
			onClick(){
				this.$emit('click',this.action)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.action_item {
		@include vCenterBox();
		padding: 24rpx 44rpx;

		.action_icon {
			width: 30px;
			height: 30px;

			image {
				max-width: 100%;
				max-height: 100%;
			}
		}

		.action_details {
			@include colBox(false);
			margin-left: 48rpx;
			width: 100%;
			position: relative;

			.title {
				font-weight: 500;
				padding-bottom: 12rpx;
			}

			.desc {
				font-size: 24rpx;
				color: #999;
			}

			.bottom_line {
				height: 1px;
				width: 100%;
				background-color: #F0F0F0;
				position: absolute;
				bottom: -24rpx;
			}

		}
	}
</style>
