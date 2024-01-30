<template>
  <view class="mark_id_container">
    <custom-nav-bar :title="getTitle">
      <view class="nav_right_action" slot="more">
        <text v-show="!loading" @click="saveOrCopy">{{ getConfirmText }}</text>
        <template v-if="loading">
          <u-loading-icon />
        </template>
      </view>
    </custom-nav-bar>

    <view class="content_row">
      <u-input :disabled="!isRemark && !isSelfNickname" v-model="content" disabledColor="transparent" maxlength="16"
        placeholder="请输入内容" clearable>
      </u-input>
    </view>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";

import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { businessInfoUpdate } from "@/api/login";
export default {
  components: {
    CustomNavBar,
  },
  props: {},
  data() {
    return {
      content: "",
      isRemark: false,
      isSelfNickname: false,
      sourceInfo: {},
      loading: false,
    };
  },
  computed: {
    getTitle() {
      if (this.isRemark) {
        return "设置备注";
      }
      if (this.isSelfNickname) {
        return "我的姓名";
      }
      return "ID号";
    },
    getConfirmText() {
      return this.isRemark || this.isSelfNickname ? "保存" : "复制";
    },
  },
  onLoad(options) {
    const { isRemark, isSelfNickname, sourceInfo } = options;
    this.sourceInfo = JSON.parse(sourceInfo);
    this.isRemark = !!isRemark;
    if (this.isRemark) {
      this.content = this.sourceInfo.remark;
    }
    this.isSelfNickname = !!isSelfNickname;
    if (this.isSelfNickname) {
      this.content = this.sourceInfo.nickname;
    }
  },
  methods: {
    async saveOrCopy() {
      if (this.isRemark) {
        this.loading = true;
        IMSDK.asyncApi(IMSDK.IMMethods.SetFriendRemark, IMSDK.uuid(), {
          toUserID: this.sourceInfo.userID,
          remark: this.content,
        })
          .then(() => {
            uni.$u.toast("设置成功");
            setTimeout(() => uni.navigateBack(), 1000);
          })
          .catch((error) => {
            console.log(error);
            uni.$u.toast("设置失败");
          })
          .finally(() => (this.loading = false));
      } else if (this.isSelfNickname) {
        this.loading = true;
        try {
          await businessInfoUpdate({
            userID: this.sourceInfo.userID,
            nickname: this.content,
          });
          await this.$store.dispatch("user/updateBusinessInfo");
          uni.$u.toast("修改成功");
          setTimeout(() => uni.navigateBack(), 1000);
        } catch (e) {
          console.log(e);
          uni.$u.toast("修改失败");
        }
        this.loading = false;
      } else {
        uni.setClipboardData({
          data: this.sourceInfo.userID,
          success: () => {
            uni.hideToast();
            this.$nextTick(() => {
              uni.$u.toast("复制成功");
            });
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.mark_id_container {
  @include colBox(false);
  height: 100vh;

  .nav_right_action {
    margin-right: 36rpx;
  }

  .content_row {
    margin-top: 96rpx;
    margin: 72rpx 44rpx 0;

    .u-input {
      background-color: #e8eaef;
    }

    .u-button {
      height: 60rpx;
    }
  }
}
</style>
