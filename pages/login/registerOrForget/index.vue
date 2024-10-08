<template>
  <view class="register_container content_with_back">
    <view class="back_icon">
      <u-icon name="arrow-left" bold size="22" @click="back" />
    </view>
    <view class="title" v-if="isRegister">新用户注册</view>
    <u-form
      labelPosition="top"
      :model="userInfo"
      :rules="rules"
      :labelStyle="{
        fontSize: '14px',
        marginTop: '20rpx',
        minWidth: '200rpx',
      }"
      ref="registerForm"
    >
      <u-form-item prop="phoneNumber" label="手机号码">
        <u-input
          v-model="userInfo.phoneNumber"
          border="surround"
          placeholder="请输入手机号码"
          clearable
        >
          <view slot="prefix" class="phoneNumber_areacode" @click="showPicker">
            <text class="areacode_content">+{{ userInfo.areaCode }}</text>
            <u-icon class="arrow_down" name="arrow-down"></u-icon>
          </view>
        </u-input>
      </u-form-item>
    </u-form>
    <view class="action_btn">
      <u-button
        @click="sendSms"
        type="primary"
        :disabled="isRegister && !checked[0]"
      >
        下一步
      </u-button>
    </view>
    <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />
  </view>
</template>

<script>
import AreaPicker from "@/components/AreaPicker";
import { businessSendSms } from "@/api/login";
import { SmsUserFor } from "@/constant";
import { checkLoginError } from "@/util/common";
export default {
  components: {
    AreaPicker,
  },
  data() {
    return {
      userInfo: {
        phoneNumber: "",
        email: "",
        areaCode: "86",
        invitationCode: null,
      },
      checked: [true],
      rules: {
        phoneNumber: [
          {
            type: "string",
            required: true,
            message: "请输入手机号码",
            trigger: ["blur", "change"],
            pattern: /^\d{11}$/,
          },
        ],
      },
      isRegister: true,
      pageStatus: "normal",
    };
  },
  onLoad(param) {
    this.isRegister = JSON.parse(param.isRegister);
  },
  methods: {
    sendSms() {
      this.$refs.registerForm.validate().then((valid) => {
        const options = {
          phoneNumber: this.userInfo.phoneNumber,
          areaCode: `+${this.userInfo.areaCode}`,
          usedFor: this.isRegister ? SmsUserFor.Register : SmsUserFor.Reset,
          invitationCode: this.userInfo.invitationCode,
        };
        businessSendSms(options)
          .then(() => {
            uni.$u.toast("验证码已发送！");
            setTimeout(
              () =>
                uni.$u.route("/pages/login/verifyCode/index", {
                  userInfo: JSON.stringify(this.userInfo),
                  isRegister: this.isRegister,
                }),
              1000,
            );
          })
          .catch((err) => {
            console.error(err);
            uni.$u.toast(checkLoginError(err));
          });
      });
    },
    back() {
      uni.$u.route("/pages/login/index");
    },
    showPicker() {
      this.$refs.AreaPicker.init();
    },
    chooseArea(areaCode) {
      this.userInfo.areaCode = areaCode;
    },
  },
};
</script>
<style lang="scss" scoped>
.register_container {
  margin-top: var(--status-bar-height);
  background: linear-gradient(
    180deg,
    rgba(0, 137, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );

  .title {
    font-size: 44rpx;
    font-weight: 600;
    color: $u-primary;
  }

  .action_btn {
    padding-top: 20vh;
  }
}
</style>
