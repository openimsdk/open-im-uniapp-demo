<template>
	<view class="user_card_container">
		<custom-nav-bar title="" />

		<view class="base_info">
			<my-avatar :desc="sourceUserInfo.remark || sourceUserInfo.nickname" :src="sourceUserInfo.faceURL"
				size='48' />
			<view>
				<view class="user_name">
					<!-- <text>{{sourceUserInfo.remark || sourceUserInfo.nickname}}</text> -->
					<text class="text">{{getShowName}}</text>
					<view class="online_state">
						<view class="dot" :style="{backgroundColor:isOnline ? '#10CC64' : '#999'}">
						</view>
						<view class="online_str">{{onlineStr}}</view>
					</view>
				</view>
			</view>
		</view>

		<view class="info_row">
			<user-info-row-item lable="ID号" :content="sourceUserInfo.userID" />
		</view>


		<view v-if="isFriend" class="info_row">
			<user-info-row-item @click="toMoreInfo" lable="个人资料" arrow />
		</view>

		<!-- <view class="info_row">
			<user-info-row-item lable="查看动态" arrow />
		</view> -->

		<view class="action_row">
			<view @click="toDesignatedConversation" class="action_item">
				<img src="static/images/user_card_message.png" alt="">
				<text>发消息</text>
			</view>
			<view class="action_item">
				<img src="static/images/user_card_call.png" alt="">
				<text>OpenIM电话</text>
			</view>
			<view @click="toAddFriend" v-if="!isFriend" class="action_item">
				<img src="static/images/user_card_add.png" alt="">
				<text>添加好友</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		SessionType
	} from '@/constant'
	import {
		getDesignatedUserOnlineState,
		navigateToDesignatedConversation
	} from '@/util/imCommon'
	import IMSDK from '@/util/compatibleIM'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import UserInfoRowItem from './components/UserInfoRowItem.vue'
	import {
		businessSearchUserInfo
	} from '@/api/login'
	import {
		filterEmptyValue
	} from '@/util/common'

	export default {
		components: {
			CustomNavBar,
			MyAvatar,
			UserInfoRowItem
		},
		data() {
			return {
				sourceID: '',
				sourceUserInfo: {},
				onlineStr: '离线',
				isOnline: false,
			};
		},
		computed: {
			...mapGetters(['storeFriendList', 'storeCurrentMemberInGroup', 'storeCurrentUserID',]),
			isFriend() {
				return this.storeFriendList.findIndex(friend => friend.userID === this.sourceID) !== -1
			},
			getShowName() {
				let suffix = ''
				if (this.sourceUserInfo.remark) {
					suffix = `(${this.sourceUserInfo.remark})`
				}
				return this.sourceUserInfo.nickname + suffix
			},
		},
		onLoad(options) {
			const {
				sourceID,
				sourceInfo,
			} = options;
			if (sourceID) {
				this.sourceID = sourceID;
				this.getSourceUserInfo()
			} else {
				const info = JSON.parse(sourceInfo)
				this.sourceID = info.userID;
				this.sourceUserInfo = {
					...info
				}
			}
			this.getOnlineState()
		},
		methods: {
			async getSourceUserInfo() {
				let info = null
				if (this.isFriend) {
					info = this.storeFriendList.find(friend => friend.userID === this.sourceID)
				} else {
					try {
						const {
							totalNumber,
							userFullInfoList
						} = await businessSearchUserInfo(this.sourceID)
						if (totalNumber > 0) {
							const {
								data
							} = await IMSDK.compatibleAPI(IMSDK.IMMethods.GetUsersInfo, IMSDK.uuidv4(), [this
								.sourceID
							])
							const imData = data[0]?.friendInfo ?? data[0]?.publicInfo ?? {}
							const businessData = userFullInfoList[0];
							filterEmptyValue(businessData)
							info = {
								...imData,
								...businessData
							}
						}
					} catch (e) {
						info = {}
					}
				}
				this.sourceUserInfo = {
					...info
				}
			},
			async getOnlineState() {
				getDesignatedUserOnlineState(this.sourceID).then((str) => {
					this.isOnline = str !== '离线'
					this.onlineStr = str
				}).catch(() => this.isOnline = false)
			},
			toAddFriend() {
				uni.$u.route('/pages/common/sendAddRequest/index', {
					isGroup: false,
					sourceID: this.sourceID,
					isScan: false,
					notNeedVerification: false,
				})
			},
			toDesignatedConversation() {
				navigateToDesignatedConversation(this.sourceID, SessionType.Single, this.memberInfo !== null)
					.catch(() => uni.$u.toast('获取会话信息失败'))
			},
			toMoreInfo() {
				uni.navigateTo({
					url: `/pages/common/userCardMore/index?sourceInfo=${JSON.stringify(this.sourceUserInfo)}`
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.user_card_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F6F6F6;
		overflow-y: auto;
		position: relative;

		.base_info {
			@include vCenterBox();
			background-color: #fff;
			padding: 44rpx;
			margin-bottom: 18rpx;

			.u-avatar {
				margin-right: 24rpx;
			}

			.user_name {
				display: flex;
				margin-bottom: 12rpx;

				.text {
					@include nomalEllipsis();
					max-width: 300rpx;
				}
			}

			.company {
				font-size: 28rpx;
				color: $u-primary;
			}

		}

		.info_row {
			background-color: #fff;
			margin-bottom: 24rpx;
		}

		.mute_right {
			display: flex;
			align-items: center;
		}

		.company_row {
			padding: 20rpx 0;

			.desc_title {
				padding-left: 44rpx;
			}

			.company_info {}

			/deep/.title {
				width: 200rpx;
				color: #999 !important;
			}

		}

		.action_row {
			@include vCenterBox();
			justify-content: space-around;
			margin: 44rpx;
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;

			.action_item {
				@include colBox(false);
				align-items: center;
				color: $u-primary;

				img {
					width: 100rpx;
					height: 100rpx;
					margin-bottom: 12rpx;
				}
			}
		}

		.online_state {
			@include vCenterBox();
			margin-left: 24rpx;
			font-size: 24rpx;
			color: #999;

			.dot {
				background-color: #10CC64;
				width: 12rpx;
				height: 12rpx;
				border-radius: 50%;
				margin-right: 12rpx;
			}

			.online_str {
				@include nomalEllipsis();
				max-width: 280rpx;
			}
		}
	}
</style>
