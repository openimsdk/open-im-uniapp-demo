<template>
  <view class="search_group_container">
    <custom-nav-bar title="搜索群组" />
    <view class="search_bar_wrap">
      <u-search
        class="search_bar"
        shape="square"
        placeholder="搜索群组"
        :showAction="false"
        v-model="keyword"
      />
    </view>

    <view class="search_results">
      <u-empty mode="search" />
    </view>
  </view>
</template>

<script>
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
    };
  },
  mounted() {},
  methods: {
    userClick() {},
  },
};
</script>

<style lang="scss" scoped>
.search_group_container {
  @include colBox(false);
  height: 100vh;

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .search_results {
    flex: 1;
    .group_list {
      height: 100% !important;
    }
  }
}
</style>
