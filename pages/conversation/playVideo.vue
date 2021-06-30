<template>
	<view class="video-box">
		<video class="video" :src="videoSrc" controls>
		</video>
		<image @click="back" class="tool-icon" src="../../static/back_video.png" mode=""></image>
		<image @click="downLoad" class="tool-icon tool-icon-down" src="../../static/down_video.png" mode=""></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				videoSrc:""
			}
		},
		methods: {
			back() {
				uni.navigateBack()
			},
			downLoad() {
				uni.showLoading({
					title:"loading..."
				})
				uni.downloadFile({
					url: this.videoSrc,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: function() {
									uni.hideLoading()
									uni.showToast({
										title: "save success",
										icon: "none"
									});
								},
								fail: function() {
									uni.hideLoading()
									uni.showToast({
										title: "failed and try agin",
										icon: "none"
									});
								}
							});
						}
					}
				});
			}
		},
		onLoad: function(option) {
			this.videoSrc = option.url
		}
	}
</script>

<style lang="scss">
	.video-box {
		height: 100vh;
		display: flex;
		background-color: #000;
		justify-content: center;
		align-items: center;

		.video {
			width: 100vw;
			height: 90vh;
		}

		.tool-icon {
			width: 44rpx;
			height: 44rpx;
			position: absolute;
			bottom: 12rpx;
			left: 5vw;

			&-down {
				right: 5vw;
				left: auto;
			}
		}
	}
</style>
