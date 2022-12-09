<template>
	<view class="selected_item">
		<view class="left_info">
			<my-avatar :src="source.faceURL" :desc="source.nickname" :isGroup="source.groupID !== undefined" size="42" />
			<text>{{source.nickname || source.groupName}}</text>
		</view>
		<view>
			<u-button @click="action" plain text="移除" type="primary" />
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
			source: Object
		},
		data() {
			return {

			};
		},
		methods: {
			action() {
				this.$emit('removeItem')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.selected_item {
		@include btwBox();
		padding: 20rpx 0;

		.left_info {
			@include vCenterBox();

			.u-avatar {
				margin-right: 24rpx;
			}
		}

		.u-button {
			height: 48rpx;
		}
	}
</style>
