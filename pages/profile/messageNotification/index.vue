<template>
  <view class="page_container">
    <custom-nav-bar title="消息通知" />

    <view class="info_wrap">
      <setting-item
        @switch="changeNotify"
        :loading="loadingState.message"
        :switchValue="newMessageNotify"
        title="新消息通知"
        :is_switch="true"
      />
      <setting-item
        v-show="newMessageNotify"
        @click="toNotificationDetails"
        title="消息通知设置"
      />
    </view>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
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
        message: false,
      },
    };
  },
  onLoad() {
    const disableNotify =
      uni.getStorageSync(
        `${this.$store.getters.storeCurrentUserID}_DisableNotify`,
      ) ?? false;
    this.newMessageNotify = !disableNotify;
  },
  methods: {
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
    margin-top: 24rpx;
  }
}
</style>
