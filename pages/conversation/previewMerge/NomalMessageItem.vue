<template>
  <view @click="click" class="merge_item">
    <my-avatar :src="source.faceURL" :desc="source.senderNickname" size="42" />
    <view class="merge_details">
      <view class="top_desc">
        <text class="send_name">{{ source.senderNickname }}</text>
        <text class="send_timer">{{ getSendTime }}</text>
      </view>
      <view class="message_row">
        <view v-if="isMedia">
          <MediaMessageRender :message="source" />
        </view>
        <text v-else class="message_content">{{ getContent }}</text>
        <view v-if="isQuoto">
          <QuoteMessageRender :message="source" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import MyAvatar from "@/components/MyAvatar/index.vue";
import { MessageType } from "openim-uniapp-polyfill";
import MediaMessageRender from "../chating/components/MessageItem/MediaMessageRender.vue"
import QuoteMessageRender from '../chating/components/MessageItem/QuoteMessageRender.vue'
import {
  formatConversionTime,
  parseMessageByType,
} from "@/util/imCommon";
export default {
  name: "",
  components: {
    MyAvatar,
    MediaMessageRender,
    QuoteMessageRender
  },
  props: {
    source: Object,
  },
  data() {
    return {};
  },
  computed: {
    getSendTime() {
      return formatConversionTime(this.source.sendTime);
    },
    getContent() {
      return parseMessageByType(this.source);
    },
    isMedia() {
      return this.source.contentType === MessageType.PictureMessage || this.source.contentType === MessageType.VideoMessage
    },
    isQuoto() {
      return this.source.contentType === MessageType.QuoteMessage
    }
  },
  methods: {
    click() {
      this.$emit("click", this.source);
    },
  },
};
</script>

<style lang="scss">
.merge_item {
  display: flex;
  flex-direction: row;
  padding: 24rpx 44rpx;

  .merge_details {
    @include colBox(false);
    flex: 1;
    margin-left: 24rpx;
    border-bottom: 1px solid #dfdfdf;
    padding-bottom: 24rpx;

    .top_desc {
      display: flex;
      justify-content: space-between;
      font-size: 28rpx;

      .send_name {
        @include nomalEllipsis();
        max-width: 240rpx;
        margin-bottom: 6rpx;
        color: $uni-text-color;
      }

      .send_timer {
        color: #999;
      }
    }

    .message_row {
      @include colBox(false);
      flex-grow: 0;
      width: fit-content;

      .message_content {
        font-size: 28rpx;
        color: #666;
      }

      .quote_content {
        width: fit-content;
        padding: 6rpx 12rpx;
        border-radius: 4rpx;
        background-color: #f0f0f0;
        margin-top: 12rpx;
      }
    }
  }
}
</style>
