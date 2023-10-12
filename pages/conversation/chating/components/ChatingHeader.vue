<template>
  <u-navbar @click="click" placeholder class="chating_header">
    <view @click="routeBack" class="u-nav-slot" slot="left">
      <img
        class="back_icon"
        width="12"
        height="20"
        src="static/images/common_left_arrow.png"
        alt=""
        srcset=""
      />
    </view>
    <view class="u-nav-slot" slot="center">
      <view class="chating_info" :class="{ chating_info_single: isSingle }">
        <view class="conversation_info">
          <view class="title">{{ storeCurrentConversation.showName }}</view>
          <view v-if="!isSingle && !isNotify" class="sub_title"
            >{{ groupMemberCount }}
          </view>
          <image
            style="width: 16px; height: 16px"
            v-if="isRecvMsgOpt"
            src="@/static/images/conversation_not_accept.png"
          />
        </view>
        <view v-if="isSingle" class="online_state">
          <view
            v-if="isSingle"
            class="dot"
            :style="{ backgroundColor: isOnline ? '#10CC64' : '#999' }"
          />
          <view class="online_str" v-if="isSingle">{{ onlineStr }}</view>
        </view>
      </view>
    </view>
    <view class="u-nav-slot" slot="right">
      <view class="right_action">
        <u-icon
          @click="goSetting"
          class="action_item"
          name="more-dot-fill"
          size="23"
          color="#0C1C33"
        >
        </u-icon>
      </view>
    </view>
  </u-navbar>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, { SessionType, MessageReceiveOptType } from "openim-uniapp-polyfill";
