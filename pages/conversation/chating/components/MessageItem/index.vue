<template>
  <view
    v-if="!getNoticeContent"
    :id="`auchor${source.clientMsgID}`"
    class="message_item"
    :class="{ message_item_self: isSender, message_item_active: isActive }"
  >
    <my-avatar
      size="42"
      :desc="source.senderNickname"
      :src="source.senderFaceUrl"
    />
    <view class="message_container">
      <view
        class="message_sender"
        :style="{ 'flex-direction': !isSender ? 'row-reverse' : 'row' }"
      >
        <text>{{ formattedMessageTime }}</text>
        <text style="margin-left: 2rpx; margin-right: 2rpx">{{ "" }}</text>
        <text v-if="!isSingle">{{ source.senderNickname }}</text>
      </view>
      <view class="message_send_state_box">
        <view
          style="
            height: 100%;
            display: flex;
            justify-items: center;
            align-items: center;
          "
        >
          <view class="message_send_state">
            <u-loading-icon v-if="showSending && !isPreview" />
            <image
              v-if="isFailedMessage && !isPreview"
              src="@/static/images/chating_message_failed.png"
            />
          </view>
        </view>
        <view class="message_content_wrap message_content_wrap_shadow">
          <text-message-render
            v-if="showTextRender"
            :message="source"
          />
          <media-message-render v-else-if="showMediaRender" :message="source" />
          <error-message-render v-else />
        </view>
      </view>
    </view>
  </view>

  <view
    v-else
    class="notice_message_container"
    :id="`auchor${source.clientMsgID}`"
  >
    <text>{{ getNoticeContent }}</text>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import {
  MessageStatus,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import TextMessageRender from "./TextMessageRender.vue";
import MediaMessageRender from "./MediaMessageRender.vue";
import ErrorMessageRender from "./ErrorMessageRender.vue";
import { noticeMessageTypes } from "@/constant";
import { tipMessaggeFormat, formatMessageTime } from "@/util/imCommon";

const textRenderTypes = [MessageType.TextMessage];

const mediaRenderTypes = [MessageType.PictureMessage];

export default {
  components: {
    MyAvatar,
    TextMessageRender,
    MediaMessageRender,
    ErrorMessageRender,
  },
  props: {
    source: Object,
    isSender: {
      type: Boolean,
      default: false,
    },
    isPreview: Boolean,
    isActive: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeSelfInfo",
    ]),
    isSingle() {
      return (
        this.storeCurrentConversation.conversationType === SessionType.Single
      );
    },
    formattedMessageTime() {
      return formatMessageTime(this.source.sendTime);
    },
    showTextRender() {
      return textRenderTypes.includes(this.source.contentType);
    },
    showMediaRender() {
      return mediaRenderTypes.includes(this.source.contentType);
    },
    getNoticeContent() {
      const isNoticeMessage = noticeMessageTypes.includes(
        this.source.contentType
      );
      return !isNoticeMessage
        ? ""
        : tipMessaggeFormat(
            this.source,
            this.$store.getters.storeCurrentUserID
          );
    },
    isSuccessMessage() {
      return this.source.status === MessageStatus.Succeed;
    },
    isFailedMessage() {
      return this.source.status === MessageStatus.Failed;
    },
    showSending() {
      return this.source.status === MessageStatus.Sending && !this.sendingDelay;
    },
  },
  mounted() {
    this.$emit("messageItemRender", this.source.clientMsgID);
    this.setSendingDelay();
  },
  methods: {
    setSendingDelay() {
      if (this.source.status === MessageStatus.Sending) {
        setTimeout(() => {
          this.sendingDelay = false;
        }, 2000);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.message_item {
  display: flex;
  flex-direction: row;
  padding: 16rpx 44rpx;
  // padding-top: 48rpx;
  position: relative;

  .check_wrap {
    @include centerBox();
    box-sizing: border-box;
    width: 40rpx;
    min-width: 40rpx;
    height: 40rpx;
    min-height: 40rpx;
    border: 2px solid #979797;
    border-radius: 50%;
    margin-top: 16rpx;
    margin-right: 24rpx;

    &_active {
      background-color: #1d6bed;
      border: none;
    }

    &_disabled {
      background-color: #c8c9cc;
    }
  }

  .message_container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 20rpx;
    // text-align: start;
    max-width: 80%;
    position: relative;

    .message_sender {
      @include nomalEllipsis();
      display: flex;
      max-width: 480rpx;
      // font-size: 24rpx;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 6rpx;
    }

    .message_content_wrap {
      @include vCenterBox();
      text-align: start;
      // font-size: 14px;
      color: $uni-text-color;
      width: fit-content;
      max-width: 100%;

      .bg_container {
        padding: 16rpx 24rpx;
        border-radius: 0rpx 12rpx 12rpx 12rpx;
        background-color: #f0f0f0;
      }
    }
  }

  .message_send_state_box {
    display: flex;
    flex-direction: row-reverse;
  }

  .message_send_state {
    @include centerBox();
    margin-left: 12rpx;
    // margin-top: 48rpx;
    width: 48rpx;
    height: 48rpx;

    .read_limit_count {
      // font-size: 24rpx;
      font-size: 0.85rem;
      color: #999;
    }

    image {
      width: 16px;
      height: 16px;
    }
  }

  /deep/.emoji_display {
    width: 24px;
    height: 18px;
    vertical-align: sub;
  }

  &_self {
    flex-direction: row-reverse;

    .check_wrap {
      margin-right: 0;
      margin-left: 24rpx;
    }

    .message_container {
      margin-left: 0;
      margin-right: 20rpx;
      // text-align: end;
      align-items: flex-end;

      .message_content_wrap {
        flex-direction: row-reverse;

        .bg_container {
          border-radius: 12rpx 0 12rpx 12rpx;
          background-color: #dcebfe !important;
        }
      }
    }

    .message_send_state_box {
      flex-direction: row;
    }

    .message_send_state {
      margin-left: 0rpx;
      margin-right: 12rpx;
    }
  }

  &_active {
    background-color: #fdf5e9;
  }
}

.notice_message_container {
  @include ellipsisWithLine(2);
  text-align: center;
  margin: 24rpx 48rpx;
  // font-size: 24rpx;
  font-size: 0.85rem;
  color: #999;
  position: relative;
}

.fade-leave,
.fade-enter-to {
  opacity: 1;
}

.fade-leave-active,
.fade-enter-active {
  transition: all 0.5s;
}

.fade-leave-to,
.fade-enter {
  opacity: 0;
}
</style>
