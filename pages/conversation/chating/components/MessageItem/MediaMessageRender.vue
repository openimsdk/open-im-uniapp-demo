<template>
  <view class="media_message_container" @click="clickMediaItem">
    <u--image
      @load="onLoaded"
      :showLoading="true"
      width="120"
      :height="maxHeight"
      mode="widthFix"
      :src="getImgUrl"
      @click="clickMediaItem"
    >
      <template v-slot:loading>
        <u-loading-icon color="red"></u-loading-icon>
      </template>
    </u--image>
  </view>
</template>

<script>
export default {
  name: "",
  props: {
    message: Object,
  },
  data() {
    return {
      loadingWidth: "120px",
    };
  },
  computed: {
    getImgUrl() {
      return (
        this.message.pictureElem.snapshotPicture?.url ??
        this.message.pictureElem.sourcePath
      );
    },
    maxHeight() {
      const imageHeight = this.message.pictureElem.sourcePicture.height;
      const imageWidth = this.message.pictureElem.sourcePicture.width;
      const aspectRatio = imageHeight / imageWidth;
      return 120 * aspectRatio;
    },
  },
  methods: {
    clickMediaItem() {
      uni.previewImage({
        current: 0,
        urls: [this.message.pictureElem.sourcePicture.url],
        indicator: "none",
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
