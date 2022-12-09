<template>
	<view class="chat_header">
		<view class="self_info">
			<my-avatar :src="storeSelfInfo.faceURL" :desc="storeSelfInfo.nickname" size="48" />
			<view class="self_info_desc">
				<text class="company">托云信息技术</text>
				<view class="user_state">
					<text>{{storeSelfInfo.nickname}}</text>
					<view class="online_state">
						<view class="dot">
						</view>
						<text>手机在线</text>
					</view>
				</view>
			</view>
		</view>
		<view class="right_action">
			<view class="call_icon">
				<image src="@/static/images/common_call.png" ></image>
			</view>
			<view @click="showMore" class="more_icon">
				<image src="@/static/images/common_circle_add.png" ></image>
			</view>
			<u-overlay :show="moreMenuVisible" @click="moreMenuVisible = false" opacity="0">
				<!-- <u-transition duration="0" :show="moreMenuVisible"> -->
				<view :style="{top:popMenuPosition.top,right:popMenuPosition.right}" class="more_menu">
					<view @click="clickMenu(item)" v-for="item in moreMenus" :key="item.idx" class="menu_item">
						<image :src="item.icon" mode=""></image>
						<text>{{item.title}}</text>
					</view>
				</view>
				<!-- </u-transition> -->
				<!-- <view class="warp">
						<view class="rect" @tap.stop></view>
					</view> -->
			</u-overlay>

		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import {
		GroupType
	} from '@/constant';
	import {
		scanQrCodeResult
	} from '@/util/imCommon';
	export default {
		name: 'ChatHeader',
		components: {
			MyAvatar
		},
		data() {
			return {
				moreMenuVisible: false,
				popMenuPosition: {
					top: 0,
					right: 0
				},
				moreMenus: [{
						idx: 0,
						title: '扫一扫',
						icon: require("static/images/more_qr.png")
					},
					{
						idx: 1,
						title: '添加好友',
						icon: require("static/images/more_add_friend.png")
					},
					{
						idx: 2,
						title: '添加群聊',
						icon: require("static/images/more_add_group.png")
					},
					{
						idx: 3,
						title: '创建群聊',
						icon: require("static/images/more_create_group.png")
					},
				]
			};
		},
		computed: {
			...mapGetters(['storeSelfInfo'])
		},
		methods: {
			clickMenu({
				idx
			}) {
				switch (idx) {
					case 0:
						uni.scanCode({
							scanType: ['qrCode'],
							success: ({
								result
							}) => scanQrCodeResult(result)
						})
						break;
					case 1:
					case 2:
						uni.navigateTo({
							url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${idx === 2}`
						})
						break;
					case 3:
						uni.showActionSheet({
							itemList: ['普通群', '工作群'],
							success: ({
								tapIndex
							}) => {
								uni.navigateTo({
									url: `/pages/common/createGroup/index?type=${tapIndex ? GroupType.WorkingGroup : GroupType.NomalGroup}`
								})
							}
						})
						break;
					default:
						break;
				}
			},
			async showMore() {
				const {
					right,
					bottom
				} = await this.getEl('.more_icon')
				this.popMenuPosition.right = (uni.getWindowInfo().windowWidth - right) + 'px';
				this.popMenuPosition.top = bottom + 'px'
				this.moreMenuVisible = true
			},
			getEl(el) {
				return new Promise((resolve) => {
					const query = uni.createSelectorQuery().in(this)
					query.select(el).boundingClientRect(data => {
						// 存在data，且存在宽和高，视为渲染完毕
						resolve(data)
					}).exec();
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.chat_header {
		@include btwBox();
		padding: 36rpx 44rpx;
		margin-top: var(--status-bar-height);

		.self_info {
			@include btwBox();

			&_desc {
				@include colBox(true);
				margin-left: 24rpx;
				color: $uni-text-color;

				.company {
					@include nomalEllipsis() font-size: 24rpx;
					margin-bottom: 10rpx;
					max-width: 300rpx;
				}

				.user_state {
					@include vCenterBox();

					.online_state {
						@include vCenterBox();
						margin-left: 24rpx;
						font-size: 24rpx;

						.dot {
							background-color: #10CC64;
							width: 12rpx;
							height: 12rpx;
							border-radius: 50%;
							margin-right: 12rpx;
						}
					}
				}

			}
		}

		.right_action {
			display: flex;
			position: relative;
			

			.call_icon {
				margin-right: 24rpx;
				image {
					width: 23px;
					height: 23px;
				}
			}
			
			.more_icon {
				image {
					width: 24px;
					height: 23px;
				}
			}

			.more_menu {
				position: absolute;
				// bottom: 0;
				// left: 100%;
				z-index: 999;
				// transform: translate(-100%, 100%);
				box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
				width: max-content;
				border-radius: 12rpx;
				background-color: #fff;
				padding: 12rpx 0;

				.menu_item {
					display: flex;
					padding: 20rpx 48rpx;
					font-size: 28rpx;
					color: $uni-text-color;
					border-bottom: 1px solid #F0F0F0;

					image {
						width: 24px;
						height: 24px;
						margin-right: 24rpx;
					}

					&:last-child {
						border: none;
					}
				}

			}
		}
	}
</style>
