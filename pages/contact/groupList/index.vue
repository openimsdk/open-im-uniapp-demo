<template>
  <view class="group_list_container">
    <custom-nav-bar title="我的群组">
      <!-- <view @click="toCreateGroup" class="nav_right_action" slot="more">
				<text>发起群聊</text>
			</view> -->
    </custom-nav-bar>
    <view class="search_bar_wrap">
      <u-search
        class="search_bar"
        shape="square"
        placeholder="搜索"
        @click="toSearch"
        disabled
        :showAction="false"
      />
    </view>

    <u-tabs :scrollable="false" :list="tabList" @click="clickTab"></u-tabs>

    <view
      class="pane_row"
      :style="{ transform: `translateX(${isMyCreate ? '0' : '-100%'})` }"
    >
      <view class="pane_content">
        <u-list
          v-if="getMyCreateGroupList.length > 0"
          class="group_list"
          :height="`${getListHeight}px`"
        >
          <u-list-item
            v-for="group in getMyCreateGroupList"
            :key="group.groupID"
          >
            <group-item :groupInfo="group" />
          </u-list-item>
        </u-list>
        <u-empty v-else mode="list" />
      </view>

      <view class="pane_content">
        <u-list
          v-if="getMyJoinedGroupList.length > 0"
          class="group_list"
          :height="`${getListHeight}px`"
        >
          <u-list-item
            v-for="group in getMyJoinedGroupList"
            :key="group.groupID"
          >
            <group-item :groupInfo="group" />
          </u-list-item>
        </u-list>
        <u-empty v-else mode="list" />
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import GroupItem from "./GroupItem.vue";
export default {
  components: {
    CustomNavBar,
    GroupItem,
  },
  data() {
    return {
      keyword: "",
      tabList: [
        {
          name: "我创建的",
        },
        {
          name: "我加入的",
        },
      ],
      isMyCreate: true,
    };
  },
  computed: {
    ...mapGetters(["storeGroupList", "storeCurrentUserID"]),
    getMyCreateGroupList() {
      return this.storeGroupList.filter(
        (group) => group.ownerUserID === this.storeCurrentUserID,
      );
    },
    getListHeight() {
      const statusBar = uni.getWindowInfo().statusBarHeight;
      const searchBar = 58;
      const tabAndNavBar = 44 * 2;
      const titleBar = 32;
      return (
        uni.getWindowInfo().safeArea.height -
        statusBar -
        searchBar -
        tabAndNavBar -
        titleBar
      );
    },
    getMyJoinedGroupList() {
      // console.log(this.storeGroupList.filter(group => group.ownerUserID !== this.storeCurrentUserID));
      return this.storeGroupList.filter(
        (group) => group.ownerUserID !== this.storeCurrentUserID,
      );
    },
  },
  mounted() {},
  methods: {
    clickTab({ index }) {
      this.isMyCreate = index === 0;
    },
    toCreateGroup() {
      uni.navigateTo({
        url: `/pages/common/createGroup/index`,
      });
    },
    toSearch() {
      uni.$u.route("/pages/contact/searchJoinedGroup/index");
    },
  },
};
</script>

<style lang="scss" scoped>
.group_list_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;

  .nav_right_action {
    padding-right: 44rpx;
  }

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .pane_row {
    display: flex;
    flex: 1;
    transition: all 0.3s ease 0s !important;
    border-top: 2rpx solid #e8eaef;
    // overflow-x: hidden;

    .pane_content {
      @include colBox(false);
      height: 100%;
      flex: 0 0 100%;

      .pane_title {
        font-size: 14px;
        color: #999;
        padding: 6px 22px;
        background-color: #f8f8f8;
      }
    }
  }
}
</style>
