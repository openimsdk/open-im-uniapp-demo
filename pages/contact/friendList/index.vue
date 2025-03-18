<template>
  <view class="friend_list_container">
    <custom-nav-bar title="我的好友" />
    <view class="search_bar_wrap">
      <u-search
        class="search_bar"
        shape="square"
        placeholder="搜索"
        :showAction="false"
        disabled
      />
    </view>

    <choose-index-list
      v-if="getIndexData.dataList.length > 0"
      @itemClick="userClick"
      :height="`${listHeight}px`"
      :indexList="getIndexData.indexList"
      :itemArr="getIndexData.dataList"
    />
    <u-empty v-else mode="list" />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { formatChooseData } from "@/util/common";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import ChooseIndexList from "@/components/ChooseIndexList/index.vue";
export default {
  components: {
    CustomNavBar,
    ChooseIndexList,
  },
  data() {
    return {
      keyword: "",
      listHeight: 0,
    };
  },
  computed: {
    ...mapGetters(["storeFriendList"]),
    getIndexData() {
      return formatChooseData(this.storeFriendList);
    },
  },
  mounted() {
    this.getListHeight();
  },
  methods: {
    userClick(friend) {
      uni.navigateTo({
        url: `/pages/common/userCard/index?sourceID=${friend.userID}`,
      });
    },
    async getListHeight() {
      const windowInfo = uni.getWindowInfo();
      const data = await this.getEl(".search_bar_wrap");
      const searchBarHeight = Number(data.height.toFixed());
      this.listHeight =
        windowInfo.windowHeight -
        windowInfo.statusBarHeight -
        44 -
        searchBarHeight;
    },
    getEl(el) {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(el)
          .boundingClientRect((data) => {
            // 存在data，且存在宽和高，视为渲染完毕
            resolve(data);
          })
          .exec();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.friend_list_container {
  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .u-empty {
    margin-top: 25vh !important;
  }
}
</style>
