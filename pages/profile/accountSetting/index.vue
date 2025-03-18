<template>
  <view class="page_container">
    <custom-nav-bar title="账号设置" />

    <view class="info_wrap">
      <setting-item @click="toBlockList" title="通讯录黑名单" :border="false" />
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
     
    };
  },
  methods: {
    toBlockList() {
      uni.navigateTo({
        url: "/pages/profile/blockList/index",
      });
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
