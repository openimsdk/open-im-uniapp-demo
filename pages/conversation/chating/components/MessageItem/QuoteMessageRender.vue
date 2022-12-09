<template>
	<view class="message_quote_wrap">
		<view v-if="!isReplyImage && !isReplyVideo" class="message_quote_text">
			<u-parse :content="getReplyContent" />
		</view>
		<view v-else class="message_quote_media">
			<u--image :showLoading="true" width="96" height="auto" mode="widthFix" radius='6' @click="clickMediaItem"
				:src="getReplyContent"></u--image>
			<img v-if="isReplyVideo" class="play_icon" src="/static/images/chating_message_video_play.png" alt=""
				srcset="">
		</view>
	</view>
</template>

<script>
	import UParse from '@/components/gaoyia-parse/parse.vue'
	import {
		MessageType,
		PageEvents
	} from "@/constant"
	import {
		parseEmoji,
		parseMessageByType
	} from "@/util/imCommon"
	export default {
		name: "",
		components: {
			UParse
		},
		props: {
			message: Object
		},
		data() {
			return {

			};
		},
		computed: {
			isAtMessage() {
				return this.message.contentType === MessageType.ATTEXTMESSAGE
			},
			getQuoteMessage() {
				return this.isAtMessage ?
					JSON.parse(this.message.atElem.quoteMessage) :
					this.message.quoteElem.quoteMessage
			},
			isReplyImage() {
				return this.getQuoteMessage.contentType === MessageType.PICTUREMESSAGE
			},
			isReplyVideo() {
				return this.getQuoteMessage.contentType === MessageType.VIDEOMESSAGE
			},
			getReplyContent() {
				if (this.isReplyVideo) {
					return this.getQuoteMessage.videoElem.snapshotUrl;
				}
				if (this.isReplyImage) {
					return this.getQuoteMessage.pictureElem.sourcePicture.url;
				}
				
				const content = parseEmoji(parseMessageByType(
					this.getQuoteMessage,
				))
				return `${this.getQuoteMessage.senderNickname}: ${content}`;
			},
			getMessageContent() {
				let msgStr = this.message.quoteElem.text;
				if (this.isAtMessage) {
					msgStr = this.message.atElem.text;
				}
				return parseEmoji(msgStr)
			}
		},
		methods: {
			clickMediaItem() {
				if (this.isReplyVideo) {
					uni.$emit(PageEvents.PreviewVideo, this.message.videoElem.videoUrl)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message_quote_wrap {
		display: flex;
		justify-content: flex-end;
		margin-top: 16rpx;

		.message_quote_text {
			width: fit-content;
			padding: 6rpx 16rpx;
			border-radius: 6rpx;
			color: #666;
			font-size: 24rpx;
			background-color: #f0f0f0;
			
			/deep/ uni-view {
				@include ellipsisWithLine(3);
			}
		}

		.message_quote_media {
			position: relative;

			.play_icon {
				width: 24px;
				height: 24px;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
		}
	}
</style>
