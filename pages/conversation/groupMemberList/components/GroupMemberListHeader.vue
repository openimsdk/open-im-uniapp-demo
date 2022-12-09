<template>
	<custom-nav-bar @leftClick="leftClick" :title="getTitle">
		<view v-show="!checkVisible && !isTransfer" @click="rightClick" class="more_container" slot="more">
			<u-icon class="more_dot" name="more-dot-fill" size="23" color="#333" />
			<u-transition :show="moreMenuVisible">
				<view class="more_menu">
					<view @click="inviteMember" class="menu_item">
						<text>邀请群员</text>
					</view>
					<view v-if="!isNomal" @click="removeMember" class="menu_item">
						<text>移除群员</text>
					</view>
				</view>
			</u-transition>
		</view>
	</custom-nav-bar>

</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import {
		ContactChooseTypes
	} from '@/constant';
	export default {
		name: "",
		components: {
			CustomNavBar
		},
		props: {
			checkVisible: {
				type: Boolean,
				default: false
			},
			isNomal: {
				type: Boolean,
				default: false
			},
			isTransfer: {
				type: Boolean,
				default: false
			},
			groupID: String
		},
		data() {
			return {
				moreMenuVisible: false
			};
		},
		computed: {
			getTitle() {
				return this.checkVisible ? '移除群成员' : "群成员"
			}
		},
		methods: {
			leftClick() {
				if (this.checkVisible) {
					this.$emit('update:checkVisible', false)
				}
			},
			rightClick() {
				this.moreMenuVisible = !this.moreMenuVisible
			},
			checkMenu() {
				if (this.moreMenuVisible) {
					this.moreMenuVisible = false
				}
			},
			inviteMember() {
				uni.navigateTo({
					url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Invite}&groupID=${this.groupID}`
				})
			},
			removeMember() {
				this.$emit('removeMember')
			}
		}
	}
</script>

<style lang="scss">
	.more_container {
		position: relative;

		.more_dot {
			padding: 24rpx;
			margin-right: 20rpx;
		}

		.more_menu {
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translate(-100%, 100%);
			box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
			width: max-content;
			border-radius: 8rpx;
			background-color: #fff;

			.menu_item {
				padding: 20rpx 48rpx;
				font-size: 28rpx;
				color: $uni-text-color;

				&:nth-child(1) {
					border-bottom: 1px solid #F0F0F0;
				}
			}
		}
	}
</style>
