<template>
	<view @click="toUserInfo" class="card_message_container">
		<view class="card_info">
			<my-avatar :src="cardInfo.faceURL" :desc="cardInfo.nickname" size="42" />
			<text class="card_name">{{cardInfo.nickname}}</text>
		</view>
		<view class="card_desc">
			<text>名片</text>
		</view>
	</view>
</template>

<script>
	import MyAvatar from '@/components/MyAvatar/index.vue'
	export default {
		name: "CardMessageRender",
		components: {
			MyAvatar
		},
		props: {
			message: Object
		},
		data() {
			return {

			};
		},
		computed: {
			cardInfo() {
				let info = {}
				try {
					info = JSON.parse(this.message.content)
				} catch (error) {}
				return info
			}
		},
		methods: {
			toUserInfo() {
				uni.navigateTo({
					url: `/pages/common/userCard/index?sourceID=${this.cardInfo.userID}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card_message_container {
		@include colBox(false);
		background-color: #fbfbfb;
		box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
		border-radius: 12rpx;
		width: 444rpx;
		border: 1px solid #ECECEC;

		.card_info {
			@include vCenterBox();
			padding: 24rpx 32rpx;
			border-bottom: 1px solid #E9E9E9;

			.card_name {
				@include ellipsisWithLine(1);
				margin-left: 24rpx;
			}
		}

		.card_desc {
			padding-left: 42rpx;
			color: #999;
		}
	}
</style>
