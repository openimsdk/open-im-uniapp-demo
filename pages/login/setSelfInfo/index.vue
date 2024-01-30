<template>
  <view class="set_info_container content_with_back">
    <view class="title">设置信息</view>
    <u-form
      class="loginForm commonPage-form"
      labelPosition="top"
      :model="userInfo"
      :rules="rules"
      :labelStyle="{
        fontSize: '14px',
        marginTop: '20rpx',
        minWidth: '200rpx',
      }"
      ref="loginForm"
    >
      <u-form-item label="昵称" prop="nickname">
				<u-input
				  v-model="userInfo.nickname"
				  border="surround"
				  placeholder="请输入您的昵称"
					clearable
				>
				</u-input>
      </u-form-item>
      <u-form-item label="密码" prop="password">
        <u-input
          v-model="userInfo.password"
          border="surround"
          placeholder="请输入密码"
          :password="!passwordEying"
        >
          <u-icon
            @click="updateEye('passwordEying')"
            slot="suffix"
            :name="passwordEying ? 'eye-off' : 'eye'"
          ></u-icon>
        </u-input>
      </u-form-item>
      <view class="feild_desc">6～20位，至少包含数字、字母</view>
      <u-form-item label="确认密码" prop="confirmPassword">
        <u-input
          v-model="userInfo.confirmPassword"
          border="surround"
          placeholder="请输入密码"
          :password="!comfirmEying"
        >
          <u-icon
            @click="updateEye('comfirmEying')"
            slot="suffix"
            :name="comfirmEying ? 'eye-off' : 'eye'"
          ></u-icon>
        </u-input>
      </u-form-item>
    </u-form>
    <view class="btn">
      <u-button :loading="loading" type="primary" @click="doNext">
        进入OpenIM
      </u-button>
    </view>
  </view>
</template>

<script>
import md5 from "md5";
import config from '@/common/config'
import IMSDK from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { businessRegister } from "@/api/login";
import { checkLoginError, getPurePath } from "@/util/common";
export default {
  components: {
    MyAvatar,
  },
  data() {
    return {
      loading: false,
      passwordEying: false,
      comfirmEying: false,
      codeValue: "",
      userInfo: {
        phoneNumber: "",
        areaCode: "",
        nickname: "",
        password: "",
        confirmPassword: "",
      },
      rules: {
        nickname: [
          {
            type: "string",
            required: true,
            message: "请填写真实姓名",
            trigger: ["blur", "change"],
          },
        ],
        password: [
          {
            type: "string",
            required: true,
            message: "请输入密码",
            trigger: ["blur", "change"],
            pattern: /^(?=.*\d)(?=.*[a-zA-Z]).{7,}$/,
          },
          {
            validator: (rule, value, callback) => {
              return value.length >= 6;
            },
            message: "密码太短",
            trigger: ["change", "blur"],
          },
        ],
        confirmPassword: [
          {
            type: "string",
            required: true,
            message: "请输入确认密码",
            trigger: ["blur", "change"],
            pattern: /^(?=.*\d)(?=.*[a-zA-Z]).{7,}$/,
          },
          {
            validator: (rule, value, callback) => {
              return value === this.formData.password;
            },
            message: "两次密码不一致",
            trigger: ["change", "blur"],
          },
        ],
      },
    };
  },
  onLoad(options) {
    const { userInfo, codeValue } = options;
    this.userInfo = {
      ...this.userInfo,
      ...JSON.parse(userInfo),
    };
    this.codeValue = codeValue;
  },
  onBackPress() {
    return true;
  },
  methods: {
    updateEye(key) {
      this[key] = !this[key];
    },
    doNext() {
      this.$refs.loginForm.validate().then((valid) => {
        if (valid) {
          this.doRegister();
        }
      });
    },
    async doRegister() {
      this.loading = true;
      let platform;
      // #ifdef H5
      platform = 5
      // #endif
      // #ifdef MP-WEIXIN
      platform = 6
      // #endif
      // #ifdef APP-PLUS
      platform = uni.$u.os() === "ios" ? 1 : 2
      // #endif
      const options = {
        verifyCode: this.codeValue,
        platform,
        autoLogin: true,
        user: {
          ...this.userInfo,
          areaCode: `+${this.userInfo.areaCode}`,
          password: md5(this.userInfo.password),
        },
      };
      try {
        const data = await businessRegister(options);
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
        this.saveLoginInfo();
        this.$store.commit("user/SET_AUTH_DATA", data);
        this.$store.dispatch("user/getSelfInfo");
        this.$store.dispatch("conversation/getConversationList");
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
      } catch (err) {
        console.log(err);
        uni.$u.toast(checkLoginError(err));
        // uni.$u.toast('注册失败')
      }
      this.loading = false;
    },
    saveLoginInfo() {
      uni.setStorage({
        key: "lastPhoneNumber",
        data: this.userInfo.phoneNumber,
      });
      uni.setStorage({
        key: "lastAreaCode",
        data: this.userInfo.areaCode,
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
  },
};
</script>
<style lang="scss" scoped>
.set_info_container {
  margin-top: var(--status-bar-height);
  background: linear-gradient(
    180deg,
    rgba(0, 137, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  padding-top: 150rpx;

  .title {
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 116rpx;
    padding-bottom: 8rpx;
    color: $u-primary;
  }

  .feild_desc {
    font-size: 24rpx;
    color: $u-tips-color;
    margin-top: 4rpx;
  }

  .btn {
    margin-top: 200rpx;
  }
}
</style>
