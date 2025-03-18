<template>
  <custom-nav-bar @leftClick="leftClick" :title="getTitle">
  </custom-nav-bar>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { ContactChooseTypes } from "@/constant";
export default {
  name: "",
  components: {
    CustomNavBar,
  },
  props: {
    checkVisible: {
      type: Boolean,
      default: false,
    },
    isNomal: {
      type: Boolean,
      default: false,
    },
    isTransfer: {
      type: Boolean,
      default: false,
    },
    isAt: {
      type: Boolean,
      default: false,
    },
    isSetAdmin: {
      type: Boolean,
      default: false,
    },
    isMute: {
      type: Boolean,
      default: false,
    },
    isCall: {
      type: Boolean,
      default: false,
    },
    groupID: String,
  },
  data() {
    return {
      moreMenuVisible: false,
    };
  },
  computed: {
    getTitle() {
      if (this.isCall) {
        return "邀请成员";
      }
      if (this.isAt) {
        return "选择提醒的人";
      }
      if (this.isSetAdmin) {
        return "设置管理员";
      }
      if (this.isMute) {
        return "禁言成员";
      }
      if (this.checkVisible) {
        return "移除群成员";
      }
      return "群成员";
    },
  },
  methods: {
    leftClick() {
      if (this.checkVisible) {
        this.$emit("update:checkVisible", false);
      }
    },
    rightClick() {
      this.moreMenuVisible = true;
    },
    checkMenu() {
      if (this.moreMenuVisible) {
        this.moreMenuVisible = false;
      }
    },
    inviteMember() {
      uni.navigateTo({
        url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Invite}&groupID=${this.groupID}`,
      });
    },
    removeMember() {
      this.$emit("removeMember");
    },
  },
};
</script>

<style lang="scss">
.more_container {
  position: relative;

  .more_dot {
    padding: 24rpx;
    margin-right: 20rpx;
  }

  .more_menu {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-100%, 100%);
    box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
    width: max-content;
    border-radius: 8rpx;
    background-color: #fff;

    .menu_item {
      padding: 20rpx 48rpx;
      font-size: 28rpx;
      color: $uni-text-color;

      // &:nth-child(1) {
      // 	border-bottom: 1px solid #F0F0F0;
      // }
    }
  }
}
</style>
