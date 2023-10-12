<template>
  <view class="page_container">
    <view class="self_info_row"></view>

    <view class="info_card">
      <my-avatar :src="selfInfo.faceURL" :desc="selfInfo.nickname" size="46" />

      <view class="id_row">
        <text class="nickname">{{ selfInfo.nickname }}</text>
        <view class="id_row_copy" @click="copy">
          <text class="id">{{ selfInfo.userID }}</text>
          <image
            style="width: 32rpx; height: 32rpx"
            src="@/static/images/id_copy.png"
            mode=""
          />
        </view>
      </view>

      <view class="qr" @click="toSelfQr">
        <img src="static/images/self_info_qr.png" alt="" />
        <img src="static/images/common_right.png" alt="" />
      </view>
    </view>

    <view class="action_box">
      <view
        @click="profileMenuClick(item)"
        class="profile_menu_item"
        v-for="item in profileMenus"
        :key="item.idx"
      >
        <view class="menu_left">
          <image style="width: 48rpx; height: 48rpx" :src="item.icon" mode="" />
          <text>{{ item.title }}</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999"></u-icon>
      </view>
    </view>

    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  components: {
    MyAvatar,
  },
  data() {
    return {
      profileMenus: [
        {
          idx: 0,
          title: "我的信息",
          icon: require("static/images/profile_menu_info.png"),
        },
        {
          idx: 2,
          title: "账号设置",
          icon: require("static/images/profile_menu_account.png"),
        },
        {
          idx: 3,
          title: "关于我们",
          icon: require("static/images/profile_menu_about.png"),
        },
        {
          idx: 4,
          title: "退出登录",
          icon: require("static/images/profile_menu_logout.png"),
        },
      ],
    };
  },
  computed: {
    selfInfo() {
      return this.$store.getters.storeSelfInfo;
    },
  },
  methods: {
    copy() {
      uni.setClipboardData({
        showToast: false,
        data: this.selfInfo.userID,
        success: function () {
          uni.showToast({
            icon: "none",
            title: "复制成功",
          });
        },
      });
    },
    logoutConfirm() {
      IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid())
        .then(() => {
          uni.removeStorage({
            key: "IMToken",
          });
          uni.removeStorage({
            key: "BusinessToken",
          });
        })
        .catch((err) => console.log(err))
        .finally(() => {
          uni.$u.route("/pages/login/index");
        });
    },
    profileMenuClick({ idx }) {
      switch (idx) {
        case 0:
          uni.navigateTo({
            url: "/pages/profile/selfInfo/index",
          });
          break;
        case 2:
          uni.navigateTo({
            url: "/pages/profile/accountSetting/index",
          });
          break;
        case 3:
          uni.navigateTo({
            url: "/pages/profile/about/index",
          });
          break;
        case 4:
          uni.showModal({
            title: "提示",
            content: "确定要退出当前账号吗？",
            confirmText: "确认",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                this.logoutConfirm();
              }
            },
          });
          break;
        default:
          break;
      }
    },
    toSelfQr() {
      uni.navigateTo({
        url: `/pages/common/userOrGroupQrCode/index`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f9fa;

  .self_info_row {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 276rpx;
    background-image: url("@/static/images/profile_top_bg.png");
    background-repeat: round;
  }

  .info_card {
    width: 640rpx;
    height: 196rpx;
    border-radius: 6px;
    background: #fff;
    margin: -120rpx auto 0 auto;
    padding: 0 36rpx;
    color: #0c1c33;
    display: flex;
    align-items: center;

    .id_row {
      @include vCenterBox();
      display: flex;
      height: 46px;
      margin-left: 16rpx;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      flex: 1;
      font-size: 28rpx;

      &_copy {
        @include vCenterBox();
      }

      .nickname {
        @include nomalEllipsis();
        max-width: 400rpx;
        font-weight: 500;
        font-size: 34rpx;
      }

      .id {
        color: #8e9ab0;
      }
    }

    img {
      width: 18px;
      height: 18px;
    }
  }

  .action_box {
    margin: 24rpx 24rpx 0 24rpx;
    background: #fff;
    border-radius: 6px;
  }

  .profile_menu_item {
    @include btwBox();
    padding: 24rpx 36rpx;

    .menu_left {
      @include vCenterBox();
      color: $uni-text-color;

      image {
        margin-right: 24rpx;
      }
    }
  }
}
</style>
