<template>
  <view class="page_container">
    <view class="search_bar_wrap">
      <img
        @click="back"
        class="back_icon"
        width="12"
        height="20"
        src="static/images/common_left_arrow.png"
        alt=""
        srcset=""
      />
      <u-search
        class="search_bar"
        shape="square"
        placeholder="搜索"
        v-model="keyword"
        :show-action="false"
        @search="enterSearch"
      />
    </view>

    <u-tabs
      class="top_tab"
      lineColor="#1B72EC"
      :activeStyle="{ color: '#1B72EC' }"
      :inactiveStyle="{ color: '#ADADAD' }"
      :scrollable="false"
      :list="tabList"
      :current="currentTab"
      @click="clickTab"
    ></u-tabs>

    <comprehensive-panel
      v-show="currentTab === 0"
      :data="dataSource"
      @toggleTab="clickTab"
    />

    <generic-panel
      v-show="currentTab > 0 && genericDataSource.length > 0"
      :generic-list="genericDataSource"
      @scrolltolower="scrolltolower"
      :isFile="currentTab === 4"
    />

    <u-empty
      icon="/static/images/global_search_empty.png"
      v-show="currentTab > 0 && genericDataSource.length === 0"
      text="没有更多搜索结果"
    />
  </view>
</template>

<script>
import IMSDK, { MessageType } from "openim-uniapp-polyfill";
import ComprehensivePanel from "./components/ComprehensivePanel.vue";
import GenericPanel from "./components/GenericPanel.vue";
import { parseMessageByType } from "@/util/imCommon";
import { businessSearchUser } from "@/api/login";

export default {
  components: {
    ComprehensivePanel,
    GenericPanel,
  },
  data() {
    return {
      currentTab: 0,
      keyword: "",
      tabList: [
        {
          name: "综合",
        },
        {
          name: "联系人",
        },
        {
          name: "群组",
        },
        {
          name: "聊天记录",
        },
        {
          name: "文件",
        },
      ],
      dataSource: {
        contacts: [],
        groups: [],
        chatLogs: [],
        documents: [],
      },
      documentsPageIndex: 1,
      documentsHasMore: true,
      documentsLoading: false,
    };
  },
  computed: {
    genericDataSource() {
      switch (this.currentTab) {
        case 1:
          return this.dataSource.contacts;
        case 2:
          return this.dataSource.groups;
        case 3:
          return this.dataSource.chatLogs;
        case 4:
          return this.dataSource.documents;
        default:
          return [];
      }
    },
  },
  methods: {
    clickTab({ index }) {
      this.currentTab = index;
    },
    back() {
      uni.navigateBack();
    },
    enterSearch() {
      if (!this.keyword) return;

      this.documentsPageIndex = 1;
      this.documentsHasMore = true;
      this.searchUser();
      this.searchGroup();
      this.searchChatLogs();
      this.searchFileLogs();
    },
    scrolltolower() {
      if (
        this.currentTab !== 4 ||
        this.documentsLoading ||
        !this.documentsHasMore
      ) {
        return;
      }
      this.searchFileLogs();
    },
    searchUser() {
      // const options = {
      //   keywordList: [this.keyword],
      //   isSearchUserID: true,
      //   isSearchNickname: true,
      //   isSearchRemark: true,
      // };
      businessSearchUser(this.keyword).then(
        (data) => {
          this.dataSource.contacts = data.users || [];
        },
      );
    },
    searchGroup() {
      const options = {
        keywordList: [this.keyword],
        isSearchGroupID: true,
        isSearchGroupName: true,
      };
      IMSDK.asyncApi(IMSDK.IMMethods.SearchGroups, IMSDK.uuid(), options).then(
        ({ data }) => {
          this.dataSource.groups = data;
        },
      );
    },
    searchChatLogs() {
      const options = {
        conversationID: "",
        keywordList: [this.keyword],
        keywordListMatchType: 0,
        senderUserIDList: [],
        messageTypeList: [],
        searchTimePosition: 0,
        searchTimePeriod: 0,
        pageIndex: 0,
        count: 0,
      };
      IMSDK.asyncApi(
        IMSDK.IMMethods.SearchLocalMessages,
        IMSDK.uuid(),
        options,
      ).then(({ data }) => {
        const searchData = data.searchResultItems ?? [];
        searchData.map((item) => {
          item.groupID = item.messageList[0].groupID;
          item.sendTime = item.messageList[0].sendTime;
          item.latestMsg =
            item.messageCount > 1
              ? `${item.messageCount}条相关聊天记录`
              : parseMessageByType(item.messageList[0]);
        });
        this.dataSource.chatLogs = [...searchData];
      });
    },
    searchFileLogs() {
      const options = {
        conversationID: "",
        keywordList: [this.keyword],
        keywordListMatchType: 0,
        senderUserIDList: [],
        messageTypeList: [MessageType.FileMessage],
        searchTimePosition: 0,
        searchTimePeriod: 0,
        pageIndex: this.documentsPageIndex,
        count: 20,
      };
      IMSDK.asyncApi(
        IMSDK.IMMethods.SearchLocalMessages,
        IMSDK.uuid(),
        options,
      ).then(({ data }) => {
        const searchData = data.searchResultItems
          ? data.searchResultItems[0].messageList
          : [];
        const prevData =
          this.documentsPageIndex === 1 ? [] : this.dataSource.documents;
        this.dataSource.documents = [...prevData, ...searchData];
        this.documentsHasMore = searchData.length === 20;
        this.documentsPageIndex += 1;
      });
    },
  },
};
</script>

<style lang="scss">
.page_container {
  background-color: #f8f8f8;
  overflow: hidden;
  margin-top: var(--status-bar-height);

  .search_bar_wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 34px;
    padding: 12px 22px 0;
    background-color: #fff;

    .search_bar {
      margin-left: 26rpx !important;
    }
  }

  .u-tabs {
    background-color: #fff;
    border-bottom: 1px solid #eaeaea;

    /deep/ .u-tabs__wrapper__nav__item__text {
      word-break: keep-all;
    }

    /deep/ .u-tabs__wrapper__nav__line {
      bottom: 0;
    }
  }

  .u-empty {
    margin-top: 20vh !important;
  }
}
</style>
