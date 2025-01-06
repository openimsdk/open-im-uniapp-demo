<template>
  <view class="media_message_container" @click="clickMediaItem">
    <!-- <view :style="{height:wrapperHeight}" class="media_message_container"> -->
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
    <image
      v-if="isVideo"
      class="play_icon"
      src="@/static/images/chating_message_video_play.png"
      alt=""
      srcset=""
    />
    <text v-if="isVideo" class="video_duration">{{ getDuration }}</text>
  </view>
</template>

<script>
import { secFormat } from "@/util/imCommon";
import { myPreview } from "@/util/preview";
import { MessageType } from "openim-uniapp-polyfill";
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
    isVideo() {
      return this.message.contentType === MessageType.VideoMessage;
    },
    getImgUrl() {
      if (this.isVideo) {
        return this.message.videoElem.snapshotUrl;
      }
      return this.message.pictureElem.snapshotPicture?.url ?? this.message.pictureElem.sourcePath;
    },
    getDuration() {
      if (!this.isVideo) {
        return 0;
      }
      return secFormat(this.message.videoElem.duration);
    },
    maxHeight() {
      const imageHeight = this.isVideo
        ? this.message.videoElem.snapshotHeight
        : this.message.pictureElem.sourcePicture.height;
      const imageWidth = this.isVideo
        ? this.message.videoElem.snapshotWidth
        : this.message.pictureElem.sourcePicture.width;
      const aspectRatio = imageHeight / imageWidth;
      return 120 * aspectRatio;
    },
  },
  methods: {
    clickMediaItem() {
      if (this.isVideo) {
        uni.navigateTo({
          url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.message.videoElem.videoUrl}&snapshotUrl=${this.message.videoElem.snapshotUrl}`,
        });
      } else {
        const list = this.$store.getters.storePreviewImageList;
        const idx = list.findIndex((item) => item === this.message.pictureElem.sourcePicture.url);
        myPreview(idx, list)
      }
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
