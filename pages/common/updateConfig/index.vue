<template>
  <view class="page_container">
    <custom-nav-bar title="App配置" />
    <u-tabs
      :scrollable="false"
      :current="current"
      :list="list1"
      @click="changeTab"
    ></u-tabs>
    <view class="box" :class="{ box_https: current === 1 }">
      <config-form v-show="current !== 1" @confirmData="onConfirmData" />
      <config-form
        v-show="current === 1"
        use-https
        @confirmData="onConfirmData"
      />
    </view>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import config from "../../../common/config";
import ConfigForm from "./ConfigForm.vue";
export default {
  components: {
    CustomNavBar,
    ConfigForm,
  },
  data() {
    return {
      list1: [
        {
          name: "Http+IP",
        },
        {
          name: "Https+域名",
        },
      ],
      current: 0,
    };
  },
  computed: {},
  onLoad() {},
  beforeMount() {
    this.current = config.getApiUrl().includes("https://") ? 1 : 0;
  },
  methods: {
    changeTab({ index }) {
      this.current = index;
    },
    onConfirmData({ apiUrl, wsUrl, configUrl, registeUrl }) {
      uni.setStorageSync("IMApiUrl", apiUrl);
      uni.setStorageSync("IMWsUrl", wsUrl);
      uni.setStorageSync("IMRegisteUrl", registeUrl);
      uni.setStorageSync("IMConfigUrl", configUrl);
      plus.runtime.quit();
    },
  },
};
</script>

<style lang="scss">
.box {
  flex: 1;
  padding: 24rpx 44rpx;
  overflow-y: auto;

  .config_title {
    padding: 36rpx 0 16rpx;
  }

  .suffix_row {
    display: flex;

    text {
      margin-right: 4px;
    }
  }

  .confirm_btn {
    margin-top: 64rpx;
  }

  /deep/.u-input__content__subfix-icon {
    width: 60px;
  }

  &_https {
    /deep/.u-input__content__subfix-icon {
      width: 130px;
    }
  }
}
</style>
