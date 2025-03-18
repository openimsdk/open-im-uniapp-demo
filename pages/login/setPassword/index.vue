<template>
  <view class="set_password_container content_with_back">
    <view class="title">重置密码</view>
    <u-form
      class="loginForm commonPage-form"
      labelPosition="top"
      :model="formData"
      :rules="rules"
      :labelStyle="{
        fontSize: '14px',
        marginTop: '20rpx',
        minWidth: '200rpx',
      }"
      ref="loginForm"
    >
      <u-form-item label="密码" prop="password">
        <u-input
          v-model="formData.password"
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
          v-model="formData.confirmPassword"
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
    <view class="action_btn">
      <u-button type="primary" @click="doNext">
        确认修改
      </u-button>
    </view>
  </view>
</template>

<script>
import { businessReset } from "@/api/login";
export default {
  data() {
    return {
      isRegister: false,
      codeValue: "",
      userInfo: {
        phoneNumber: "",
        areaCode: "",
      },
      formData: {
        password: "",
        confirmPassword: "",
      },
      passwordEying: false,
      comfirmEying: false,
      rules: {
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
    const { userInfo, isRegister, codeValue } = options;
    this.userInfo = JSON.parse(userInfo);
    this.isRegister = JSON.parse(isRegister);
    this.codeValue = codeValue;
  },
  onBackPress() {
    return true;
  },
  methods: {
    doNext() {
      this.$refs.loginForm.validate().then((valid) => {
        if (valid) {
          const options = {
            phoneNumber: this.userInfo.phoneNumber,
            areaCode: `+${this.userInfo.areaCode}`,
            VerifyCode: this.codeValue,
            password: this.formData.password,
            platform: uni.$u.os() === "ios" ? 1 : 2,
            operationID: Date.now() + "",
          };
          businessReset(options)
            .then(() => {
              uni.$u.toast("密码重置成功，请前往登录！");
              setTimeout(() => uni.$u.route("/pages/login/index"), 1000);
            })
            .catch((err) => {
              console.log('err', err)
              uni.$u.toast("密码重置失败")
            });
        }
      });
    },
    updateEye(key) {
      this[key] = !this[key];
    },
  },
};
</script>
<style lang="scss" scoped>
.set_password_container {
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

  .action_btn {
    margin-top: 12vh;
  }
}
</style>
