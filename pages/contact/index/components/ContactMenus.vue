<template>
  <view class="">
    <view class="menu_list">
      <view
        @click="menuClick(item)"
        v-for="item in getMenus"
        :key="item.idx"
        class="menu_list_item"
      >
        <image class="menu_icon" :src="item.icon" mode=""></image>
        <view class="item_content">
          <text class="title">
            {{ item.title }}
          </text>
          <view class="icon">
            <u-icon name="arrow-right" color="#999" size="18" />
          </view>
        </view>
      </view>
    </view>
    <view class="menu_list">
      <view
        @click="menuClick(item)"
        v-for="item in getFriendsMenus"
        :key="item.idx"
        class="menu_list_item"
      >
        <image class="menu_icon" :src="item.icon" mode=""></image>
        <view class="item_content">
          <text class="title">
            {{ item.title }}
          </text>
          <view class="icon">
            <u-icon name="arrow-right" color="#999" size="18" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { ContactMenuTypes } from "@/constant";

export default {
  name: "",
  props: {},
  data() {
    return {};
  },
  computed: {
    getMenus() {
      return [
        {
          idx: 0,
          type: ContactMenuTypes.NewFriend,
          title: "新的好友",
          icon: require("static/images/contact_new_friend.png"),
        },
        {
          idx: 1,
          type: ContactMenuTypes.NewGroup,
          title: "新的群组",
          icon: require("static/images/contact_new_group.png"),
        },
      ];
    },
    getFriendsMenus() {
      return [
        {
          idx: 2,
          type: ContactMenuTypes.MyFriend,
          title: "我的好友",
          icon: require("static/images/contact_my_friend.png"),
          badge: 0,
        },
        {
          idx: 3,
          type: ContactMenuTypes.MyGroup,
          title: "我的群组",
          icon: require("static/images/contact_my_group.png"),
          badge: 0,
        },
      ];
    },
  },
  methods: {
    menuClick({ type }) {
      switch (type) {
        case ContactMenuTypes.NewFriend:
        case ContactMenuTypes.NewGroup:
          uni.navigateTo({
            url: `/pages/contact/applicationList/index?applicationType=${type}`,
          });
          break;
        case ContactMenuTypes.MyFriend:
          uni.navigateTo({
            url: "/pages/contact/friendList/index",
          });
          break;
        case ContactMenuTypes.MyGroup:
          uni.navigateTo({
            url: "/pages/contact/groupList/index",
          });
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.menu_list {
  margin-bottom: 24rpx;
  background-color: #fff;

  &_item {
    @include vCenterBox();
    margin: 0 44rpx;
    padding: 24rpx 0;
    color: #0c1c33;

    .menu_icon {
      width: 42px;
      min-width: 42px;
      height: 42px;
      min-height: 42px;
    }

    .item_content {
      @include btwBox();
      margin-left: 24rpx;
      width: 100%;
      position: relative;

      .icon {
        display: flex;

        .u-badge {
          width: fit-content;
          padding: 8rpx 12rpx;
          line-height: 18rpx;
        }
      }
    }
  }
}
</style>
