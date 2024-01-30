<template>
  <view class="page_container">
    <custom-nav-bar :title="isGroupApplication ? '群通知' : '好友请求'" />

    <view class="application_item">
      <view class="base_info_row">
        <view class="base_info_left" @click="toSourceDetails">
          <my-avatar :src="getSourceFaceURL" :desc="getSourceName" />
          <view class="base_info_details">
            <text class="nickname">{{ getSourceName }}</text>
          </view>
        </view>

        <u-icon name="arrow-right" size="18" color="#999"></u-icon>
      </view>

      <view class="request_message">
        <view v-if="isGroupApplication" class="title">
          <text>申请加入 </text>
          <text class="group_name">{{ currentApplication.groupName }}</text>
        </view>
        <text v-else>{{ `${getSourceName}：` }}</text>
        <text>{{ currentApplication.reqMsg }}</text>
      </view>

      <view v-if="isGroupApplication" class="join_source">
        <text>{{ `来源：${getGroupJoinSource}` }}</text>
      </view>
    </view>

    <view class="action_row">
      <u-button
        :loading="loadingState.accept"
        @click="acceptAplication"
        type="primary"
        :plain="true"
        :text="`通过${isGroupApplication ? '入群' : '好友'}申请`"
      ></u-button>
    </view>

    <view class="action_row">
      <u-button
        :loading="loadingState.refuse"
        @click="refuseAplication"
        type="primary"
        :plain="true"
        :text="`拒绝${isGroupApplication ? '入群' : '好友'}申请`"
      ></u-button>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, { GroupJoinSource } from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
  },
  data() {
    return {
      currentApplication: {},
      isOnline: false,
      loadingState: {
        accept: false,
        refuse: false,
      },
    };
  },
  computed: {
    ...mapGetters(["storeSelfInfo"]),
    isGroupApplication() {
      return this.currentApplication.groupID !== undefined;
    },
    getSourceID() {
      return (
        this.currentApplication.fromUserID ?? this.currentApplication.userID
      );
    },
    getSourceName() {
      return (
        this.currentApplication.fromNickname ?? this.currentApplication.nickname
      );
    },
    getSourceFaceURL() {
      return (
        this.currentApplication.fromFaceURL ?? this.currentApplication.faceURL
      );
    },
    getGroupJoinSource() {
      if (this.currentApplication.joinSource === GroupJoinSource.Invitation) {
        return "群成员邀请";
      }
      if (this.currentApplication.joinSource === GroupJoinSource.Search) {
        return "搜索群ID";
      }
      return "扫描二维码";
    },
  },
  onLoad(options) {
    const { application } = options;
    this.currentApplication = JSON.parse(application);
  },
  methods: {
    toSourceDetails() {
      uni.navigateTo({
        url: `/pages/common/userCard/index?sourceID=${this.getSourceID}`,
      });
    },
    acceptAplication() {
      this.loadingState.accept = true;
      let func;
      if (this.isGroupApplication) {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.AcceptGroupApplication,
          IMSDK.uuid(),
          {
            groupID: this.currentApplication.groupID,
            fromUserID: this.currentApplication.userID,
            handleMsg: "",
          },
        );
      } else {
        console.log(this.currentApplication);
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.AcceptFriendApplication,
          IMSDK.uuid(),
          {
            toUserID: this.currentApplication.fromUserID,
            handleMsg: "",
          },
        );
      }
      func
        .then(() => {
          uni.$u.toast("操作成功");
          setTimeout(() => uni.navigateBack(), 500);
        })
        .catch((e) => {
          console.log(e);
          uni.$u.toast("操作失败");
        })
        .finally(() => (this.loadingState.accept = false));
    },
    refuseAplication() {
      this.loadingState.refuse = true;
      let func;
      if (this.isGroupApplication) {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.RefuseGroupApplication,
          IMSDK.uuid(),
          {
            groupID: this.currentApplication.groupID,
            fromUserID: this.currentApplication.userID,
            handleMsg: "",
          },
        );
      } else {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.RefuseFriendApplication,
          IMSDK.uuid(),
          {
            toUserID: this.currentApplication.fromUserID,
            handleMsg: "",
          },
        );
      }
      func
        .then(() => {
          uni.$u.toast("操作成功");
          setTimeout(() => uni.navigateBack(), 250);
        })
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.loadingState.refuse = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f8f8;

  .application_item {
    padding: 72rpx 44rpx 24rpx;
    background-color: #fff;

    .base_info_row {
      @include btwBox();

      .base_info_left {
        @include vCenterBox();
      }

      .base_info_details {
        margin-left: 24rpx;

        .nickname {
          @include nomalEllipsis();
          max-width: 600rpx;
        }

        .online_state {
          @include vCenterBox();
          flex-direction: row;
          font-size: 24rpx;
          color: #999;
          margin-top: 6rpx;

          .dot {
            background-color: #10cc64;
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            margin-right: 12rpx;
          }
        }
      }
    }

    .request_message {
      background-color: #eee;
      margin-top: 48rpx;
      padding: 24rpx 36rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #666;
      min-height: 240rpx;

      .title {
        margin-bottom: 12rpx;
        color: $uni-text-color;

        .group_name {
          @include nomalEllipsis();
          max-width: 400rpx;
          color: $uni-color-primary;
          margin-left: 12rpx;
        }
      }
    }

    .join_source {
      margin-top: 20rpx;
      font-size: 24rpx;
      color: #666;
      text-align: right;
    }
  }

  .action_row {
    margin-top: 24rpx;

    .u-button {
      border: none;
    }

    &:last-child {
      .u-button {
        color: #999 !important;
      }
    }
  }
}
</style>
