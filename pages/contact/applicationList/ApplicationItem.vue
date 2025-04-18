<template>
  <view @click="clickItem" class="application_item">
    <my-avatar
      :src="getAvatarUrl"
      :isGroup="isGroupApplication"
      :desc="application[isRecv ? 'fromNickname' : 'toNickname']"
      size="42"
    />
    <view class="application_item_details">
      <view class="content">
        <text class="user_name">{{ getShowName }}</text>

        <view v-if="isGroupApplication" class="title">
          申请加入
          <text class="group_name">{{ application.groupName }}</text>
        </view>
        <text class="req_message">{{ application.reqMsg }}</text>
      </view>

      <view class="application_action">
        <text v-if="showStateStr" class="status_tip">{{ getStateStr }}</text>
        <text v-if="showGreet" @tap.stop="greetToUser" class="status_tip greet"
          >打招呼</text
        >
        <button
          :loading="accessLoading"
          v-if="showAccept"
          class="access_btn"
          @tap.stop="acceptApplication"
          type="primary"
          :plain="true"
          size="mini"
        >
          {{ isGroupApplication ? "同意" : "接受" }}
        </button>
      </view>

      <view class="bottom_line"> </view>
    </view>
  </view>
</template>

<script>
import { navigateToDesignatedConversation } from "@/util/imCommon";
import IMSDK, { SessionType } from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  name: "ApplicationItem",
  components: {
    MyAvatar,
  },
  props: {
    application: Object,
    isRecv: Boolean,
  },
  data() {
    return {
      accessLoading: false,
    };
  },
  computed: {
    isGroupApplication() {
      return this.application.groupID !== undefined;
    },
    getShowName() {
      if (this.isRecv) {
        return this.application[
          this.isGroupApplication ? "nickname" : "fromNickname"
        ];
      }
      return this.application[
        this.isGroupApplication ? "groupName" : "toNickname"
      ];
    },
    showGreet() {
      return !this.isGroupApplication && this.application.handleResult === 1;
    },
    showStateStr() {
      if (
        (this.isRecv && this.application.handleResult === 0) ||
        this.showGreet
      ) {
        return false;
      }
      return true;
    },
    showAccept() {
      return this.application.handleResult === 0 && this.isRecv;
    },
    getStateStr() {
      if (this.application.handleResult === -1) {
        return "已拒绝";
      }
      if (this.application.handleResult === 0) {
        return "等待验证";
      }
      return "已同意";
    },
    getAvatarUrl() {
      if (this.isGroupApplication) {
        return this.application.groupFaceURL;
      }
      return this.application[this.isRecv ? "fromFaceURL" : "toFaceURL"];
    },
  },
  methods: {
    clickItem() {
      if (this.showAccept) {
        uni.navigateTo({
          url: `/pages/contact/applicationDetails/index?application=${JSON.stringify(
            this.application,
          )}`,
        });
      } else {
        let sourceID =
          this.application.groupID ??
          (this.isRecv
            ? this.application.fromUserID
            : this.application.toUserID);
        let cardType = this.isGroupApplication ? "groupCard" : "userCard";
        const url = `/pages/common/${cardType}/index?sourceID=${sourceID}`;
        uni.navigateTo({
          url,
        });
      }
    },
    acceptApplication() {
      this.accessLoading = true;
      let func;
      if (this.isGroupApplication) {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.AcceptGroupApplication,
          IMSDK.uuid(),
          {
            groupID: this.application.groupID,
            fromUserID: this.application.userID,
            handleMsg: "",
          },
        );
      } else {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.AcceptFriendApplication,
          IMSDK.uuid(),
          {
            toUserID: this.application.fromUserID,
            handleMsg: "",
          },
        );
      }
      func
        .then(() => uni.$u.toast("操作成功"))
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.accessLoading = false));
    },
    greetToUser() {
      navigateToDesignatedConversation(
        this.application[this.isRecv ? "fromUserID" : "toUserID"],
        SessionType.Single,
      ).catch(() => uni.$u.toast("获取会话信息失败"));
    },
  },
};
</script>

<style lang="scss" scoped>
.application_item {
  // @include vCenterBox();
  display: flex;
  justify-content: flex-start;
  padding: 24rpx 44rpx;
  color: $uni-text-color;
  background-color: #fff;

  &_details {
    @include vCenterBox();
    margin-left: 24rpx;
    width: 100%;
    position: relative;

    .content {
      @include colBox(false);
      font-size: 26rpx;
      width: 100%;

      .user_name {
        @include nomalEllipsis();
        max-width: 400rpx;
        font-size: 28rpx;
        color: $uni-text-color;
        margin-bottom: 10rpx;
      }

      .req_message {
        @include ellipsisWithLine(2);
        max-width: 80%;
        color: #999;
      }

      .title {
        margin-bottom: 20rpx;
        word-break: break-all;
        width: 75%;

        .group_name {
          margin-left: 12rpx;
          color: $uni-color-primary;
        }
      }
    }

    .application_action {
      position: absolute;
      right: 0;

      .status_tip {
        font-size: 28rpx;
        color: #666;
      }

      .access_btn {
        padding: 0 12rpx;
        height: 48rpx;
        line-height: 48rpx;
      }

      .greet {
        color: #418ae5;
      }
    }

    .bottom_line {
      height: 1px;
      width: 100%;
      background-color: #f0f0f0;
      position: absolute;
      bottom: -24rpx;
    }
  }
}

.u-list-item:last-child {
  .bottom_line {
    height: 0;
  }
}
</style>
