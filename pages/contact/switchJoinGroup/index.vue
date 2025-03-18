<template>
  <view class="switch_join_container">
    <custom-nav-bar title="加入群聊" />

    <view class="action_row">
      <action-item
        @click="actionClick(item)"
        v-for="item in joinGroupMenus"
        :action="item"
        :key="item.idx"
      >
        <view
          class="custom_icon"
          :class="{ custom_icon_id: item.idx === 1 }"
          slot="icon"
        >
          <image :src="item.icon" mode=""> </image>
        </view>
      </action-item>
    </view>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import ActionItem from "../contactAdd/ActionItem.vue";
export default {
  components: {
    CustomNavBar,
    ActionItem,
  },
  data() {
    return {
      joinGroupMenus: [
        {
          idx: 1,
          title: "群ID号加入",
          desc: "向管理员或团队成员询问ID",
          icon: require("static/images/switch_join_id.png"),
        },
      ],
    };
  },
  methods: {
    actionClick({ idx }) {
      if (idx) {
        uni.navigateTo({
          url: "/pages/common/searchUserOrGroup/index?isSearchGroup=true",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.switch_join_container {
  height: 100vh;
  background-color: #f8f8f8;

  .desc_title {
    font-size: 24rpx;
    color: #999;
    padding: 24rpx 44rpx;
  }

  .action_row {
    background-color: #fff;

    .custom_icon {
      @include centerBox();
      width: 44px;
      min-width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: #5496eb;

      image {
        width: 20px;
        height: 20px;
      }

      &_id {
        background-color: #ffc563;
      }
    }

    /deep/ .action_item {
      align-items: start;
    }

    .action_item:last-child {
      .bottom_line {
        height: 0;
      }
    }
  }
}
</style>
