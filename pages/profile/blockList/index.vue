<template>
  <view class="page_container">
    <custom-nav-bar title="通讯录黑名单" />

    <u-list v-if="blockList.length > 0" class="block_list" height="1">
      <u-list-item v-for="item in blockList" :key="item.userID">
        <user-item :item="item">
          <view @click="tryRemove(item)" class="user_action" slot="action">
            移除
          </view>
        </user-item>
      </u-list-item>
    </u-list>

    <view v-else class="empty">
      <image src="@/static/images/block_empty.png"></image>
      <text class="empty_text">暂无黑名单</text>
    </view>
    <!-- <u-empty icon="/static/images/block_empty.png" v-else text="暂无黑名单" iconSize="20" /> -->

    <u-modal
      width="500rpx"
      showCancelButton
      :show="showComfirm"
      @confirm="confirm"
      @cancel="closeModal"
      content="确定将用户移除黑名单吗？"
      :asyncClose="true"
    ></u-modal>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import UserItem from "@/components/UserItem/index.vue";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
    UserItem,
  },
  data() {
    return {
      showComfirm: false,
      selectedUser: {},
    };
  },
  computed: {
    blockList() {
      return this.$store.getters.storeBlackList;
    },
  },
  methods: {
    tryRemove(item) {
      this.selectedUser = {
        ...item,
      };
      this.showComfirm = true;
    },
    confirm() {
      IMSDK.asyncApi(
        IMSDK.IMMethods.RemoveBlack,
        IMSDK.uuid(),
        this.selectedUser.userID,
      )
        .then(() => uni.$u.toast("移除成功"))
        .catch(() => uni.$u.toast("移除失败"))
        .finally(() => (this.showComfirm = false));
    },
    closeModal() {
      this.showComfirm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f8f8f8;

  .block_list {
    flex: 1;
    margin-top: 24rpx;

    .user_item {
      background-color: #fff;
    }

    .user_action {
      position: absolute;
      right: 44rpx;
      font-size: 28rpx;
      color: $uni-color-primary;
    }
  }

  .empty {
    @include centerBox();
    flex-direction: column;
    margin-top: 25vh !important;

    &_text {
      margin-top: 26rpx;
      color: #8e9ab0;
    }

    image {
      width: 237rpx;
      height: 244rpx;
    }
  }
}
</style>
