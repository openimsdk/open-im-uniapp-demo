<template>
  <view class="group_settings_container">
    <custom-nav-bar title="群管理" />
    <view class="setting_row">
      <setting-item
        v-if="isOwner"
        @click="toTransfer"
        title="群主管理权转让"
        :border="false"
      />
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { GroupMemberListTypes } from "@/constant";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import ActionSheet from "./components/ActionSheet.vue";
export default {
  components: {
    CustomNavBar,
    SettingItem,
    ActionSheet,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeCurrentMemberInGroup",
      "storeCurrentGroup",
    ]),
    isOwner() {
      return this.storeCurrentMemberInGroup.roleLevel === 100;
    },
  },
  methods: {
    toTransfer() {
      uni.navigateTo({
        url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Transfer}&groupID=${this.storeCurrentGroup.groupID}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.group_settings_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .setting_row {
    background-color: #fff;
    margin: 24rpx 24rpx 0;
    border-radius: 6px;
    overflow: hidden;
  }
}
</style>
