<template>
  <view class="user_card_container">
    <u-loading-page :loading="isLoading" loading-text="loading..."></u-loading-page>
    <custom-nav-bar title="" />

    <view v-if="!isLoading" style="flex: 1;display: flex;flex-direction: column;">
      <view class="base_info">
        <my-avatar
          :desc="sourceUserInfo.remark || sourceUserInfo.nickname"
          :src="sourceUserInfo.faceURL"
          size="46"
        />
        <view class="user_name">
          <text class="text">{{ getShowName }}</text>
          <text class="id" @click="copy(sourceUserInfo.userID)">{{
            sourceUserInfo.userID
          }}</text>
        </view>
        <view class="add_btn" @click="toAddFriend" v-if="trySendRequest">
          <u-button type="primary" icon="man-add" text="添加"></u-button>
        </view>
      </view>

      <view v-if="isFriend" class="info_row">
        <user-info-row-item @click="toMoreInfo" lable="个人资料" arrow />
      </view>

      <view class="action_row" v-if="!isSelf">
        <view @click="toDesignatedConversation" class="action_item">
          <img src="static/images/user_card_message.png" alt="" />
          <text>发消息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { navigateToDesignatedConversation } from "@/util/imCommon";
import IMSDK, {
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserInfoRowItem from "./components/UserInfoRowItem.vue";
import { businessSearchUserInfo } from "@/api/login";

export default {
  components: {
    CustomNavBar,
    MyAvatar,
    UserInfoRowItem,
  },
  data() {
    return {
      isLoading: false,
      sourceID: "",
      sourceUserInfo: {},
      switchLoading: false,
      showSetRole: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeFriendList",
      "storeSelfInfo",
    ]),
    isFriend() {
      return (
        this.storeFriendList.findIndex(
          (friend) => friend.userID === this.sourceID,
        ) !== -1
      );
    },
    trySendRequest() {
      return !this.isFriend && !this.isSelf
    },
    isSelf() {
      return this.sourceID === this.storeSelfInfo.userID;
    },
    getShowName() {
      let suffix = "";
      if (this.sourceUserInfo.remark) {
        suffix = `(${this.sourceUserInfo.remark})`;
      }
      return this.sourceUserInfo.nickname + suffix;
    },
  },
  onLoad(options) {
    const { sourceID, sourceInfo } = options;
    if (sourceID) {
      this.sourceID = sourceID;
    } else {
      const info = JSON.parse(sourceInfo);
      this.sourceID = info.userID;
    }
    this.getSourceUserInfo();
  },
  methods: {
    copy(userID) {
      uni.setClipboardData({
        showToast: false,
        data: userID,
        success: function () {
          uni.showToast({
            icon: "none",
            title: "复制成功",
          });
        },
      });
    },
    async getSourceUserInfo() {
      let info = {};
      const friendInfo = this.storeFriendList.find((item) => item.userID === this.sourceID);
      if (friendInfo) {
        info = { ...friendInfo };
      }
      else {
        const { data } = await IMSDK.asyncApi(
          IMSDK.IMMethods.GetUsersInfo,
          IMSDK.uuid(),
          [this.sourceID],
        );
        info = { ...(data[0] ?? {}) };
      }
      this.isLoading = true
      try {
        const { total, users } = await businessSearchUserInfo(this.sourceID);
        if (total > 0) {
          const { data } = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetUsersInfo,
            IMSDK.uuid(),
            [this.sourceID],
          );
          const imData = data[0]?.friendInfo ?? data[0]?.publicInfo ?? {};
          info = {
            ...imData,
            ...users[0],
          };
        }
      } catch (e) {
        info = {};
      }
      this.isLoading = false
      this.sourceUserInfo = {
        ...info,
      };
    },
    toAddFriend() {
      uni.$u.route("/pages/common/sendAddRequest/index", {
        isGroup: false,
        sourceID: this.sourceID,
        isScan: false,
        notNeedVerification: false,
      });
    },
    toDesignatedConversation() {
      navigateToDesignatedConversation(
        this.sourceID,
        SessionType.Single,
        false,
      ).catch(() => uni.$u.toast("获取会话信息失败"));
    },
    toMoreInfo() {
      uni.navigateTo({
        url: `/pages/common/userCardMore/index?sourceInfo=${JSON.stringify(
          this.sourceUserInfo,
        )}`,
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.user_card_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;
  overflow-y: auto;
  position: relative;

  .base_info {
    @include vCenterBox();
    background-color: #fff;
    padding: 44rpx;
    margin-bottom: 18rpx;

    .add_btn {
      width: 140rpx;
      height: 60rpx;
      margin-left: auto;

      .u-button {
        width: 140rpx;
        height: 60rpx;
      }
    }

    .u-avatar {
      margin-right: 24rpx;
    }

    .user_name {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-bottom: 12rpx;
      height: 46px;

      .text {
        @include nomalEllipsis();
        max-width: 300rpx;
      }
    }

    .company {
      font-size: 28rpx;
      color: $u-primary;
    }
  }

  .info_row {
    background-color: #fff;
    margin-bottom: 24rpx;
  }

  .mute_right {
    display: flex;
    align-items: center;
  }

  .company_row {
    padding: 20rpx 0;

    .desc_title {
      padding-left: 44rpx;
    }

    /deep/.title {
      width: 200rpx;
      color: #999 !important;
    }
  }

  .action_row {
    @include vCenterBox();
    align-items: flex-end;
    justify-content: space-around;
    margin: 44rpx;
    flex: 1;

    .action_item {
      width: 100%;
      @include colBox(true);
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 22rpx 0;
      background: $u-primary;
      color: #fff;
      border-radius: 12rpx;

      img {
        margin-right: 16rpx;
        width: 40rpx;
        height: 40rpx;
      }
    }
  }

  .id {
    font-size: 24rpx;
    color: #999;
  }

  .online_state {
    @include vCenterBox();
    margin-left: 24rpx;
    font-size: 24rpx;
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
</style>
