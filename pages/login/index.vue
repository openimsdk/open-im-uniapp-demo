<template>
  <view class="page_container">
    <view class="login">
      <view class="logo">
        <img src="static/images/logo.png" alt="" />
        <view class="title">欢迎使用OpenCorp</view>
      </view>
      <u-tabs :list="list" @click="click"></u-tabs>
      <u-form
        class="loginForm"
        labelPosition="top"
        :model="loginInfo"
        :labelStyle="{
          fontSize: '14px',
          marginTop: '20rpx',
          width: 'max-content',
        }"
        ref="loginForm"
      >
        <u-form-item v-if="active === 0" label="" prop="phoneNumber">
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
        <u-form-item v-if="active === 1" label="" prop="email">
          <u-input
            v-model="loginInfo.email"
            border="surround"
            placeholder="请输入您的邮箱"
            clearable
          >
          </u-input>
        </u-form-item>
        <u-form-item v-if="active > 1 || isPwdLogin" label="" prop="password">
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
        <u-form-item
          v-if="active <= 1 && !isPwdLogin"
          label=""
          prop="verificationCode"
        >
          <u-input
            v-model="loginInfo.verificationCode"
            border="surround"
            placeholder="请输入验证码"
          >
            <view class="code_btn" slot="suffix" @click="getCode">
              {{ count !== 0 ? `${count} s` : "获取验证码" }}
            </view>
          </u-input>
        </u-form-item>
      </u-form>
      <view v-if="active <= 1" class="other">
        <text @click="toRegisterOrForget(false)">忘记密码</text>
        <text class="forget" @click="toggleLoginMethod">{{ isPwdLogin ? "验证码登录" : "密码登录" }}</text>
      </view>
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
      <text>还没有账号？<text class="register" @click="toRegisterOrForget(true)">立即注册</text></text>
      <text style="margin-bottom: 16rpx" @click="copy">{{ v }}</text>
    </view>
  </view>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { version } from '@/common/config'
import { businessLogin, businessSendSms } from "@/api/login";
import AreaPicker from "@/components/AreaPicker";
import { checkLoginError } from "@/util/common";
import { SmsUserFor } from "@/constant";
import IMSDK from "openim-uniapp-polyfill";

let timer;

export default {
  components: {
    AreaPicker,
  },
  data() {
    return {
      list: [{
          name: '手机号',
      }, {
          name: '邮箱',
      }],
      loginInfo: {
        email: "",
        phoneNumber: "",
        password: "",
        areaCode: "86",
        verificationCode: "",
      },
      eying: false,
      loading: false,
      count: 0,
      isPwdLogin: true,
      active: 0,
    };
  },
  computed: {
    v() {
      return version
    },
    canLogin() {
      return (
        (this.loginInfo.phoneNumber || this.loginInfo.email) && 
        (this.loginInfo.password || this.loginInfo.verificationCode)
      );
    },
  },
  onLoad(options) {
    // if(options.isRedirect){
    // 	plus.navigator.closeSplashscreen();
    // }
    this.version = version
    this.init();
  },
  methods: {
    click({ index }) {
      this.active = index;
    },
    copy() {
      uni.setClipboardData({
        showToast: false,
        data: version,
        success: function () {
          uni.showToast({
            icon: "none",
            title: "复制成功",
          });
        },
      });
    },
    init() {
      this.loginInfo.areaCode = uni.getStorageSync("last_areaCode") || "86";
      this.loginInfo.email = uni.getStorageSync("last_email") || "";
      this.loginInfo.phoneNumber = uni.getStorageSync("last_phoneNumber") || "";
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
      // this.$refs.loginForm.validate().then(async (valid) => {
        this.loading = true;
        this.saveLoginInfo();
        let data = {};
        try {
          data = await businessLogin({
            phoneNumber: this.loginInfo.phoneNumber,
            email: this.loginInfo.email,
            areaCode: `+${this.loginInfo.areaCode}`,
            password: this.isPwdLogin ? md5(this.loginInfo.password) : "",
            platform: uni.$u.os() === "ios" ? 1 : 2,
            verifyCode: this.loginInfo.verificationCode,
          });
          const { imToken, userID } = data;
          await IMSDK.asyncApi(IMSDK.IMMethods.Login, uuidv4(), {
            userID,
            token: imToken,
          });
          this.saveLoginProfile(data);
          this.$store.commit("user/SET_AUTH_DATA", data);
          this.$store.dispatch("user/getSelfInfo");
          this.$store.dispatch("conversation/getConversationList");
          this.$store.dispatch("conversation/getUnReadCount");
          // this.$store.dispatch("contact/getFriendList");
          // this.$store.dispatch("contact/getGrouplist");
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
      // });
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
        key: "last_areaCode",
        data: this.loginInfo.areaCode,
      });
      uni.setStorage({
        key: "last_phoneNumber",
        data: this.loginInfo.phoneNumber,
      });
      uni.setStorage({
        key: "last_email",
        data: this.loginInfo.email,
      });
    },
    showPicker() {
      this.$refs.AreaPicker.init();
    },
    chooseArea(areaCode) {
      this.loginInfo.areaCode = areaCode;
    },
    toggleLoginMethod() {
      this.isPwdLogin = !this.isPwdLogin;
    },
    getCode() {
      if (!this.loginInfo.phoneNumber) {
        uni.$u.toast("请先输入手机号！");
        return;
      }

      if (this.count !== 0) {
        return;
      }

      const options = {
        phoneNumber: this.loginInfo.phoneNumber,
        areaCode: `+${this.loginInfo.areaCode}`,
        usedFor: SmsUserFor.Login,
        operationID: Date.now() + "",
      };
      businessSendSms(options)
        .then(() => {
          uni.$u.toast("验证码已发送！");
          this.startCount();
        })
        .catch((err) => {
          console.error(err);
          uni.$u.toast(checkLoginError(err));
        });
    },
    startCount() {
      if (timer) {
        clearInterval(timer);
      }
      this.count = 60;
      timer = setInterval(() => {
        if (this.count > 0) {
          this.count--;
        }
      }, 1000);
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
      font-weight: 700;
      margin-bottom: 64rpx;
      // color: $u-primary;
    }

    .logo {
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;

      img {
        width: 160rpx;
        height: 160rpx;
      }
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
      margin: 8rpx;
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
