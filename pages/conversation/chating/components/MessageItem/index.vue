<template>
	<view v-if="!getNoticeContent" :id="`auchor${source.clientMsgID}`" class="message_item"
		:class="{'message_item_self':isSender}">
		<my-avatar @click="showInfo" size='42' :desc="source.senderNickname" :src="source.senderFaceUrl" />
		<view class="message_container">
			<view class="message_sender">
				<text>{{source.senderNickname}}</text>
			</view>
			<view @longpress.prevent="showMenu" class="message_content_wrap">
				<text-message-render v-if="showTextRender" :message="source" />
				<media-message-render v-else-if="showMediaRender" :message="source" />
				<audio-message-render v-else-if="showAudioRender" :message="source" :isSender='isSender' />
				<file-message-render v-else-if="showFileRender" :message="source" />
				<card-message-render v-else-if="showCardRender" :message="source" />
				<merge-message-render v-else-if="showMergeRender" :message="source" />
				<location-message-render v-else-if="showLocationRender" :message="source" />
				<error-message-render v-else />

			</view>
			<quote-message-render :message="source" v-if="isQuoteMessage" />
			<message-read-state :message="source" v-if="isSender && isSuccessMessage" />

			<transition name="fade">
				<message-menu v-if="menuState.visible" :message="source" :isSender='isSender'
					:is_bottom="menuState.isBottom" :paterWidth="menuState.paterWidth" />
			</transition>
		</view>
		<view class="message_send_state">
			<u-loading-icon v-if="showSending" />
			<image @click="reSendMessage" v-if="isFailedMessage" src="@/static/images/chating_message_failed.png">
		</view>
	</view>

	<view v-else class="notice_message_container" :id="`auchor${source.clientMsgID}`">
		<text>{{getNoticeContent}}</text>
	</view>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import ChatingList from '../ChatingList.vue'
	import TextMessageRender from './TextMessageRender.vue'
	import MediaMessageRender from './MediaMessageRender.vue'
	import AudioMessageRender from './AudioMessageRender.vue'
	import FileMessageRender from './FileMessageRender.vue'
	import CardMessageRender from './CardMessageRender.vue'
	import MergeMessageRender from './MergeMessageRender.vue'
	import QuoteMessageRender from './QuoteMessageRender.vue'
	import LocationMessageRender from './LocationMessageRender.vue'
	import ErrorMessageRender from './ErrorMessageRender.vue'
	import MessageMenu from './MessageMenu.vue'
	import MessageReadState from './MessageReadState.vue'
	import {
		MessageStatus,
		MessageType,
		noticeMessageTypes,
		SessionType,
	} from "@/constant"
	import {
		tipMessaggeFormat
	} from '@/util/imCommon'

	const textRenderTypes = [
		MessageType.TEXTMESSAGE,
		MessageType.ATTEXTMESSAGE,
		MessageType.QUOTEMESSAGE,
	]

	const mediaRenderTypes = [
		MessageType.VIDEOMESSAGE,
		MessageType.PICTUREMESSAGE,
	]

	export default {
		components: {
			MyAvatar,
			TextMessageRender,
			MediaMessageRender,
			AudioMessageRender,
			FileMessageRender,
			CardMessageRender,
			MergeMessageRender,
			QuoteMessageRender,
			LocationMessageRender,
			ErrorMessageRender,
			MessageMenu,
			MessageReadState
		},
		props: {
			source: Object,
			preMessage: Object,
			isSender: {
				type: Boolean,
				default: false
			},
			menuOutsideFlag: Number
		},
		data() {
			return {
				menuState: {
					visible: false,
					isBottom: false,
					paterWidth: false,
				},
				count: 30,
				announcePublisher: {}
			}
		},
		computed: {
			showTextRender() {
				return textRenderTypes.includes(this.source.contentType)
			},
			showMediaRender() {
				return mediaRenderTypes.includes(this.source.contentType)
			},
			showAudioRender() {
				return this.source.contentType === MessageType.VOICEMESSAGE
			},
			showFileRender() {
				return this.source.contentType === MessageType.FILEMESSAGE
			},
			showCardRender() {
				return this.source.contentType === MessageType.CARDMESSAGE
			},
			showMergeRender() {
				return this.source.contentType === MessageType.MERGERMESSAGE
			},
			showLocationRender() {
				return this.source.contentType === MessageType.LOCATIONMESSAGE
			},
			isQuoteMessage() {
				return this.source.contentType === MessageType.QUOTEMESSAGE || this.source.atElem?.quoteMessage
			},
			isSuccessMessage() {
				return this.source.status === MessageStatus.Succeed
			},
			isFailedMessage() {
				return this.source.status === MessageStatus.Failed
			},
			showSending() {
				return this.source.status === MessageStatus.Sending
			},
			getNoticeContent() {
				const isNoticeMessage = noticeMessageTypes.includes(this.source.contentType)
				return !isNoticeMessage ? '' : tipMessaggeFormat(this.source, this.$store.getters.storeCurrentUserID)
			},
		},
		mounted() {
			this.$emit('messageItemRender', this.source.clientMsgID);
			this.isReadObserver();
		},
		watch: {
			menuOutsideFlag(newVal) {
				if (this.menuState.visible) {
					this.menuState.visible = false
				}
			},
		},
		methods: {
			reSendMessage() {
				IMSDK.IMApi.sendMessage(IMSDK.uuidv4(), JSON.stringify(this.source), this.source
					.recvID ?? "", this.source.groupID ?? "", IMSDK.offlinePushInfo);
			},
			async showMenu() {
				uni.createSelectorQuery().in(this).select('.message_content_wrap')
					.boundingClientRect(res => {
						console.log(res.top);
						this.menuState.paterWidth = res.width
						this.menuState.isBottom = res.top < 250
						this.menuState.visible = true
					}).exec()
			},
			isReadObserver() {
				if (this.isSender || this.source.isRead === true ||
					noticeMessageTypes.includes(this.source.contentType)) {
					return;
				}

				const observer = uni.createIntersectionObserver(ChatingList)
				observer.relativeTo('#scroll_view').observe(`#auchor${this.source.clientMsgID}`, ({
					intersectionRatio
				}) => {
					if (intersectionRatio > 0) {
						const funcName = this.source.sessionType === SessionType.Single ? IMSDK.IMMethods
							.MarkC2CMessageAsRead : IMSDK.IMMethods.MarkGroupMessageAsRead;
						const sourceID = this.source.groupID || this.source.sendID
						IMSDK.compatibleAPI(funcName, IMSDK.uuidv4(), sourceID, [this.source.clientMsgID]);
						observer.disconnect()
					}
				})
			},
			showInfo() {
				if (this.isSender) {
					return;
				}

				uni.navigateTo({
					url: `/pages/common/userCard/index?sourceID=${this.source.sendID}`
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.message_item {
		display: flex;
		flex-direction: row;
		padding: 0 44rpx 32rpx;
		// padding-top: 48rpx;
		position: relative;

		&_timeline {
			padding-top: 48rpx;
		}

		.time_gap_line {
			position: absolute;
			top: 12rpx;
			left: 50%;
			transform: translateX(-50%);
			font-size: 24rpx;
			color: #999;
		}

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

		.message_container {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 24rpx;
			// text-align: start;
			max-width: 80%;
			position: relative;

			.message_sender {
				@include nomalEllipsis();
				max-width: 480rpx;
				font-size: 24rpx;
				color: #666;
				margin-bottom: 6rpx;
			}


			.message_content_wrap {
				@include vCenterBox();
				@include ellipsisWithLine(10);
				text-align: start;
				font-size: 14px;
				color: $uni-text-color;
				width: fit-content;
				max-width: 100%;

				.bg_container {
					padding: 16rpx 24rpx;
					border-radius: 8rpx;
					background-color: #F0F0F0;
				}

			}

			.message_menu_container {
				display: flex;
				flex-wrap: wrap;
				min-width: 145px;
				max-width: 145px;
				background-color: #5b5b5b;
				padding: 12px 20px;
				padding-bottom: 0;
				border-radius: 8px;
				position: absolute;
				top: -12px;
				left: 20%;
				transform: translateY(-100%);
				z-index: 9;

				&_bottom {
					top: unset;
					transform: translateY(12px);
				}

				.message_menu_item {
					@include colBox(false);
					align-items: center;
					font-size: 12px;
					color: #fff;
					padding-right: 16px;
					padding-bottom: 12px;

					&:nth-child(4n) {
						padding-right: 0;
					}

					img {
						width: 17px;
						height: 19px;
						margin-bottom: 4px;
					}
				}
			}
		}

		.message_send_state {
			@include centerBox();
			margin-left: 24rpx;
			margin-top: 48rpx;
			width: 48rpx;
			height: 48rpx;

			.read_limit_count {
				font-size: 24rpx;
				color: #999;
			}

			image {
				width: 16px;
				height: 16px;
			}
		}

		/deep/.emoji_display {
			width: 24px;
			height: 18px;
			vertical-align: sub;
		}



		&_self {
			flex-direction: row-reverse;

			.check_wrap {
				margin-right: 0;
				margin-left: 24rpx;
			}

			.message_container {
				margin-left: 0;
				margin-right: 24rpx;
				// text-align: end;
				align-items: flex-end;

				.message_content_wrap {
					flex-direction: row-reverse;

					.bg_container {
						background-color: #DCEBFE !important;
					}

					.message_send_state {
						margin-left: 0;
						margin-right: 24rpx;
					}
				}


			}

			.message_send_state {
				margin-left: 0rpx;
				margin-right: 24rpx;
			}
		}
	}

	.notice_message_container {
		@include ellipsisWithLine(2);
		text-align: center;
		margin: 24rpx 48rpx;
		font-size: 24rpx;
		color: #999;
	}


	.fade-leave,
	.fade-enter-to {
		opacity: 1;
	}

	.fade-leave-active,
	.fade-enter-active {
		transition: all 0.5s;
	}

	.fade-leave-to,
	.fade-enter {
		opacity: 0;
	}
</style>
