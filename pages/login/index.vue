<template>
  <view class="page_container">
    <view class="login">
      <view class="logo">
        <image style="width: 65px;height: 66px;" src="@/static/images/logo.png" alt="" />
        <view class="title" @click="toConfig">欢迎使用OpenIM</view>
      </view>
      <u-form
        class="loginForm"
        labelPosition="top"
        :model="loginInfo"
        :rules="rules"
        :labelStyle="{
          fontSize: '14px',
          marginTop: '20rpx',
          width: 'max-content',
        }"
        ref="loginForm"
      >
        <u-form-item label="手机号" prop="phoneNumber">
          <u-input
            v-model="loginInfo.phoneNumber"
            border="surround"
            placeholder="请输入手机号码"
            clearable
          >
            <view
              slot="prefix"
              class="phoneNumber_areacode"
              @click="showPicker"
            >
              <text class="areacode_content">+{{ loginInfo.areaCode }}</text>
              <u-icon class="arrow_down" name="arrow-down"></u-icon>
            </view>
          </u-input>
        </u-form-item>
        <u-form-item v-show="isPwdLogin" label="密码" prop="password">
          <u-input
            v-model="loginInfo.password"
            border="surround"
            placeholder="请输入密码"
            :password="!eying"
            clearable
          >
            <u-icon
              @click="updateEye"
              slot="suffix"
              :name="eying ? 'eye-off' : 'eye'"
            >
            </u-icon>
          </u-input>
        </u-form-item>
      </u-form>
      <view class="login-btn">
        <u-button
          :loading="loading"
          type="primary"
          @click="startLogin"
          :disabled="!canLogin"
        >
          登录
        </u-button>
      </view>
      <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />
    </view>

    <view class="action_bar">
      <text style="margin-bottom: 16rpx" @click="copy">{{ version }}</text>
      <text
        >还没有账号？<text class="register" @click="toRegisterOrForget(true)"
          >立即注册</text
        ></text
      >
    </view>
  </view>
</template>

<script>
import md5 from "md5";
import config, { version } from '@/common/config'
import { businessLogin } from "@/api/login";
import AreaPicker from "@/components/AreaPicker";
import { checkLoginError } from "@/util/common";
import IMSDK from "openim-uniapp-polyfill";

let timer;

