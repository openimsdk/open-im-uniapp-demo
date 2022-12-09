<template>
	<u-swipe-action-item :index="source.conversationID" @click="clickConversationMenu($event,source)"
		:name="source.conversationID" :options="getSwipeActions || []">
		<view @tap.prevent="clickConversationItem" class="conversation_item"
			:class="{conversation_item_active:source.isPinned}">
			<view class="left_info">
				<my-avatar :isGroup="isGroup" :isNotify="isNotify" :src="source.faceURL" :desc="source.showName"
					size='48' />
				<view class="details">
					<text>{{source.showName}}</text>
					<view class="lastest_msg_wrap">
						<text class="lastest_msg_content">{{latestMessage}}</text>
						<!-- <u-parse class="lastest_msg_content"
							:content="latestMessage" /> -->
					</view>
				</view>
			</view>
			<view class="right_desc">
				<text class="send_time">{{latestMessageTime}}</text>
				<image v-if="notAccept" src="@/static/images/conversation_not_accept.png">
					<u-badge v-else max="99" :value="source.unreadCount"></u-badge>
			</view>
		</view>
	</u-swipe-action-item>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import UParse from '@/components/gaoyia-parse/parse.vue'
	import {
		OptType,
		GroupAtType,
		SessionType,
		GroupSessionTypes
	} from '@/constant'
	import {
		parseMessageByType,
		formatConversionTime,
		prepareConversationState
	} from "@/util/imCommon"

	export default {
		components: {
			MyAvatar,
			UParse
		},
		props: {
			source: {
				type: Object
			}
		},
		computed: {
			latestMessage() {
				if (this.source.latestMsg === "") return "";
				let parsedMessage
				try {
					parsedMessage = JSON.parse(this.source.latestMsg);
				} catch (e) {}
				if (!parsedMessage) return ''
				return parseMessageByType(parsedMessage);
			},
			latestMessageTime() {
				return this.source.latestMsgSendTime ? formatConversionTime(this.source.latestMsgSendTime) : ''
			},
			notAccept() {
				return this.source.recvMsgOpt !== OptType.Nomal
			},
			isGroup() {
				return GroupSessionTypes.includes(this.source.conversationType)
			},
			isNotify() {
				return this.source.conversationType === SessionType.Notification
			},
			getSwipeActions() {
				let actions = [{
						text: `${this.source.isPinned?'取消':''}置顶`,
						style: {
							backgroundColor: '#3c9cff'
						}
					},
					{
						text: '移除',
						style: {
							backgroundColor: '#f9ae3d'
						}
					}
				];
				if (this.source.unreadCount > 0) {
					actions = [{
						text: '标记已读',
						style: {
							backgroundColor: '#f9ae3d'
						}
					}, ...actions]
				}
				return actions
			}
		},
		data() {
			return {};
		},
		methods: {
			clickConversationItem() {
				console.log(this.source);
				prepareConversationState(this.source);
			},
			clickConversationMenu({
				name,
				index
			}, item) {
				switch (index) {
					case 0:
						IMSDK.compatibleAPI(IMSDK.IMMethods.PinConversation, IMSDK.uuidv4(), item.conversationID, !item
							.isPinned).catch(() => uni.$u.toast('置顶失败'));
						break;
					case 1:
						IMSDK.compatibleAPI(IMSDK.IMMethods.DeleteConversationFromLocalAndSvr, IMSDK.uuidv4(), item
								.conversationID
							).then(() => this.$store.dispatch('conversation/delConversationByCID', item.conversationID))
							.catch(() => uni.$u.toast('移除失败'));
						break;
					case 2:
						IMSDK.compatibleAPI(IMSDK.IMMethods.MarkMessageAsReadByConID, IMSDK.uuidv4(), item
							.conversationID,
							[]).catch(() => uni.$u.toast('操作失败'));
						break;
					default:
						break;
				}
				this.$emit('closeAllSwipe')
			},
		}
	}
</script>

<style lang="scss" scoped>
	.conversation_item {
		@include btwBox();
		flex-direction: row;
		padding: 12rpx 44rpx;
		margin-bottom: 8rpx;
		position: relative;

		&_active {
			background-color: #F3F3F3;
		}

		.left_info {
			@include btwBox();

			.details {
				@include colBox(true);
				margin-left: 24rpx;
				color: $uni-text-color;

				.lastest_msg_wrap {
					display: flex;
					font-size: 24rpx;
					margin-top: 10rpx;
					color: #666;

					.lastest_msg_prefix {
						margin-right: 6rpx;

						&_active {
							color: $u-primary;
						}
					}

					.lastest_msg_content {
						max-width: 60vw;
						// /deep/uni-view {
							@include nomalEllipsis();
						// }
					}
				}
			}
		}

		.right_desc {
			@include colBox(true);
			align-items: flex-end;
			position: absolute;
			right: 44rpx;
			top: 16rpx;

			.send_time {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 16rpx;
			}

			.u-badge {
				width: fit-content;
			}

			image {
				width: 20px;
				height: 20px;
			}
		}
	}
</style>
