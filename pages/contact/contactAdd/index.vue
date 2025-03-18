<template>
  <view class="contact_add_container">
    <custom-nav-bar title="添加" />

    <view class="action_row">
      <action-item
        @click="friendAction(item)"
        v-for="item in friendActionMenus"
        :action="item"
        :key="item.idx"
      />
      <action-item
        @click="groupAction(item)"
        v-for="item in groupActionMenus"
        :action="item"
        :key="item.idx"
      />
    </view>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import ActionItem from "./ActionItem.vue";
export default {
  components: {
    CustomNavBar,
    ActionItem,
  },
  data() {
    return {
      groupActionMenus: [
        {
          idx: 0,
          title: "创建群聊",
          desc: "创建群聊，全面使用OpenIM",
          icon: require("static/images/contact_add_create_group.png"),
        },
        {
          idx: 1,
          title: "添加群聊",
          desc: "向管理员或团队成员询问ID",
          icon: require("static/images/contact_add_join_group.png"),
        },
      ],
      friendActionMenus: [
        {
          idx: 0,
          title: "添加好友",
          desc: "通过手机号/ID号/搜索添加",
          icon: require("static/images/contact_add_search_user.png"),
        },
      ],
    };
  },
  methods: {
    groupAction({ idx }) {
      if (idx === 0) {
        uni.navigateTo({
          url: `/pages/common/createGroup/index`,
        });
      } else {
        uni.navigateTo({
          url: "/pages/contact/switchJoinGroup/index",
        });
      }
    },
    friendAction({ idx }) {
      if (!idx) {
        uni.navigateTo({
          url: "/pages/common/searchUserOrGroup/index?isSearchGroup=false",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.contact_add_container {
  height: 100vh;
  background-color: #f8f8f8;

  .desc_title {
    font-size: 24rpx;
    color: #999;
    padding: 24rpx 44rpx;
  }

  .action_row {
    margin-top: 24rpx;
    background-color: #fff;

    .action_item:last-child {
      .bottom_line {
        height: 0;
      }
    }
  }
}
</style>
