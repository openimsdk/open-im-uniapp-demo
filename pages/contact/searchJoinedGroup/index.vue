<template>
  <view class="page_container">
    <custom-nav-bar title="搜索群组" />
    <view class="search_bar_wrap">
      <u-search
        shape="square"
        placeholder="搜索群组"
        v-model="keyword"
        :showAction="false"
        @search="searchGroup"
      />
    </view>

    <view v-show="searchResults.length > 0" class="search_title">
      我的群组
    </view>
    <u-list v-show="searchResults.length > 0" class="group_list" height="1">
      <u-list-item v-for="group in searchResults" :key="group.groupID">
        <group-item :groupInfo="group" />
      </u-list-item>
    </u-list>

    <u-empty v-show="searchResults.length === 0" mode="search" />
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import GroupItem from "../groupList/GroupItem.vue";
export default {
  components: {
    CustomNavBar,
    GroupItem,
  },
  data() {
    return {
      keyword: "",
      searchResults: [],
    };
  },
  methods: {
    searchGroup() {
      const options = {
        keywordList: [this.keyword],
        isSearchGroupID: true,
        isSearchGroupName: true,
      };
      IMSDK.asyncApi(IMSDK.IMMethods.SearchGroups, IMSDK.uuid(), options).then(
        ({ data }) => {
          this.searchResults = data;
        },
      );
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

  .group_list {
    flex: 1;
    background-color: #fff;
  }

  .u-empty {
    padding-top: 20vh;
  }
}
</style>
