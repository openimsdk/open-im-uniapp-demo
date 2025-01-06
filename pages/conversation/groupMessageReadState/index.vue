<template>
  <view class="page_container">
    <custom-nav-bar title="消息阅读状态" />

    <u-tabs
      class="top_tab"
      :scrollable="false"
      :list="tabList"
      @click="clickTab"
    ></u-tabs>

    <view
      class="pane_row"
      :style="{ transform: `translateX(${isReaded ? '0' : '-100%'})` }"
    >
      <view class="pane_content">
        <u-list
          @scrolltolower="readedScrolltolower"
          :height="`${listHeight}px`"
          lowerThreshold="100"
          v-if="readedList.length > 0"
          class="member_list"
        >
          <u-list-item v-for="member in readedList" :key="member.userID">
            <user-item :item="member" />
          </u-list-item>
        </u-list>
        <u-empty v-else mode="list" />
      </view>

      <view class="pane_content">
        <u-list
          @scrolltolower="unreadScrolltolower"
          :height="`${listHeight}px`"
          lowerThreshold="100"
          v-if="unReadList.length > 0"
          class="member_list"
        >
          <u-list-item v-for="member in unReadList" :key="member.userID">
            <user-item :item="member" />
          </u-list-item>
        </u-list>
        <u-empty v-else mode="list" />
      </view>
    </view>
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
      readedList: [],
      unReadList: [],
      isReaded: true,
      tabList: [
        {
          name: "已读",
        },
        {
          name: "未读",
        },
      ],
      messageState: {
        groupID: "",
        hasReadUserIDList: [],
        memberCount: 0,
        sendTime: 0,
      },
      unReadLoadstate: {
        loading: false,
        hasMore: true,
      },
      readedLoadstate: {
        loading: false,
        hasMore: true,
      },
      listHeight:
        uni.getWindowInfo().windowHeight -
        uni.getWindowInfo().statusBarHeight -
        110,
    };
  },
  onLoad(options) {
    this.messageState = JSON.parse(options.messageState);
    const readCount = this.messageState.hasReadUserIDList.length;
    this.tabList[0].name = `已读 ${readCount}`;
    this.tabList[1].name = `未读 ${
      this.messageState.memberCount - readCount - 1
    }`;
    this.getReadedMemberList();
    this.getUnreadMemberList();
  },
  methods: {
    clickTab({ index }) {
      this.isReaded = index === 0;
    },
    readedScrolltolower() {
      if (this.readedLoadstate.hasMore && !this.readedLoadstate.loading) {
        this.getReadedMemberList();
      }
    },
    unreadScrolltolower() {
      console.log(this.unReadLoadstate.hasMore, !this.unReadLoadstate.loading);
      if (this.unReadLoadstate.hasMore && !this.unReadLoadstate.loading) {
        this.getUnreadMemberList();
      }
    },
    getReadedMemberList() {
      this.readedLoadstate.loading = true;
      const offsetList = this.messageState.hasReadUserIDList.slice(
        this.readedList.length,
        this.readedList.length + 20,
      );
      IMSDK.asyncApi(
        IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
        IMSDK.uuid(),
        {
          groupID: this.messageState.groupID,
          userIDList: offsetList,
        },
      )
        .then(({ data }) => {
          this.readedList = [...this.readedList, ...data];
          this.readedLoadstate.hasMore = offsetList.length === 20;
        })
        .finally(() => (this.readedLoadstate.loading = false));
    },
    getUnreadMemberList() {
      this.unReadLoadstate.loading = true;
      IMSDK.asyncApi(
        IMSDK.IMMethods.GetGroupMemberListByJoinTimeFilter,
        IMSDK.uuid(),
        {
          groupID: this.messageState.groupID,
          offset: this.unReadList.length,
          count: 20,
          joinTimeBegin: 0,
          joinTimeEnd: (this.messageState.sendTime / 1000).toFixed(),
          filterUserIDList: [
            ...this.messageState.hasReadUserIDList,
            this.$store.getters.storeCurrentUserID,
          ],
        },
      )
        .then(({ data }) => {
          this.unReadList = [...this.unReadList, ...data];
          this.unReadLoadstate.hasMore = data.length === 20;
        })
        .finally(() => (this.unReadLoadstate.loading = false));
    },
  },
};
</script>

<style lang="scss">
.page_container {
  background-color: #f8f8f8;
  overflow-x: hidden;

  .u-tabs {
    background-color: #fff;
    margin-bottom: 12px;
  }

  .pane_row {
    display: flex;
    transition: all 0.3s ease 0s !important;

    .pane_content {
      @include colBox(false);
      height: 100%;
      flex: 0 0 100%;

      /deep/.user_item {
        background-color: #fff;
      }
    }
  }

  .u-empty {
    margin-top: 20vh !important;
  }
}
</style>
