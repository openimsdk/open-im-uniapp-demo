<template>
  <view class="media_message_container" @click="clickMediaItem">
    <u--image @load="onLoaded" :showLoading="true" :width="loadingWidth" :height="maxHeight" mode="heightFix"
      :src="getImgUrl" @click="clickMediaItem">
      <template v-slot:loading>
        <u-loading-icon color="red"></u-loading-icon>
      </template>
    </u--image>
  </view>
</template>

<script>
export default {
  name: "FaceMessageRender",
  props: {
    message: Object,
  },
  data() {
    return {
      loadingWidth: "200px",
      faceElem: {}
    };
  },
  mounted() {
    console.log(this.message)
    this.faceElem = JSON.parse(this.message.faceElem.data)
  },
  computed: {
    getImgUrl() {
      return this.faceElem.url;
    },
    maxHeight() {
      const imageHeight = this.faceElem.height;
      return (imageHeight || 0) > 240 ? 240 : imageHeight;
    },
  },
  methods: {
    clickMediaItem() {
      const list = [this.faceElem.url];
      const idx = 0;
      uni.previewImage({
        current: 0,
        urls: [this.faceElem.url],
        longPressActions: {
          itemList: ['保存图片'],
          success(data) {
            uni.downloadFile({
              url: list[idx],
              success(res) {
                console.log(res)
                let url = res.tempFilePath
                uni.saveImageToPhotosAlbum({
                  filePath: url,
                  success() {
                    uni.showToast({
                      title: '已保存到系统相册',
                      icon: "none"
                    })
                  },
                  fail(err) {
                    uni.showToast({
                      title: '保存失败',
                      icon: "none"
                    })
                  }
                })
              }
            })
          }
        },
        fail(err) {
          console.log(err);
        },
      });
    },
    onLoaded() {
      this.loadingWidth = "auto";
    },
  },
};
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