import { Platform } from '@/constant/im'
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  name: "ChatingHeader",
  components: {
    MyAvatar,
  },
  data() {
    return {
      isOnline: false,
      isTyping: false,
      onlineStr: "离线",
      callingData: null,
      showMoreMember: false,
      joinLock: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeCurrentGroup",
      "storeCurrentMemberInGroup",
      "storeSelfInfo",
    ]),
    isRecvMsgOpt() {
      return this.storeCurrentConversation.recvMsgOpt !== MessageReceiveOptType.Nomal
    },
    isSingle() {
      return (
        this.storeCurrentConversation.conversationType === SessionType.Single
      );
    },
    isNotify() {
      return (
        this.storeCurrentConversation.conversationType ===
        SessionType.Notification
      );
    },
    groupMemberCount() {
      return `(${this.storeCurrentGroup?.memberCount ?? 0})`;
    },
    canGoSetting() {
      if (this.isSingle) {
        return true;
      }
      return (
        this.storeCurrentMemberInGroup.groupID ===
        this.storeCurrentConversation.groupID
      );
    },
  },
  mounted() {
    if (this.isSingle) {
      IMSDK.subscribe(
        IMSDK.IMEvents.OnUserStatusChanged,
        this.userStatusChangeHandler,
      );
      this.getOnlineState();
    }
  },
  beforeDestroy() {
    IMSDK.asyncApi("unsubscribeUsersStatus", IMSDK.uuid(), [
      this.storeCurrentConversation.userID,
    ]);
    IMSDK.unsubscribe(
      IMSDK.IMEvents.OnUserStatusChanged,
      this.userStatusChangeHandler,
    );
  },
  methods: {
    userStatusChangeHandler({ data }) {
      if (data.userID === this.storeCurrentConversation.userID) {
        this.isOnline = !!data.status;
        if(data[0].status){
          const platformStr = data[0].platformIDs.map(id => Platform[id]).join('/');
          this.onlineStr = platformStr + '在线'
        } else {
          this.onlineStr = '离线'
        }
      }
    },
    click(e) {
      this.$emit("click", e);
    },
    routeBack() {
      uni.switchTab({
        url: "/pages/conversation/conversationList/index",
      });
    },
    goSetting() {
      const url = this.isSingle
        ? "/pages/conversation/singleSettings/index"
        : "/pages/conversation/groupSettings/index";
      uni.navigateTo({
        url,
      });
    },
    getOnlineState() {
      IMSDK.asyncApi("subscribeUsersStatus", IMSDK.uuid(), [
        this.storeCurrentConversation.userID,
      ])
        .then(({ data }) => {
          console.log("getOnlineState", data);
          this.isOnline = !!data[0].status;
          if(data[0].status){
            const platformStr = data[0].platformIDs.map(id => Platform[id]).join('/');
            this.onlineStr = platformStr + '在线'
          } else {
            this.onlineStr = '离线'
          }
        })
        .catch((err) => {
          console.log("getOnlineStateErr", err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.chating_header {
  border: 2rpx solid #e8eaef;
  /deep/ .u-navbar__content__left {
    padding: 0;
  }

  .back_icon {
    padding: 24rpx;
    margin-left: 20rpx;
  }

  .chating_info {
    @include vCenterBox();
    flex-direction: column;

    &_single {
      margin-bottom: 24rpx;
    }

    .conversation_info {
      flex-direction: row;
      justify-content: center;
      @include vCenterBox();

      .title {
        @include nomalEllipsis();
        max-width: 280rpx;
        font-size: 14px;
        font-weight: 500;
      }

      .sub_title {
        margin-left: 8rpx;
      }
    }

    .online_state {
      @include vCenterBox();
      flex-direction: row;
      margin-top: 6rpx;
      // position: absolute;
      // top: 2px;
      // left: 50%;
      // transform: translateX(-50%);
      font-size: 20rpx;
      color: #999;

      .dot {
        background-color: #10cc64;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }

      .online_str {
        @include nomalEllipsis();
        max-width: 280rpx;
      }
    }
  }

  /deep/ .u-navbar__content__right {
    padding: 0;
  }

  .right_action {
    @include vCenterBox();
    flex-direction: row;
    margin-right: 24rpx;

    .action_item {
      padding: 12rpx;
    }

    .u-icon {
      margin-left: 12rpx;
    }
  }
}

.group_announcement_tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 80%;
  position: absolute;
  left: 6%;
  // bottom: -44px;
  margin-top: 40rpx;
  padding: 14rpx 32rpx;
  background-color: #f0f6ff;
  border-radius: 12rpx;

  .announcement_header {
    @include vCenterBox();
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 16rpx;

    &_left {
      @include vCenterBox();
    }
  }

  .announcement_content {
    @include ellipsisWithLine(2);
    margin: 0 12rpx;
    font-size: 24rpx;
    color: #617183;
  }

  image {
    width: 16px;
    height: 16px;
    min-width: 16px;
  }
}

.group_calling_tab {
  position: absolute;
  left: 0;
  width: 80%;
  margin-top: 12px;
  margin-left: 5%;
  padding: 24rpx;
  background-color: #f4f9ff;
  border-radius: 8rpx;
  color: #5496eb;
  font-size: 24rpx;

  .base_row {
    display: flex;
    align-items: center;

    image {
      width: 10px;
      height: 10px;
    }

    text {
      margin-left: 16rpx;
    }

    .arrow {
      width: 9px;
      height: 6px;
      position: absolute;
      right: 24rpx;
    }
  }

  .member_row {
    display: flex;
    // justify-content: space-between;
    flex-wrap: wrap;
    padding: 24rpx 28rpx;
    margin-top: 24rpx;
    background-color: #fff;
    border-bottom: 1px solid rgba(151, 151, 151, 0.16);
    border-top-left-radius: 8rpx;
    border-top-right-radius: 8rpx;

    .u-avatar {
      margin-bottom: 16rpx;

      &:not(:nth-child(6n)) {
        margin-right: calc(6% / 2);
      }
    }
  }

  .action_row {
    display: flex;
    justify-content: center;
    padding: 24rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom-left-radius: 8rpx;
    border-bottom-right-radius: 8rpx;
  }
}
</style>
