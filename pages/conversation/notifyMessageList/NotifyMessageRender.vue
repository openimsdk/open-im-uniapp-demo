<template>
	<view :id="`auchor${source.clientMsgID}`" class="message_item">
		<my-avatar size='42' :desc="notifyContent.notificationName" :src="notifyContent.notificationFaceURL" />
		<view class="message_container">
			<view class="message_sender">
				<text>{{notifyContent.notificationName}}</text>
			</view>
			<view class="message_content_wrap">
				<view class="notify_message_container">
					<view class="notify_title">
						{{notifyContent.notificationName}}
					</view>
					<view @click="checkUrl" class="notify_text">
						{{notifyContent.text}}
					</view>
					<view v-if="getMediaSource" class="media_container">
						<u--image @click="preview" radius="4" :showLoading="true" :src="getMediaSource" width="72"
							height="72"></u--image>
					</view>
				</view>
			</view>
		</view>

	</view>


</template>

<script>
	import MyAvatar from '@/components/MyAvatar/index.vue'


	const NotificationMixTypes = {
		Text: 0,
		TextAndImage: 1,
		TextAndVideo: 2,
		TextAndFile: 3
	}

	export default {
		name: 'NotifyMessageRender',
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
		computed: {
			notifyContent() {
				let notificationContent = {}
				try {
					notificationContent = JSON.parse(this.source.notificationElem.detail)
				} catch (e) {
					//TODO handle the exception
				}
				return notificationContent
			},
			getMediaSource() {
				if (this.notifyContent.mixType === NotificationMixTypes.TextAndImage) {
					const picEl = this.notifyContent.pictureElem;
					const url = picEl.SourcePicture?.Url ?? picEl.sourcePicture?.url;
					return url ?? ''
				}
				if (this.notifyContent.mixType === NotificationMixTypes.TextAndVideo) {
					const videoEl = this.notifyContent.videoElem;
					const url = videoEl.SnapshotURL ?? videoEl.snapshotURL;
					return url ?? ''
				}
				return ''
			}
		},
		methods: {
			checkUrl() {
				if (this.notifyContent.url) {
					uni.navigateTo({
						url: `/pages/common/webviewWrapper/index?url=${this.notifyContent.url}`
					})
				}
			},
			preview() {
				if (this.notifyContent.mixType === NotificationMixTypes.TextAndImage) {
					const picEl = this.notifyContent.pictureElem;
					const url = picEl.SourcePicture?.Url ?? picEl.sourcePicture?.url;
					if (url) {
						uni.previewImage({
							urls: [url]
						})
					}

				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message_item {
		display: flex;
		flex-direction: row;
		margin: 0 44rpx;
		padding-bottom: 32rpx;

		.message_container {
			margin-left: 24rpx;
			text-align: start;
			max-width: 80%;
			position: relative;

			.message_sender {
				@include nomalEllipsis();
				max-width: 480rpx;
				font-size: 28rpx;
				color: #333;
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

				.notify_message_container {
					background-color: #fff;
					padding: 16rpx 32rpx;
					border-radius: 12rpx;
				}

				.notify_title {
					font-size: 32rpx;
					margin-bottom: 12rpx;
				}

				.notify_text {
					font-size: 24rpx;
					color: #999;
				}

				.media_container {
					margin-top: 20rpx;
				}
			}
		}

	}
</style>
