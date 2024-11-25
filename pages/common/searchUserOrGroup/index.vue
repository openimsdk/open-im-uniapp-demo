<template>
  <view class="search_container">
    <custom-nav-bar :route="false">
      <view slot="left"> </view>
      <view class="search_bar" slot="center">
        <u-search
          actionText="取消"
          @change="keywordChange"
          @custom="cancel"
          @search="startSearch"
          shape="square"
          :placeholder="getPlaceholder"
          v-model="keyword"
        />
      </view>
    </custom-nav-bar>

    <view v-show="!empty && !searching" @click="startSearch" class="result_row">
      <image class="icon" :src="getIcon" alt="" />
      <view class="">
        <text>查找：</text>
        <text>{{ keyword }}</text>
      </view>
    </view>

    <view v-show="searching && !empty" class="result_row result_row_empty">
      <u-loading-icon></u-loading-icon>
    </view>

    <view v-show="empty" class="result_row result_row_empty">
      <text>未搜索到相关结果</text>
    </view>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";

import searchGroup from "static/images/contact_add_join_group_fill.png";
import searchUser from "static/images/contact_add_search_user_fill.png";
import { businessSearchUserInfo } from "@/api/login";
import { filterEmptyValue } from "@/util/common";

export default {
  components: {
    CustomNavBar,
  },
  data() {
    return {
      keyword: "",
      searching: false,
      empty: false,
      isSearchGroup: false,
    };
  },
  computed: {
    getIcon() {
      return this.isSearchGroup ? searchGroup : searchUser;
    },
    getPlaceholder() {
      return this.isSearchGroup ? "请输入群聊ID" : "搜索ID或手机号添加好友";
    },
  },
  onLoad(options) {
    const { isSearchGroup } = options;
    this.isSearchGroup = JSON.parse(isSearchGroup);
  },
  methods: {
    cancel() {
      console.log("cancel");
      uni.navigateBack();
    },
    keywordChange() {
      if (this.empty) {
        this.empty = !this.empty;
      }
    },
    async startSearch() {
      if (!this.keyword) return;
      this.searching = true;
      try {
        if (this.isSearchGroup) {
          let info = this.$store.getters.storeGroupList.find(
            (item) => item.groupID === this.keyword,
          );
          if (!info) {
            const { data } = await IMSDK.asyncApi(
              IMSDK.IMMethods.GetSpecifiedGroupsInfo,
              IMSDK.uuid(),
              [this.keyword],
            );
            info = data[0];
          }
          if (info) {
            uni.navigateTo({
              url: `/pages/common/groupCard/index?sourceInfo=${JSON.stringify(
                info,
              )}`,
            });
          } else {
            this.empty = true;
          }
        } else {
          let info = this.$store.getters.storeFriendList.find(
            (item) => item.userID === this.keyword,
          );
          if (!info) {
            const { total, users } = await businessSearchUserInfo(this.keyword);
            if (total > 0) {
              const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetUsersInfo,
                IMSDK.uuid(),
                [users[0].userID],
              );
              const imData = data[0];

              info = {
                ...imData,
                ...users[0],
              };
            }
          }
          if (info) {
            uni.navigateTo({
              url: `/pages/common/userCard/index?sourceInfo=${JSON.stringify(
                info,
              )}`,
            });
          } else {
            this.empty = true;
          }
        }
      } catch (e) {
        //TODO handle the exception
      }
      this.searching = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.search_container {
  height: 100vh;
  background-color: #f8f8f8;

  .search_bar {
    width: 100%;
    padding: 0 44rpx;
  }

  .result_row {
    @include vCenterBox();
    padding: 24rpx 44rpx;
    font-size: 28rpx;
    color: $uni-text-color;
    background-color: #fff;

    .icon {
      width: 20px;
      height: 20px;
      margin-right: 24rpx;
    }

    &_empty {
      display: flex;
      justify-content: center;
      color: #999;
    }
  }
}
</style>
