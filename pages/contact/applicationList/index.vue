<template>
  <view class="application_list_container">
    <custom-nav-bar :title="isGroupApplication ? '新的群聊' : '新的好友'" />
    <view
      class="pane_row"
      :style="{ transform: `translateX(${isRecv ? '0' : '-100%'})` }"
    >
      <view class="pane_content">
        <u-list v-if="getRecvRenderData.length > 0" class="application_list">
          <u-list-item
            v-for="application in getRecvRenderData"
            :key="
              application[!isGroupApplication ? 'fromUserID' : 'userID'] +
              application.groupID
            "
          >
            <application-item :isRecv="true" :application="application" />
          </u-list-item>
        </u-list>
        <u-list
          v-else-if="getSendRenderData.length > 0"
          class="application_list"
        >
          <u-list-item
            v-for="application in getSendRenderData"
            :key="application[!isGroupApplication ? 'toUserID' : 'groupID']"
          >
            <application-item :application="application" />
          </u-list-item>
        </u-list>
        <view v-else class="empty">
          <image src="@/static/images/block_empty.png"></image>
          <text class="empty_text">暂无数据</text>
        </view>
      </view>
	  </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { ContactMenuTypes } from "@/constant";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import ApplicationItem from "./ApplicationItem.vue";
export default {
  components: {
    CustomNavBar,
    ApplicationItem,
  },
  data() {
    return {
      keyword: "",
      isRecv: true,
      isGroupApplication: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeRecvFriendApplications",
      "storeSentFriendApplications",
      "storeRecvGroupApplications",
      "storeSentGroupApplications",
    ]),
    getRecvRenderData() {
      const tmpList = this.isGroupApplication
        ? this.storeRecvGroupApplications
        : this.storeRecvFriendApplications;
      tmpList.sort((a, b) => (a.handleResult === 0 ? -1 : 1));
      return tmpList.slice(0, 4);
    },
    getSendRenderData() {
      const tmpList = this.isGroupApplication
        ? this.storeSentGroupApplications
        : this.storeSentFriendApplications;
      tmpList.sort((a, b) => (a.handleResult === 0 ? -1 : 1));
      return tmpList.slice(0, 4);
    },
    tabList() {
      return [
        {
          name: this.isGroupApplication ? "入群申请" : "好友请求",
        },
        {
          name: "我的请求",
        },
      ];
    },
  },
  onLoad(params) {
    const { applicationType } = params;
    this.isGroupApplication = applicationType === ContactMenuTypes.NewGroup;
  },
  methods: {
    clickTab({ index }) {
      this.isRecv = index === 0;
    },
    previewAll() {
      uni.navigateTo({
        url: `/pages/contact/applicationListDetails/index?isGroupApplication=${this.isGroupApplication}&isRecv=${this.isRecv}`,
      });
    },
    toSearch() {
      uni.navigateTo({
        url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${this.isGroupApplication}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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
.application_list_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f8f9fa;
  overflow-x: hidden;

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
    background-color: #fff;
  }

  .u-tabs {
    background-color: #fff;
  }

  .pane_row {
    display: flex;
    flex: 1;
    transition: all 0.3s ease 0s !important;
    background-color: #fff;
    margin-top: 20rpx;

    .pane_content {
      @include colBox(false);
      height: 100%;
      flex: 0 0 100%;

      .pane_title {
        font-size: 28rpx;
        color: #999;
        padding: 12rpx 44rpx;
        background-color: #f8f8f8;
      }

      .application_list {
        flex: 1;
        height: 100% !important;
      }
    }
  }

  .view_all {
    background-color: #fff;
    padding: 44rpx 44rpx;
  }
}
</style>
