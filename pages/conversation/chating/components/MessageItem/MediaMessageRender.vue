<template>
	<view @click="clickMediaItem" class="media_message_container">
		<!-- <view :style="{height:wrapperHeight}" class="media_message_container"> -->
		<u--image @load="onLoaded" :showLoading="true" :width="loadingWidth" height="240" mode="heightFix"
			:src="getImgUrl">
			<template v-slot:loading>
				<u-loading-icon color="red"></u-loading-icon>
			</template>
		</u--image>
		<image v-if="isVideo" class="play_icon" src="@/static/images/chating_message_video_play.png" alt="" srcset="">
		<text v-if="isVideo" class="video_duration">{{getDuration}}</text>
	</view>
</template>

<script>
	import {
		MessageType,
	} from "@/constant"
	import {
		secFormat
	} from "@/util/imCommon"
	export default {
		name: "",
		props: {
			message: Object
		},
		data() {
			return {
				loadingWidth: '200px'
			};
		},
		computed: {
			isVideo() {
				return this.message.contentType === MessageType.VIDEOMESSAGE
			},
			getImgUrl() {
				if (this.isVideo) {
					return this.message.videoElem.snapshotUrl;
				}
				return this.message.pictureElem.sourcePicture.url;
			},
			getDuration() {
				if (!this.isVideo) {
					return 0
				}
				return secFormat(this.message.videoElem.duration)
			}
		},
		methods: {
			clickMediaItem() {
				if (this.isVideo) {
					uni.navigateTo({
						url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.message.videoElem.videoUrl}`
					})
				} else {
					uni.previewImage({
						urls: [this.getImgUrl],
						fail(err) {
							console.log(err);
						}
					})
				}
			},
			onLoaded() {
				this.loadingWidth = 'auto'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.media_message_container {
		position: relative;
		border-radius: 16rpx;
		overflow: hidden;

		.play_icon {
			width: 48px;
			height: 48px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.video_duration {
			position: absolute;
			bottom: 12rpx;
			right: 24rpx;
			color: #fff;
		}
	}
</style>
