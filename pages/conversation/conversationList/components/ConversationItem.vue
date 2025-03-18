<template>
  <view @tap.prevent="clickConversationItem" class="conversation_item">
    <view class="pinned" v-if="source.isPinned"></view>
    <view class="left_info">
      <my-avatar
        :isGroup="isGroup"
        :isNotify="isNotify"
        :src="source.faceURL"
        :desc="source.showName"
        size="46"
      />
      <view class="details">
        <text class="conversation_name">{{ source.showName }}</text>
        <view class="lastest_msg_wrap">
          <text class="lastest_msg_content">{{ latestMessage }}</text>
        </view>
      </view>
    </view>
    <view class="right_desc">
      <text class="send_time">{{ latestMessageTime }}</text>
      <u-badge max="99" :value="source.unreadCount"></u-badge>
    </view>
  </view>
</template>

<script>
import {
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import UParse from "@/components/gaoyia-parse/parse.vue";
import {
  getConversationContent,
  formatConversionTime,
  prepareConversationState,
} from "@/util/imCommon";

export default {
  components: {
    MyAvatar,
    UParse,
  },
  props: {
    source: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    latestMessage() {
      if (this.source.latestMsg === "") return "";
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(this.source.latestMsg);
      } catch (e) {}
      if (!parsedMessage) return "";
      return getConversationContent(parsedMessage);
    },
    latestMessageTime() {
      return this.source.latestMsgSendTime
        ? formatConversionTime(this.source.latestMsgSendTime)
        : "";
    },
    isGroup() {
      return this.source.conversationType === SessionType.WorkingGroup;
    },
    isNotify() {
      return this.source.conversationType === SessionType.Notification;
    },
  },
  data() {
    return {};
  },
  methods: {
    clickConversationItem() {
      console.log(this.source);
      prepareConversationState(this.source);
    },
  },
};
</script>

<style lang="scss" scoped>
.conversation_item {
  @include btwBox();
  flex-direction: row;
  padding: 12rpx 44rpx 20rpx;
  position: relative;

  &_active {
    background-color: #f3f3f3;
  }

  .left_info {
    @include btwBox();

    .details {
      @include colBox(true);
      margin-left: 24rpx;
      height: 46px;
      color: $uni-text-color;

      .conversation_name {
        @include nomalEllipsis();
        max-width: 40vw;
        font-size: 28rpx;
      }

      .lastest_msg_wrap {
        display: flex;
        font-size: 24rpx;
        margin-top: 10rpx;
        color: #666;

        .lastest_msg_prefix {
          margin-right: 6rpx;

          &_active {
            color: $u-primary;
          }
        }

        .lastest_msg_content {
          flex: 1;
          margin-right: 160rpx;
          // /deep/uni-view {
          @include ellipsisWithLine(1);
          // }
        }
      }
    }
  }

  .right_desc {
    @include colBox(true);
    align-items: flex-end;
    width: max-content;
    justify-content: space-between;
    height: 46px;

    .send_time {
      width: max-content;
      font-size: 24rpx;
      color: #999;
    }

    .u-badge {
      width: fit-content;
    }
  }

  .pinned {
    position: absolute;
    top: 0;
    right: 24rpx;
    width: 17rpx;
    height: 17rpx;
    background-image: linear-gradient(to bottom left, #314ffe 50%, white 50%);
  }
}
</style>
