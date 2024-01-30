<template>
  <view class="user_card_container">
    <u-loading-page :loading="isLoading" loading-text="loading..."></u-loading-page>
    <custom-nav-bar title="" />

    <view v-if="!isLoading" style="flex: 1;display: flex;flex-direction: column;">
      <view class="base_info">
        <my-avatar :desc="sourceUserInfo.remark || sourceUserInfo.nickname" :src="sourceUserInfo.faceURL" size="46" />
        <view class="user_name">
          <text class="text">{{ getShowName }}</text>
          <text class="id" @click="copy(sourceUserInfo.userID)">{{
            sourceUserInfo.userID
          }}</text>
        </view>
        <view class="add_btn" @click="toAddFriend" v-if="!isFriend && !disableAdd && !isSelf">
          <u-button type="primary" icon="man-add" text="添加"></u-button>
        </view>
      </view>

      <view v-if="memberInfo" class="info_row">
        <user-info-row-item lable="群昵称" :content="memberInfo.nickname" />
        <user-info-row-item lable="入群时间" :content="getJoinGroupTime" />
        <user-info-row-item lable="入群方式" :content="getJoinSource" />
      </view>

      <view v-if="!isSelf && (showSetRole || showSetMuteMember)" class="info_row">
      </view>

      <view v-if="isFriend" class="info_row">
        <user-info-row-item @click="toMoreInfo" lable="个人资料" arrow />
      </view>

      <view class="action_row" v-if="showSendMessage">
        <view @click="toDesignatedConversation" class="action_item">
          <image src="@/static/images/user_card_message.png" alt="" />
          <text>发消息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { CommonIsAllow } from "@/constant";
import { navigateToDesignatedConversation } from "@/util/imCommon";
import IMSDK, {
  GroupJoinSource,
  GroupMemberRole,
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserInfoRowItem from "./components/UserInfoRowItem.vue";
import dayjs from "dayjs";
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
      memberInfo: null,
      switchLoading: false,
      showSetRole: false,
      showSetMuteMember: false,
      disableAdd: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeFriendList",
      "storeCurrentMemberInGroup",
      "storeCurrentUserID",
      "storeAppConfig",
      "storeSelfInfo",
    ]),
    isFriend() {
      return (
        this.storeFriendList.findIndex(
          (friend) => friend.userID === this.sourceID,
        ) !== -1
      );
    },
    isSelf() {
      return this.sourceID === this.storeSelfInfo.userID;
    },
    isAdmin() {
      return this.memberInfo?.roleLevel === GroupMemberRole.Admin;
    },
    getJoinGroupTime() {
      return this.memberInfo
        ? dayjs(this.memberInfo.joinTime).format("YYYY-MM-DD")
        : "";
    },
    getJoinSource() {
      if (!this.memberInfo) {
        return "";
      }

      switch (this.memberInfo.joinSource) {
        case GroupJoinSource.Invitation:
          return "邀请进群";
        case GroupJoinSource.QrCode:
          return "扫码进群";
        case GroupJoinSource.Search:
          return "搜索进群";
        default:
          return "-";
      }
    },
    getShowName() {
      let suffix = "";
      if (this.sourceUserInfo.remark) {
        suffix = `(${this.sourceUserInfo.remark})`;
      }
      return this.sourceUserInfo.nickname + suffix;
    },
    showSendMessage() {
      const businessAllow =
        this.storeAppConfig.allowSendMsgNotFriend === CommonIsAllow.Allow;
      return businessAllow ? businessAllow : this.isFriend;
    },
  },
  onLoad(options) {
    const { sourceID, sourceInfo, memberInfo, disableAdd } = options;
    this.disableAdd = disableAdd ? JSON.parse(disableAdd) : false;
    if (sourceID) {
      this.sourceID = sourceID;
      this.getSourceUserInfo();
    } else {
      const info = JSON.parse(sourceInfo);
      this.sourceID = info.userID;
      this.sourceUserInfo = {
        ...info,
      };
    }
    if (memberInfo) {
      this.memberInfo = JSON.parse(memberInfo);
      this.checkCurrentMember();
    }
    this.setIMListener();
  },
  onUnload() {
    this.disposeIMListener();
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
      let info = null;
      this.isLoading = true
      try {
        const { total, users } = await businessSearchUserInfo(this.sourceID);
        if (total > 0) {
          const { data } = await IMSDK.asyncApi(
            'getUsersInfoWithCache',
            IMSDK.uuid(),
            { userIDList: [this.sourceID] },
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
    async checkCurrentMember() {
      let role;
      if (this.storeCurrentMemberInGroup.groupID === this.memberInfo.groupID) {
        role = this.storeCurrentMemberInGroup.roleLevel;
      } else {
        try {
          const { data } = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
            IMSDK.uuid(),
            {
              groupID: this.memberInfo.groupID,
              userIDList: [this.storeCurrentUserID],
            },
          );
          role = data[0]?.roleLevel;
        } catch (e) { }
      }
      this.showSetRole = role === GroupMemberRole.Owner;
      this.showSetMuteMember =
        role === GroupMemberRole.Owner ||
        (role === GroupMemberRole.Admin &&
          this.memberInfo.roleLevel === GroupMemberRole.Nomal);
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
        this.memberInfo !== null,
      ).catch(() => uni.$u.toast("获取会话信息失败"));
    },
    toMoreInfo() {
      uni.navigateTo({
        url: `/pages/common/userCardMore/index?sourceInfo=${JSON.stringify(
          this.sourceUserInfo,
        )}`,
      });
    },
    friendInfoChangeHandler({ data }) {
      if (data.userID === this.sourceUserInfo.userID) {
        this.sourceUserInfo = {
          ...this.sourceUserInfo,
          ...data,
        };
      }
    },
    groupMemberInfoChangeHandler({ data }) {
      if (
        data.userID === this.memberInfo.userID &&
        data.groupID === this.memberInfo.groupID
      ) {
        this.memberInfo = {
          ...this.memberInfo,
          ...data,
        };
      }
    },
    setIMListener() {
      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendInfoChanged,
        this.friendInfoChangeHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupMemberInfoChanged,
        this.groupMemberInfoChangeHandler,
      );
    },
    disposeIMListener() {
      IMSDK.unsubscribe(
        IMSDK.IMEvents.OnFriendInfoChanged,
        this.friendInfoChangeHandler,
      );
      IMSDK.unsubscribe(
        IMSDK.IMEvents.OnGroupMemberInfoChanged,
        this.groupMemberInfoChangeHandler,
      );
    },
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

      image {
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
