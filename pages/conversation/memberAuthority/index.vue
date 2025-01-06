<template>
  <view class="page_container">
    <custom-nav-bar title="群成员权限" />

    <view class="setting_row">
      <setting-item
        title="不允许查看群成员资料"
        :loading="switchLoading.look"
        @switch="changeLook"
        :switchValue="!canLookOther"
        :is_switch="true"
      />
      <setting-item
        title="不允许添加群成员为好友"
        :loading="switchLoading.add"
        @switch="changeAdd"
        :switchValue="!canAddOther"
        :is_switch="true"
      />
    </view>
  </view>
</template>

<script>
import IMSDK, { AllowType } from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
export default {
  components: {
    CustomNavBar,
    SettingItem,
  },
  data() {
    return {
      switchLoading: {
        look: false,
        add: false,
      },
    };
  },
  computed: {
    canLookOther() {
      return (
        this.$store.getters.storeCurrentGroup.lookMemberInfo ===
        AllowType.Allowed
      );
    },
    canAddOther() {
      return (
        this.$store.getters.storeCurrentGroup.applyMemberFriend ===
        AllowType.Allowed
      );
    },
  },
  methods: {
    changeLook(flag) {
      this.switchLoading.look = true;
      IMSDK.asyncApi(IMSDK.IMMethods.SetGroupLookMemberInfo, IMSDK.uuid(), {
        groupID: this.$store.getters.storeCurrentGroup.groupID,
        rule: flag ? AllowType.NotAllowed : AllowType.Allowed,
      })
        .catch(() => uni.$u.toast("设置失败"))
        .finally(() => (this.switchLoading.look = false));
    },
    changeAdd(flag) {
      this.switchLoading.add = true;
      IMSDK.asyncApi(IMSDK.IMMethods.SetGroupApplyMemberFriend, IMSDK.uuid(), {
        groupID: this.$store.getters.storeCurrentGroup.groupID,
        rule: flag ? AllowType.NotAllowed : AllowType.Allowed,
      })
        .catch(() => uni.$u.toast("设置失败"))
        .finally(() => (this.switchLoading.add = false));
    },
  },
};
</script>

<style lang="scss">
.page_container {
  background-color: #f8f8f8;

  .setting_row {
    background-color: #fff;
    margin: 24rpx 0;
  }
}
</style>
