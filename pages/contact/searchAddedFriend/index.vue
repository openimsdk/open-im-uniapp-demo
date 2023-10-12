<template>
  <view class="page_container">
    <custom-nav-bar title="搜索好友" />
    <view class="search_bar_wrap">
      <u-search
        shape="square"
        placeholder="搜索好友"
        v-model="keyword"
        :showAction="false"
        @search="searchFriend"
      />
    </view>

    <view v-show="searchResults.length > 0" class="search_title">
      我的好友
    </view>
    <u-list v-show="searchResults.length > 0" class="user_list" height="1">
      <u-list-item v-for="user in searchResults" :key="user.userID">
        <user-item :item="user" @itemClick="itemClick" />
      </u-list-item>
    </u-list>

    <u-empty v-show="searchResults.length === 0" mode="search" />
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserItem from "@/components/UserItem/index.vue";
export default {
  components: {
    CustomNavBar,
    UserItem,
  },
  data() {
    return {
      keyword: "",
      searchResults: [],
    };
  },
  methods: {
    searchFriend() {
      const options = {
        keywordList: [this.keyword],
        isSearchUserID: false,
        isSearchNickname: true,
        isSearchRemark: true,
      };
      IMSDK.asyncApi(IMSDK.IMMethods.SearchFriends, IMSDK.uuid(), options).then(
        ({ data }) => {
          this.searchResults = data;
        },
      );
    },
    itemClick(user) {
      uni.$u.route("/pages/common/userCard/index", {
        sourceID: user.userID,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f8f8f8;

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
    background-color: #fff;
  }

  .search_title {
    padding-top: 8px;
    padding-left: 22px;
    color: #999;
    background-color: #fff;
  }

  .user_list {
    flex: 1;
    background-color: #fff;
  }

  .u-empty {
    padding-top: 20vh;
  }
}
</style>
