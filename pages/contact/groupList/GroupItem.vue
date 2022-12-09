<template>
	<view @click="toGroupCard" class="group_item">
		<my-avatar :src="groupInfo.faceURL" :isGroup="true" size="42" />
		<view class="group_info">
			<text class="group_name">{{groupInfo.groupName}}</text>
			<view class="group_details">
				<text>{{`${groupInfo.memberCount}人`}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import MyAvatar from "@/components/MyAvatar/index.vue"
	export default {
		name: "",
		components: {
			MyAvatar
		},
		props: {
			groupInfo: Object
		},
		data() {
			return {

			};
		},
		methods: {
			toGroupCard() {
				uni.navigateTo({
					url: `/pages/common/groupCard/index?sourceID=${this.groupInfo.groupID}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.group_item {
		@include vCenterBox();
		padding: 24rpx 44rpx;

		.group_info {
			margin-left: 24rpx;

			.group_name {
				@include nomalEllipsis() max-width: 400rpx;
			}

			.group_details {
				font-size: 28rpx;
				color: #999;
				margin-top: 8rpx;
			}
		}
	}
</style>
