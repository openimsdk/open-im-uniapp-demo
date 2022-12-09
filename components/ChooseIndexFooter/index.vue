<template>
	<view class="member_checked_desc">
		<view @click="showSelected = true" class="left_info">
			<text class="text">{{`已选择：${choosedData.length}人`}}</text>
			<u-icon name="arrow-up" size="14" color="#007aff" />
		</view>
		<view class="">
			<u-button :loading="comfirmLoading" @click="clickComfirm" :disabled="choosedData.length === 0" type="primary" :text="isRemove ? '移除' : '确认'" />
			<u-popup round="24" :show="showSelected" mode="bottom" @close="close">
				<view class="selected_container">
					<view class="top_desc">
						<text>{{`已选择：${choosedData.length}人`}}</text>
						<text @click="close" class="comfirm_text">确认</text>
					</view>
					<u-list class="selected_list">
						<u-list-item v-for="item in choosedData" :key="item.userID || item.groupID">
							<selected-member @removeItem="removeItem(item)" :source="item" />
						</u-list-item>
					</u-list>
				</view>
			</u-popup>
		</view>
		
	</view>
</template>

<script>
	import SelectedMember from "./SelectedMember.vue"
	export default {
		name: "ChooseIndexFooter",
		components: {
			SelectedMember
		},
		props: {
			isRemove: Boolean,
			choosedData: Array,
			comfirmLoading: Boolean
		},
		data() {
			return {
				showSelected: false,
				showConfirmModal: false,
			};
		},
		methods: {
			close() {
				this.showSelected = false
			},
			removeItem(item) {
				this.$emit('removeItem', item)
			},
			clickComfirm() {
				this.$emit("confirm")
			},
			
		}
	}
</script>

<style lang="scss" scoped>
	.member_checked_desc {
		@include btwBox();
		align-items: flex-start;
		padding: 24rpx 44rpx 0;
		height: 72px;
		max-height: 72px;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.15);

		.left_info {
			@include vCenterBox();
			color: $uni-color-primary;

			.text {
				font-size: 30rpx;
				margin-right: 24rpx;
			}
		}

		.u-button {
			width: 72px;
			height: 32px;
			margin: 0;
		}
	}

	.selected_container {
		padding: 44rpx;

		.top_desc {
			@include btwBox();
			margin-bottom: 20rpx;

			.comfirm_text {
				color: $uni-color-primary;
				margin-right: 24rpx;
			}
		}

		.selected_list {
			height: 60vh !important;
			overflow-y: auto;
		}
	}
</style>
