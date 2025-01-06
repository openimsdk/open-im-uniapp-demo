<template>
  <view class="page_container">
    <custom-nav-bar title="账号设置" />

    <view class="info_wrap">
      <setting-item
        :loading="loading"
        @switch="switchGlobalOpt"
        title="勿扰模式"
        :switchValue="globalOptEnable"
        :is_switch="true"
        :border="false"
      />
      <setting-item
        :loading="loadingState.beep"
        @switch="changeBeep"
        :switchValue="selfInfo.allowBeep === 1"
        title="新消息提示音"
        :is_switch="true"
        :border="false"
      />
      <setting-item
        :loading="loadingState.vibration"
        @switch="changeVibration"
        :switchValue="selfInfo.allowVibration === 1"
        title="新消息震动"
        :is_switch="true"
        :border="false"
      />
    </view>

    <view class="info_wrap">
      <!-- <setting-item @switch="changeNotify" :loading="loadingState.message" :switchValue="newMessageNotify" title="新消息通知"
				:is_switch="true" :border="false" />
			<setting-item v-show="newMessageNotify" @click="toNotificationDetails" title="消息通知设置" :border="false" /> -->
      <setting-item
        :loading="loadingState.allowAddFriend"
        @switch="changeVibrationF"
        :switchValue="selfInfo.allowAddFriend === 1"
        title="禁止添加我为好友"
        :is_switch="true"
        :border="false"
      />
      <setting-item @click="toBlockList" title="通讯录黑名单" :border="false" />
    </view>

    <view class="info_wrap">
      <setting-item @click="toResetPwd" title="修改密码" :border="false" />
      <setting-item @click="deleteAllMsg" danger title="清空聊天记录" :border="false" />
    </view>
  </view>
</template>

<script>
import IMSDK, { MessageReceiveOptType } from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import { businessInfoUpdate } from "@/api/login";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
    SettingItem,
  },
  data() {
    return {
      newMessageNotify: true,
      loadingState: {
        beep: false,
        vibration: false,
        message: false,
        allowAddFriend: false
      },
      loading: false,
    };
  },
  computed: {
    selfInfo() {
      return this.$store.getters.storeSelfInfo;
    },
    globalOptEnable() {
      return (
        this.$store.getters.storeSelfInfo.globalRecvMsgOpt !==
        MessageReceiveOptType.Nomal
      );
    },
  },
  onLoad() {
    const disableNotify =
      uni.getStorageSync(
        `${this.$store.getters.storeCurrentUserID}_DisableNotify`,
      ) ?? false;
    this.newMessageNotify = !disableNotify;
  },
  methods: {
    changeBeep(flag) {
      this.loadingState.beep = true;
      this.updateSelfInfo(
        {
          allowBeep: flag ? 1 : 2,
        },
        "beep",
      );
    },
    changeVibration(flag) {
      this.loadingState.vibration = true;
      this.updateSelfInfo(
        {
          allowVibration: flag ? 1 : 2,
        },
        "vibration",
      );
    },
    changeVibrationF(flag) {
      this.loadingState.addFriend = true;
      this.updateSelfInfo(
        {
          allowAddFriend: flag ? 1 : 2,
        },
        "allowAddFriend",
      );
    },
    async updateSelfInfo(data, key) {
      try {
        await businessInfoUpdate({
          userID: this.selfInfo.userID,
          ...data,
        });
        await this.$store.dispatch("user/updateBusinessInfo");

        uni.$u.toast("修改成功");
      } catch (e) {
        console.log("updateSelfInfo", e);
        uni.$u.toast("修改失败");
      }
      this.loadingState[key] = false;
      this.loading = false
    },
    toBlockList() {
      uni.navigateTo({
        url: "/pages/profile/blockList/index",
      });
    },
    toResetPwd() {
      uni.navigateTo({
        url: "/pages/profile/changePassword/index",
      });
    },
    deleteAllMsg() {
      uni.showModal({
        title: "提示",
        content: "确定要删除所有本地消息吗？",
        confirmText: "确认",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中',
              mask: true
            })
            IMSDK.asyncApi(IMSDK.IMMethods.DeleteAllMsgFromLocal, IMSDK.uuid())
              .then(() => {
                uni.showToast({title:'删除成功',icon:'none'})
              })
              .catch(() => {
                uni.showToast({title:'删除失败',icon:'none'})
              })
              .finally(()=>{
                uni.hideLoading()
              })
          }
        },
      });
    },
    async switchGlobalOpt(flag) {
      this.loading = true;
      this.updateSelfInfo(
        {
          globalRecvMsgOpt: flag ? 2 : 0,
        },
        "globalRecvMsgOpt",
      );
    },
    toNotificationDetails() {
      uni.navigateTo({
        url: "/pages/profile/notificationDetails/index",
      });
    },
    changeNotify(value) {
      this.loadingState.message = true;
      uni.setStorageSync(
        `${this.$store.getters.storeCurrentUserID}_DisableNotify`,
        !value,
      );
      this.newMessageNotify = value;
      this.loadingState.message = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f8f8;

  .info_wrap {
    background-color: #fff;
    margin: 24rpx 24rpx 0 24rpx;
    border-radius: 6px;

    .qr_icon {
      width: 22px;
      height: 23px;
    }
  }
}
</style>
