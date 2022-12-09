<template>
	<view @click="clickItem" class="user_item">

		<view v-if="checkVisible" class="check_wrap"
			:class="{'check_wrap_active':checked,'check_wrap_disabled':disabled}">
			<u-icon v-show="checked" name="checkbox-mark" size="12" color="#fff" />
		</view>

		<my-avatar :src="item.faceURL" :desc="item.remark || item.nickname" :isGroup="item.groupName !== undefined"
			size="42" />
		<view class="user_item_details">
			<text class="user_name">{{item.remark||item.nickname||item.groupName}}</text>
			<text v-if="item.roleLevel === 2" class="user_role">群主</text>
			<text v-if="item.roleLevel === 3" class="user_role admin_role">管理员</text>
			<view class="bottom_line" />
		</view>

		<slot name="action"></slot>
	</view>
</template>

<script>
	import MyAvatar from '@/components/MyAvatar/index.vue'
	export default {
		name: "UserItem",
		components: {
			MyAvatar
		},
		props: {
			checkVisible: {
				type: Boolean,
				default: false
			},
			checked: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			item: Object
		},
		data() {
			return {

			};
		},
		methods: {
			clickItem() {
				if (!this.disabled) {
					this.$emit(this.checkVisible ? 'updateCheck' : 'itemClick', this.item)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.user_item {
		@include vCenterBox();
		padding: 24rpx 44rpx;
		color: $uni-text-color;
		position: relative;

		.check_wrap {
			@include centerBox();
			box-sizing: border-box;
			width: 40rpx;
			min-width: 40rpx;
			height: 40rpx;
			min-height: 40rpx;
			border: 2px solid #979797;
			border-radius: 50%;
			margin-top: 16rpx;
			margin-right: 24rpx;

			&_active {
				background-color: #1D6BED;
				border: none;
			}

			&_disabled {
				background-color: #c8c9cc;
			}
		}

		&_details {
			@include vCenterBox();
			margin-left: 24rpx;
			width: 100%;
			position: relative;

			.bottom_line {
				height: 1px;
				width: 100%;
				background-color: #F0F0F0;
				position: absolute;
				bottom: -44rpx;
			}

			.user_name {
				@include nomalEllipsis();
				max-width: 60%;
				color: $uni-text-color;
			}

			.user_role {
				font-size: 24rpx;
				background-color: #f4da9a;
				color: #FF8C00;
				padding: 8rpx 24rpx;
				border-radius: 24rpx;
				margin-left: 24rpx;
			}

			.admin_role {
				background-color: #A2C9F8;
				color: #2691ED;
			}
		}

	}

	.u-list-item:last-child {
		.bottom_line {
			height: 0;
		}
	}
</style>
