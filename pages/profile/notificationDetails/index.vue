<template>
  <view class="page_container">
    <custom-nav-bar title="消息通知设置" />

    <view class="info_wrap">
      <setting-item
        :loading="loadingState.beep"
        @switch="changeBeep"
        :switchValue="selfInfo.allowBeep === 1"
        title="声音"
        :is_switch="true"
      />
      <setting-item
        :loading="loadingState.vibration"
        @switch="changeVibration"
        :switchValue="selfInfo.allowVibration === 1"
        title="震动"
        :is_switch="true"
      />
    </view>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import { businessInfoUpdate } from "@/api/login";
export default {
  components: {
    CustomNavBar,
    SettingItem,
  },
  data() {
    return {
      loadingState: {
        beep: false,
        vibration: false,
      },
    };
  },
  computed: {
    selfInfo() {
      return this.$store.getters.storeSelfInfo;
    },
  },
  onLoad() {
    console.log(this.$store.getters.storeSelfInfo);
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
    async updateSelfInfo(data, key) {
      try {
        await businessInfoUpdate({
          userID: this.selfInfo.userID,
          ...data,
        });
        await this.$store.dispatch("user/updateBusinessInfo");

        uni.$u.toast("修改成功");
      } catch (e) {
        uni.$u.toast("修改失败");
      }
      this.loadingState[key] = false;
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
