<template>
  <view class="media_message_container" @click="clickMediaItem">
    <u--image
      @load="onLoaded"
      :showLoading="true"
      width="120"
      height="100%"
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
      let imageHeight = "";
      if (this.isVideo) {
        imageHeight = this.message.videoElem.snapshotHeight
      }
      if (!this.isVideo && this.message.pictureElem.sourcePicture) {
        imageHeight = this.message.pictureElem.sourcePicture.height
      }
      if (!this.isVideo && this.message.pictureElem.snapshotPicture) {
        imageHeight = this.message.pictureElem.snapshotPicture.height
      }
      return (imageHeight || 0) > 120 ? 120 : imageHeight;
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
        uni.previewImage({
          current: idx,
          urls: list,
          longPressActions :{
            itemList: ['保存图片'],
            success(data) {
              uni.downloadFile({
                url: list[data.index],
                success(res){
                  let url = res.tempFilePath
                  uni.saveImageToPhotosAlbum({
                    filePath: url,
                    success() {
                      uni.showToast({
                        title:'已保存到系统相册',
                        icon:"none"
                      })
                    },
                    fail(err) {
                      uni.showToast({
                        title:'保存失败',
                        icon:"none"
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
