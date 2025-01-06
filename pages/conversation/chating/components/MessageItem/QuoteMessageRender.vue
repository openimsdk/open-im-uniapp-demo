<template>
  <view class="message_quote_wrap">
    <view class="message_quote_text">
      <u-parse :content="getSenderNickname" />
      <view style="margin-left: 6rpx" class="message_quote_media">
        <image
          v-if="isReplyFile"
          src="@/static/images/chating_message_file.png"
          alt="file"
        />
        <image
          v-if="isReplyImage"
          :src="getQuoteMessage.pictureElem.sourcePicture.url"
          alt="img"
          @click="clickImageItem"
        />
        <my-avatar
          v-if="isReplyCard"
          :src="getQuoteMessage.cardElem.faceURL"
          :desc="getQuoteMessage.cardElem.nickname"
          size="26"
        />
        <image
          v-if="isReplyVideo"
          :src="getQuoteMessage.videoElem.snapshotUrl"
          alt="video"
        />
        <image
          v-if="isReplyVideo"
          class="play_icon"
          src="@/static/images/chating_message_video_play.png"
          alt=""
          srcset=""
          @click.stop="clickMediaItem"
        />
      </view>
    </view>
    <!-- <view class="message_quote_media"> -->
    <!-- <u--image :showLoading="true" width="96" height="auto" mode="widthFix" radius='6' @click="clickMediaItem"
				:src="getReplyContent"></u--image> -->
    <!-- <img v-if="isReplyFile" src="/static/images/chating_message_file.png" width="26" alt="file"> -->
    <!-- <img v-if="isReplyVideo" class="play_icon" src="/static/images/chating_message_video_play.png" alt="" srcset=""
				@click.stop="clickMediaItem" /> -->
    <!-- </view> -->
  </view>
</template>

<script>
import UParse from "@/components/gaoyia-parse/parse.vue";
import { parseMessageByType } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { myPreview } from "@/util/preview";
const extraTypes = [
  MessageType.FileMessage,
  MessageType.LocationMessage,
  MessageType.PictureMessage,
  MessageType.VideoMessage,
  MessageType.CardMessage,
];
export default {
  name: "",
  components: {
    UParse,
    MyAvatar,
  },
  props: {
    message: Object,
  },
  data() {
    return {};
  },
  computed: {
    hasExtra() {
      return extraTypes.includes(this.message.quoteMessage.contentType);
    },
    isAtMessage() {
      return this.message.contentType === MessageType.AtTextMessage;
    },
    getQuoteMessage() {
      return this.isAtMessage
        ? this.message.atTextElem.quoteMessage
        : this.message.quoteElem.quoteMessage;
    },
    isReplyImage() {
      return this.getQuoteMessage.contentType === MessageType.PictureMessage;
    },
    isReplyVideo() {
      return this.getQuoteMessage.contentType === MessageType.VideoMessage;
    },
    isReplyFile() {
      return this.getQuoteMessage.contentType === MessageType.FileMessage;
    },
    isReplyCard() {
      return this.getQuoteMessage.contentType === MessageType.CardMessage;
    },
    isLocationMessage() {
      return this.getQuoteMessage.contentType === MessageType.LocationMessage;
    },
    isRevokedMessage() {
      return this.getQuoteMessage.contentType === MessageType.RevokeMessage;
    },
    getMessageContent() {
      if (this.isReplyImage || this.isReplyVideo) {
        return "";
      }
      if (this.isRevokedMessage) {
        return "引用内容已被撤回";
      }
      return parseMessageByType(this.getQuoteMessage);
    },
    getSenderNickname() {
      return `${this.getQuoteMessage.senderNickname}: ${this.getMessageContent}`;
    },
  },
  methods: {
    clickImageItem() {
      myPreview(0, [this.getQuoteMessage.pictureElem.sourcePicture.url])
    },
    clickMediaItem() {
      if (this.isReplyVideo) {
        uni.navigateTo({
          url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.getQuoteMessage.videoElem.videoUrl}&snapshotUrl=${this.getQuoteMessage.videoElem.snapshotUrl}`,
        });
        // uni.$emit(PageEvents.PreviewVideo, this.getQuoteMessage.videoElem.videoUrl)
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.message_quote_wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 8rpx;

  .message_quote_text {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: fit-content;
    padding: 16rpx 16rpx;
    border-radius: 6rpx;
    color: #666;
    font-size: 24rpx;
    background-color: #f0f0f0;

    /deep/ uni-view {
      @include ellipsisWithLine(3);
    }
  }

  .message_quote_media {
    position: relative;

    image {
      width: 26px;
      height: 26px;
    }

    .play_icon {
      width: 13px !important;
      height: 13px !important;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
