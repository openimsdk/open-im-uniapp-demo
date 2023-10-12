<template>
  <view>
    <view class="config_title" style="padding-top: 0">IM服务端地址</view>
    <u-input
      v-model="baseUrl"
      :placeholder="useHttps ? httpsBaseUrl : httpBaseUrl"
      border="bottom"
      @change="onBaseUrlChange"
    />
    <view class="config_title">IM Ws地址</view>
    <u-input
      v-model="baseWs"
      :placeholder="useHttps ? httpsBaseUrl : httpBaseUrl"
      border="bottom"
    >
      <u--text
        :text="useHttps ? wssPerfix : wsPerfix"
        slot="prefix"
        margin="0 3px 0 0"
        type="tips"
      ></u--text>
      <view slot="suffix" class="suffix_row">
        <text>{{ useHttps ? httpsSuffixGap : httpSuffixGap }}</text>
        <u-input
          v-model="baseWsSuffix"
          :placeholder="useHttps ? wssSuffix : wsSuffix"
          border="none"
        />
      </view>
    </u-input>
    <view class="config_title">IM Api地址</view>
    <u-input
      v-model="baseApi"
      :placeholder="useHttps ? httpsBaseUrl : httpBaseUrl"
      border="bottom"
    >
      <u--text
        :text="useHttps ? httpsPerfix : httpPerfix"
        slot="prefix"
        margin="0 3px 0 0"
        type="tips"
      ></u--text>
      <view slot="suffix" class="suffix_row">
        <text>{{ useHttps ? httpsSuffixGap : httpSuffixGap }}</text>
        <u-input
          v-model="baseApiSuffix"
          :placeholder="useHttps ? httpsApiSuffix : httpApiSuffix"
          border="none"
        />
      </view>
    </u-input>
    <view class="config_title">IM 业务服务地址</view>
    <u-input
      v-model="baseRegiste"
      :placeholder="useHttps ? httpsBaseUrl : httpBaseUrl"
      border="bottom"
    >
      <u--text
        :text="useHttps ? httpsPerfix : httpPerfix"
        slot="prefix"
        margin="0 3px 0 0"
        type="tips"
      ></u--text>
      <view slot="suffix" class="suffix_row">
        <text>{{ useHttps ? httpsSuffixGap : httpSuffixGap }}</text>
        <u-input
          v-model="baseRegisteSuffix"
          :placeholder="useHttps ? httpsRegisterSuffix : httpRegisterSuffix"
          border="none"
        />
      </view>
    </u-input>
    <view class="config_title">IM 配置服务地址</view>
    <u-input
      v-model="baseConfig"
      :placeholder="useHttps ? httpsBaseUrl : httpBaseUrl"
      border="bottom"
    >
      <u--text
        :text="useHttps ? httpsPerfix : httpPerfix"
        slot="prefix"
        margin="0 3px 0 0"
        type="tips"
      ></u--text>
      <view slot="suffix" class="suffix_row">
        <text>{{ useHttps ? httpsSuffixGap : httpSuffixGap }}</text>
        <u-input
          v-model="baseConfigSuffix"
          :placeholder="useHttps ? httpsConfigSuffix : httpConfigSuffix"
          border="none"
        />
      </view>
    </u-input>

    <u-button
      class="confirm_btn"
      type="primary"
      text="保存重启后生效"
      :loading="loading"
      @click="confirmData"
    ></u-button>
  </view>
</template>

<script>
import config from "../../../common/config";
export default {
  components: {},
  props: {
    useHttps: Boolean,
  },
  data() {
    return {
      httpPerfix: "http://",
      httpsPerfix: "https://",
      wsPerfix: "ws://",
      wssPerfix: "wss://",
      httpApiSuffix: "10002",
      httpsApiSuffix: "api",
      wsSuffix: "10001",
      wssSuffix: "msg_gateway",
      httpRegisterSuffix: "10008",
      httpsRegisterSuffix: "chat",
      httpConfigSuffix: "10009",
      httpsConfigSuffix: "complete_admin",
      httpSuffixGap: ":",
      httpsSuffixGap: "/",
      httpBaseUrl: "121.5.182.23",
      httpsBaseUrl: "web.rentsoft.cn",
      baseUrl: "",
      baseApi: "",
      baseWs: "",
      baseRegiste: "",
      baseConfig: "",
      baseApiSuffix: "",
      baseWsSuffix: "",
      baseRegisteSuffix: "",
      baseConfigSuffix: "",
      loading: false,
    };
  },
  beforeMount() {
    this.formatData();
  },
  methods: {
    onBaseUrlChange(value) {
      this.baseApi = value;
      this.baseWs = value;
      this.baseRegiste = value;
      this.baseConfig = value;
    },
    confirmData() {
      this.loading = true;
      const apiPer = this.useHttps ? this.httpsPerfix : this.httpPerfix;
      const wsPer = this.useHttps ? this.wssPerfix : this.wsPerfix;
      const suffixGap = this.useHttps
        ? this.httpsSuffixGap
        : this.httpSuffixGap;
      this.$emit("confirmData", {
        apiUrl: apiPer + this.baseApi + suffixGap + this.baseApiSuffix,
        wsUrl: wsPer + this.baseWs + suffixGap + this.baseWsSuffix,
        registeUrl:
          apiPer + this.baseRegiste + suffixGap + this.baseRegisteSuffix,
        configUrl: apiPer + this.baseConfig + suffixGap + this.baseConfigSuffix,
      });
    },
    cleanProtocol(url) {
      return url
        .replace("http://", "")
        .replace("https://", "")
        .replace("ws://", "")
        .replace("wss://", "");
    },
    formatData() {
      this.baseApiSuffix = this.useHttps
        ? this.httpsApiSuffix
        : this.httpApiSuffix;
      this.baseWsSuffix = this.useHttps ? this.wssSuffix : this.wsSuffix;
      this.baseRegisteSuffix = this.useHttps
        ? this.httpsRegisterSuffix
        : this.httpRegisterSuffix;
      this.baseConfigSuffix = this.useHttps
        ? this.httpsConfigSuffix
        : this.httpConfigSuffix;

      const storageApi = this.cleanProtocol(config.getApiUrl());
      const storageWs = this.cleanProtocol(config.getWsUrl());
      const storageRegiste = this.cleanProtocol(config.getRegisterUrl());
      const storageConfig = this.cleanProtocol(config.getConfigUrl());

      if (config.getApiUrl().includes("https://") !== this.useHttps) {
        return;
      }

      this.baseApi = storageApi.split(this.useHttps ? "/" : ":")[0];
      this.baseApiSuffix = storageApi.split(this.useHttps ? "/" : ":")[1];
      this.baseWs = storageWs.split(this.useHttps ? "/" : ":")[0];
      this.baseWsSuffix = storageWs.split(this.useHttps ? "/" : ":")[1];
      this.baseRegiste = storageRegiste.split(this.useHttps ? "/" : ":")[0];
      this.baseRegisteSuffix = storageRegiste.split(
        this.useHttps ? "/" : ":",
      )[1];
      this.baseConfig = storageConfig.split(this.useHttps ? "/" : ":")[0];
      this.baseConfigSuffix = storageConfig.split(this.useHttps ? "/" : ":")[1];
      if (
        this.baseApi === this.baseWs &&
        this.baseRegiste === this.baseConfig
      ) {
        this.baseUrl = this.baseApi;
      }
    },
  },
};
</script>

<style lang="scss">
.box {
  padding: 24rpx 44rpx;

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
