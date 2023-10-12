<template>
  <view class="preview_video_container">
    <video :poster="snapshotUrl" autoplay class="video_player" :src="previewVideoUrl"></video>
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
      snapshotUrl: "",
    };
  },
  onLoad(options) {
    this.previewVideoUrl = options.previewVideoUrl;
    this.snapshotUrl = options.snapshotUrl || ''
  },
  methods: {
    back() {
      uni.navigateBack();
    },
    download() {
      if (this.downloading) return;
      this.showToast("下载中", "loading");
      this.downloading = true;
      uni.downloadFile({
        url: this.previewVideoUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveVideoToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                this.showToast("下载成功,已保存到相册", "none");
              },
              fail: () => {
                this.showToast("保存失败", "error");
              },
            });
          } else {
            this.showToast("下载失败", "error");
          }
        },
        fail: () => {
          this.showToast("下载失败", "error");
        },
      });
    },
    showToast(message, icon) {
      uni.hideToast();

      uni.showToast({
        title: message,
        duration: 1500,
        icon,
      });
    },
  },
};
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
