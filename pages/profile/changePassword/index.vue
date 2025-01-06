<template>
  <view class="page_container">
    <custom-nav-bar title="修改密码">
      <view class="nav_right_action" slot="more">
        <text @click="comfirmReset">确定</text>
      </view>
    </custom-nav-bar>
    <view class="info_wrap">
      <view class="row">
        <text>旧密码：</text>
        <u--input border="none" v-model="oldPassword" clearable></u--input>
      </view>

      <view class="row">
        <text>新密码：</text>
        <u--input border="none" v-model="newPassword" clearable></u--input>
      </view>

      <view class="row">
        <text>确认新密码：</text>
        <u--input border="none" v-model="confirmPassword" clearable></u--input>
      </view>
    </view>
  </view>
</template>

<script>
const pwdReg = /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,20}$/
import md5 from "md5";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { businessModify } from "@/api/login";
import { mapGetters } from "vuex";
export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  },
  computed: {
    ...mapGetters(["storeCurrentUserID"]),
  },
  onLoad() {
  },
  methods: {
    comfirmReset() {
      if (this.oldPassword.length < 0) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      console.log(this.newPassword)
      if (!pwdReg.test(this.newPassword)) {
        uni.showToast({ title: '新密码6～20位，至少包含数字、字母', icon: 'none' })
        return
      }
      if (this.newPassword !== this.confirmPassword) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }
      const options = {
        userID: this.storeCurrentUserID,
        currentPassword: md5(this.oldPassword),
        newPassword: md5(this.newPassword)
      }
      businessModify(options)
        .then(() => {
          uni.$u.toast("密码修改成功！");
          setTimeout(() => uni.navigateBack(), 500)
        })
        .catch((err) => {
          console.log(err)
          uni.$u.toast("密码重置失败")
        });
    }
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  height: 100vh;
  background-color: #f8f8f8;

  .nav_right_action {
    margin-right: 36rpx;
  }

  .info_wrap {
    background-color: #fff;
    margin: 24rpx 24rpx 0 24rpx;
    border-radius: 6px;

    .row {
      height: 120rpx;
      margin: 0 12px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #E8EAEF;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
