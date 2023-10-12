<template>
  <view class="page_container">
    <custom-nav-bar title="关于我们" />
    <view class="logo_area">
      <image src="@/static/images/about_logo.png" mode=""></image>
      <view>{{ version }}</view>

      <info-item
        v-if="$u.os() === 'android'"
        class="check"
        title="检查新版本"
        content=""
      />
    </view>
  </view>
</template>

<script>
import { version } from '@/common/config'
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { PageEvents } from "@/constant";
import InfoItem from "../selfInfo/InfoItem.vue";
export default {
  components: {
    CustomNavBar,
    InfoItem,
  },
  data() {
    return {
      appVersion: "",
      version: "",
      loading: false,
    };
  },
  onLoad() {
    this.version = version
    this.getAppVersion();
    uni.$on(PageEvents.CheckForUpdateResp, this.checkRespHandler);
  },
  onUnload() {
    uni.$off(PageEvents.CheckForUpdateResp, this.checkRespHandler);
  },
  methods: {
    getAppVersion() {
      plus.runtime.getProperty(
        plus.runtime.appid,
        ({ version }) => (this.appVersion = version),
      );
    },
    updateCheck() {
      this.loading = true;
      uni.$emit(PageEvents.CheckForUpdate, true);
    },
    checkRespHandler() {
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.page_container {
  background-color: #f8f8f8;

  .logo_area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 24rpx 24rpx 0 24rpx;
    background: #fff;
    border-radius: 6px;
    padding: 48rpx 0 16rpx 0;
    color: $uni-text-color;

    image {
      width: 72px;
      height: 72px;
      margin-bottom: 24rpx;
    }
  }

  .check {
    margin-top: 26rpx;
    border-top: 1px #e8eaef solid;
    padding: 20rpx;
    width: 90%;
  }

  .btn_row {
    padding: 0 44rpx;
  }
}
</style>
