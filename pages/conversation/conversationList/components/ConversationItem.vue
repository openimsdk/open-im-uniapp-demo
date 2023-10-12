<template>
  <u-swipe-action-item
    :index="source.conversationID"
    @click="clickConversationMenu($event, source)"
    :name="source.conversationID"
    :options="getSwipeActions || []"
    @touchmove.stop
  >
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
            <text
              v-if="messagePrefix"
              class="lastest_msg_prefix"
              :class="{ lastest_msg_prefix_active: needActivePerfix }"
              >{{ messagePrefix }}</text
            >
            <text class="lastest_msg_content">{{ latestMessage }}</text>
          </view>
        </view>
      </view>
      <view class="right_desc">
        <text class="send_time">{{ latestMessageTime }}</text>
        <image
          style="width: 16px; height: 16px"
          v-if="notAccept"
          src="@/static/images/conversation_not_accept.png"
        />
        <u-badge v-else max="99" :value="source.unreadCount"></u-badge>
      </view>
    </view>
  </u-swipe-action-item>
</template>

<script>
import IMSDK, {
  GroupAtType,
  MessageReceiveOptType,
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import UParse from "@/components/gaoyia-parse/parse.vue";
import {
  parseMessageByType,
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
    messagePrefix() {
      if (this.source.draftText !== "") {
        let text = this.source.draftText;
        return "[草稿]";
      }
      let prefix = "";

      if (
        this.source?.recvMsgOpt !== MessageReceiveOptType.Nomal &&
        this.source.unreadCount > 0
      ) {
        prefix = `[${this.source.unreadCount}条] `;
      }

      if (this.source.groupAtType !== GroupAtType.AtNormal) {
        switch (this.source.groupAtType) {
          case GroupAtType.AtAll:
            prefix = "[所有人]";
            break;
          case GroupAtType.AtMe:
            prefix = "[有人@你]";
            break;
          case GroupAtType.AtAllAtMe:
            prefix = "[有人@你]";
            break;
          case GroupAtType.AtGroupNotice:
            prefix = "[群公告]";
            break;
        }
      }

      return prefix;
    },
    latestMessage() {
      if (this.source.latestMsg === "") return "";
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(this.source.latestMsg);
      } catch (e) {}
      if (!parsedMessage) return "";
      return parseMessageByType(parsedMessage);
    },
    needActivePerfix() {
      return this.source.groupAtType !== GroupAtType.AtNormal;
    },
    latestMessageTime() {
      return this.source.latestMsgSendTime
        ? formatConversionTime(this.source.latestMsgSendTime)
        : "";
    },
    notAccept() {
      return this.source.recvMsgOpt !== MessageReceiveOptType.Nomal;
    },
    isGroup() {
      return this.source.conversationType === SessionType.WorkingGroup;
    },
    isNotify() {
      return this.source.conversationType === SessionType.Notification;
    },
    getSwipeActions() {
      let actions = [
        {
          text: `${this.source.isPinned ? "取消" : ""}置顶`,
          style: {
            backgroundColor: "#3c9cff",
          },
        },
        {
          text: "移除",
          style: {
            backgroundColor: "#FF381F",
          },
        },
      ];
      if (this.source.unreadCount > 0) {
        actions = [
          {
            text: "标为已读",
            style: {
              backgroundColor: "#8E9AB0",
            },
          },
          ...actions,
        ];
      }
      return actions;
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
    clickConversationMenu({ name, index }, item) {
      console.log("clickConversationMenu");
      const noUnRead = this.getSwipeActions.length === 2;

      if (index === 0 && !noUnRead) {
        IMSDK.asyncApi(
          IMSDK.IMMethods.MarkConversationMessageAsRead,
          IMSDK.uuid(),
          item.conversationID,
        ).catch(() => uni.$u.toast("操作失败"));
      }

      if ((index === 0 && noUnRead) || (index === 1 && !noUnRead)) {
        IMSDK.asyncApi(IMSDK.IMMethods.PinConversation, IMSDK.uuid(), {
          conversationID: item.conversationID,
          isPinned: !item.isPinned,
        }).catch(() => uni.$u.toast("置顶失败"));
      }

      if (index === 2 || (noUnRead && index === 1)) {
        IMSDK.asyncApi(
          IMSDK.IMMethods.DeleteConversationAndDeleteAllMsg,
          IMSDK.uuid(),
          item.conversationID,
        )
          .then(() =>
            this.$store.dispatch(
              "conversation/delConversationByCID",
              item.conversationID,
            ),
          )
          .catch(() => uni.$u.toast("移除失败"));
      }
      this.$emit("closeAllSwipe");
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
