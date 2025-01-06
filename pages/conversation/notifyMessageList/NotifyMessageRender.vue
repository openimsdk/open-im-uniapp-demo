<template>
  <view :id="`auchor${source.clientMsgID}`" class="message_item">
    <my-avatar
      size="42"
      :desc="source.senderNickname"
      :src="source.senderFaceUrl"
    />
    <view class="message_container">
      <view class="message_sender">
        <text>
          {{ source.senderNickname }} {{ formattedMessageTime }}
        </text>
      </view>
      <view class="message_content_wrap">
        <view class="notify_message_container">
          <!-- <view class="notify_title">
            {{ notifyContent.notificationName }}
          </view> -->
          <view v-if="getMediaSource" class="media_container" @click="preview">
            <u--image
              radius="4"
              :showLoading="true"
              :src="getMediaSource"
              width="220"
              height="100%"
              mode="widthFix"
            ></u--image>
            <image
              v-if="isVideo"
              class="play_icon"
              src="@/static/images/chating_message_video_play.png"
              alt=""
              srcset=""
            />
            <text v-if="isVideo" class="video_duration">{{ getDuration }}</text>
          </view>
          <view class="notify_text">
            {{ notifyContent.text }}
          </view>
          <view v-if="hasExternalUrl" class="href" @click="toWebView">
            点击查看
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { myPreview } from "@/util/preview";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { formatMessageTime, secFormat } from "@/util/imCommon";

const NotificationMixTypes = {
  Text: 0,
  TextAndImage: 1,
  TextAndVideo: 2,
  TextAndFile: 3,
};

export default {
  name: "NotifyMessageRender",
  components: {
    MyAvatar,
  },
  props: {
    source: Object,
  },
  data() {
    return {};
  },
  computed: {
    notifyContent() {
      let notificationContent = {};
      try {
        notificationContent = JSON.parse(this.source.notificationElem.detail);
      } catch (e) {
        //TODO handle the exception
      }
      return notificationContent;
    },
    isVideo() {
      return this.notifyContent.mixType === NotificationMixTypes.TextAndVideo;
    },
    hasExternalUrl() {
      return this.notifyContent.externalUrl;
    },
    getDuration() {
      if (!this.isVideo) {
        return 0;
      }
      return secFormat(this.notifyContent.videoElem.duration);
    },
    formattedMessageTime() {
      return formatMessageTime(this.source.sendTime);
    },
    getMediaSource() {
      if (this.notifyContent.mixType === NotificationMixTypes.TextAndImage) {
        const picEl = this.notifyContent.pictureElem;
        return picEl.snapshotPicture?.url ?? picEl.sourcePicture?.url;
      }
      if (this.notifyContent.mixType === NotificationMixTypes.TextAndVideo) {
        const videoEl = this.notifyContent.videoElem;
        return videoEl.snapshotUrl;
      }
      return "";
    },
  },
  methods: {
    toWebView() {
      uni.navigateTo({
        url: `/pages/common/webviewWrapper/index?url=${this.notifyContent.externalUrl}`,
      });
    },
    preview() {
      if (this.notifyContent.mixType === NotificationMixTypes.TextAndVideo) {
        uni.navigateTo({
          url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.notifyContent.videoElem.videoUrl}&snapshotUrl=${this.notifyContent.videoElem.snapshotUrl}`,
        });
        return;
      }
      if (this.notifyContent.mixType === NotificationMixTypes.TextAndImage) {
        const picEl = this.notifyContent.pictureElem;
        const url = picEl.SourcePicture?.Url ?? picEl.sourcePicture?.url;
        if (url) {
          // uni.previewImage({
          //   urls: [url],
          // });
          myPreview(0, [url]);
        }
      }
    },
  },
};
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
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 6rpx;
    }

    .message_content_wrap {
      @include vCenterBox();
      text-align: start;
      font-size: 14px;
      color: $uni-text-color;
      width: fit-content;
      max-width: 100%;

      .notify_message_container {
        background-color: #fff;
        padding: 16rpx 16rpx;
        border-radius: 12rpx;
      }

      .notify_title {
        font-size: 32rpx;
        margin-bottom: 12rpx;
      }

      .notify_text {
        font-size: 28rpx;
      }

      .media_container {
        position: relative;
        margin-bottom: 10rpx;
        padding-bottom: 24rpx;
        border-bottom: 1px solid #ccc;
      }

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
        bottom: 32rpx;
        right: 18rpx;
        color: #fff;
      }

      .href {
        margin-top: 4rpx;
        color: #0289fa;
      }
    }
  }
}
</style>
