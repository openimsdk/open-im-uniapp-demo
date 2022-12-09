<template>
	<view class="preview_video_container">
		<video autoplay class="video_player" :src="previewVideoUrl"></video>
		<view class="play_action_bar">
			<u-icon @click="back" size="24" color="#fff" name="close-circle"></u-icon>
			<u-icon @click="download" size="24" color="#fff" name="download"></u-icon>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	export default {
		name: "",
		components: {},
		data() {
			return {
				downloading: false,
				previewVideoUrl: "",
			};
		},
		onLoad(options) {
			this.previewVideoUrl = options.previewVideoUrl
		},
		methods: {
			back() {
				uni.navigateBack()
			},
			download() {
				if (this.downloading) return;
				this.showToast('下载中', true)
				this.downloading = true
				uni.downloadFile({
					url: this.previewVideoUrl,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveVideoToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									this.showToast('下载成功,已保存到相册')
								},
								fail: () => {
									this.showToast("保存失败");
								}
							})
						} else {
							this.showToast("下载失败");
						}
					},
					fail: () => {
						this.showToast("下载失败");
					}
				});
			},
			showToast(message, isLoading = false) {
				if (this.$refs.uToast.isShow) {
					this.$refs.uToast.hide();
				}

				this.$refs.uToast.show({
					message,
					position: 'bottom',
					loading: isLoading,
					type: isLoading ? 'loading' : 'default',
					duration: isLoading ? 6000 : 2000
				})
			}
		}
	}
</script>

<style lang="scss">
	.preview_video_container {
		@include colBox(false);
		height: 100vh;
		background-color: #000;

		.video_player {
			flex: 1;
			// height: 80%;
			width: 100%;
			// margin-top: 50%;
		}

		.play_action_bar {
			padding: 24rpx 48rpx 48rpx;
			// margin-top: 24rpx;
			display: flex;
			justify-content: space-between;
		}
	}
</style>