export default {
  components: {
    AreaPicker,
  },
  data() {
    return {
      version: "",
      loginInfo: {
        phoneNumber: "",
        password: "",
        areaCode: "86",
        verificationCode: undefined,
      },
      checked: [true],
      eying: false,
      loading: false,
      count: 0,
      isPwdLogin: true,
    };
  },
  computed: {
    canLogin() {
      return (
        this.checked[0] && this.loginInfo.phoneNumber && this.loginInfo.password
      );
    },
    rules() {
      return {
        password: this.isPwdLogin
          ? [
              {
                type: "string",
                required: true,
                message: "请输入密码",
                trigger: ["blur", "change"],
              },
            ]
          : [],
        phoneNumber: [
          {
            type: "string",
            required: true,
            message: "请输入手机号码",
            trigger: ["blur", "change"],
          },
        ],
      };
    },
  },
  onLoad() {
    this.version = version
    this.init();
  },
  methods: {
    copy() {
      uni.setClipboardData({
        showToast: false,
        data: this.version,
        success: function () {
          uni.showToast({
            icon: "none",
            title: "复制成功",
          });
        },
      });
    },
    init() {
      if (process.env.NODE_ENV === "development") {
        this.loginInfo.phoneNumber =
          uni.getStorageSync("lastPhoneNumber") || "";
        this.loginInfo.areaCode = uni.getStorageSync("lastAreaCode") || "86";
      } else {
        this.loginInfo.phoneNumber =
          uni.getStorageSync("lastPhoneNumber") || "";
        this.loginInfo.areaCode = uni.getStorageSync("lastAreaCode") || "86";
      }
    },
    toConfig() {
      uni.$u.route("/pages/common/updateConfig/index");
    },
    updateEye() {
      this.eying = !this.eying;
    },
    toRegisterOrForget(isRegister) {
      uni.$u.route("/pages/login/registerOrForget/index", {
        isRegister,
      });
    },
    async startLogin() {
      this.$refs.loginForm.validate().then(async (valid) => {
        this.loading = true;
        this.saveLoginInfo();
        let data = {};
        let platform;
        try {
          // #ifdef H5
          platform = 5
          // #endif
          // #ifdef MP-WEIXIN
          platform = 6
          // #endif
          // #ifdef APP-PLUS
          platform = uni.$u.os() === "ios" ? 1 : 2
          // #endif

          data = await businessLogin({
            phoneNumber: this.loginInfo.phoneNumber,
            areaCode: `+${this.loginInfo.areaCode}`,
            password: md5(this.loginInfo.password),
            platform,
            verifyCode: this.loginInfo.verificationCode,
          });
          const { imToken, userID } = data;

          // #ifdef H5 || MP-WEIXIN
          await IMSDK.asyncApi(IMSDK.IMMethods.Login, IMSDK.uuid(), {
            userID,
            token: imToken,
            platformID: platform,
            wsAddr: config.getWsUrl(),
            apiAddr: config.getApiUrl(),
          });
          // #endif

          // #ifdef APP-PLUS
          await IMSDK.asyncApi(IMSDK.IMMethods.Login, IMSDK.uuid(), {
            userID,
            token: imToken,
          });
          // #endif

          this.saveLoginProfile(data);
          this.$store.commit("user/SET_AUTH_DATA", data);
          this.$store.dispatch("user/getSelfInfo");
          this.$store.dispatch("conversation/getConversationList");
          this.$store.dispatch("conversation/getUnReadCount");
          this.$store.dispatch("contact/getFriendList");
          this.$store.dispatch("contact/getGrouplist");
          this.$store.dispatch("contact/getBlacklist");
          this.$store.dispatch("contact/getRecvFriendApplications");
          this.$store.dispatch("contact/getSentFriendApplications");
          this.$store.dispatch("contact/getRecvGroupApplications");
          this.$store.dispatch("contact/getSentGroupApplications");
          uni.switchTab({
            url: "/pages/conversation/conversationList/index",
          });
          this.loginInfo.password = "";
        } catch (err) {
          console.error(err);
          uni.$u.toast(checkLoginError(err));
        }
        this.loading = false;
      });
    },
    saveLoginProfile(data) {
      const { imToken, chatToken, userID } = data;
      uni.setStorage({
        key: "IMUserID",
        data: userID,
      });
      uni.setStorage({
        key: "IMToken",
        data: imToken,
      });
      uni.setStorage({
        key: "BusinessToken",
        data: chatToken,
      });
    },
    saveLoginInfo() {
      uni.setStorage({
        key: "lastPhoneNumber",
        data: this.loginInfo.phoneNumber,
      });
      uni.setStorage({
        key: "lastAreaCode",
        data: this.loginInfo.areaCode,
      });
    },
    showPicker() {
      this.$refs.AreaPicker.init();
    },
    chooseArea(areaCode) {
      this.loginInfo.areaCode = areaCode;
    },
  },
};
</script>
<style lang="scss" scoped>
.page_container {
  justify-content: space-between;

  .login {
    color: #0c1c33;
    padding: 10vh 80rpx 0;
    background: linear-gradient(
      180deg,
      rgba(0, 137, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );

    .title {
      font-size: 34rpx;
      font-weight: 600;
      margin-bottom: 116rpx;
      color: $u-primary;
    }

    .logo {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .loginType {
      margin-bottom: 36rpx;

      &-item {
        margin-right: 68rpx;
        font-size: 28rpx;
        font-weight: 400;
        border-radius: 4rpx;
        padding: 2rpx 0;
      }

      &-active {
        color: $u-primary;
        border-bottom: 4rpx solid $u-primary;
      }
    }

    .loginForm {
      .phoneNumber-code {
        display: flex;
        align-items: center;
        font-size: 36rpx;
        border-right: 2rpx solid #d8d8d8;
        margin-right: 58rpx;

        .code {
          font-weight: 400;
          margin-right: 20rpx;
        }

        .icon {
          margin-right: 40rpx;
        }
      }

      .eye {
        .image {
          width: 44rpx;
          height: 32rpx;
        }
      }

      .code_btn {
        color: $u-primary;
      }
    }

    .other {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 29rpx;
      font-size: 24rpx;
      font-weight: 400;
      color: $u-tips-color;

      .forget {
        color: $u-primary;
      }
    }

    .login-btn {
      margin-top: 8vh;
    }

    .agreement {
      display: flex;
      align-items: flex-start;
      margin-top: 36rpx;

      .detail {
        font-size: 24rpx;
        font-weight: 400;
        color: $u-primary;
      }
    }
  }

  .action_bar {
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    margin-bottom: 96rpx;
    font-size: 24rpx;
    font-weight: 400;
    color: $u-tips-color;

    .register {
      color: $u-primary;
    }

    .tap_line {
      width: 1px;
      margin: 0 24rpx;
      background-color: #999;
      transform: scale(0.5, 0.8);
    }
  }
}
</style>
