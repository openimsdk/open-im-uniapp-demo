<template>
  <view class="comprehensive_container">
    <view v-show="data.contacts.length > 0" class="comprehensive_row">
      <view class="row_title">
        <text class="row_title_text">联系人</text>
      </view>
      <global-result-item
        v-for="user in data.contacts.slice(0, 2)"
        :item="user"
        :key="user.userID"
      />
      <view
        v-show="data.contacts.length > 2"
        @click="toggleTab(1)"
        class="more"
      >
        <text>查看更多相关联系人</text>
        <view class="more_right">
          <u-icon name="arrow-right" color="#999" size="18" />
        </view>
      </view>
    </view>

    <view v-show="data.groups.length > 0" class="comprehensive_row">
      <view class="row_title">
        <text class="row_title_text">群组</text>
      </view>
      <global-result-item
        v-for="group in data.groups.slice(0, 2)"
        :item="group"
        :key="group.groupID"
      />
      <view v-show="data.groups.length > 2" @click="toggleTab(2)" class="more">
        <text>查看更多相关群组</text>
        <view class="more_right">
          <u-icon name="arrow-right" color="#999" size="18" />
        </view>
      </view>
    </view>

    <view v-show="data.chatLogs.length > 0" class="comprehensive_row">
      <view class="row_title">
        <text class="row_title_text">聊天记录</text>
      </view>
      <global-result-item
        v-for="logs in data.chatLogs.slice(0, 2)"
        :item="logs"
        :key="logs.conversationID"
      />
      <view
        v-show="data.chatLogs.length > 2"
        @click="toggleTab(3)"
        class="more"
      >
        <text>查看更多相关聊天记录</text>
        <view class="more_right">
          <u-icon name="arrow-right" color="#999" size="18" />
        </view>
      </view>
    </view>

    <view v-show="data.documents.length > 0" class="comprehensive_row">
      <view class="row_title">
        <text class="row_title_text">文件</text>
      </view>
      <global-result-item
        v-for="document in data.documents.slice(0, 2)"
        :item="document"
        :key="document.clientMsgID"
        isFile
      />
    </view>
    <view v-show="data.documents.length > 2" @click="toggleTab(4)" class="more">
      <text>查看更多相关文档</text>
      <view class="more_right">
        <u-icon name="arrow-right" color="#999" size="18" />
      </view>
    </view>

    <u-empty
      icon="@/static/images/global_search_empty.png"
      v-show="isEmpty"
      text="没有更多搜索结果"
    />
  </view>
</template>

<script>
import GlobalResultItem from "./GlobalResultItem.vue";
export default {
  components: {
    GlobalResultItem,
  },
  props: {
    data: Object,
  },
  data() {
    return {};
  },
  computed: {
    isEmpty() {
      return (
        Object.values(this.data).find((item) => item.length > 0) === undefined
      );
    },
  },
  methods: {
    toggleTab(tab) {
      this.$emit("toggleTab", {
        index: tab,
      });
    },
  },
};
</script>

<style lang="scss">
.comprehensive_container {
  flex: 1;
  overflow-y: auto;

  .comprehensive_row {
    margin: 24rpx;
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;

    .row_title {
      display: flex;
      justify-content: space-between;
      padding: 24rpx 36rpx 0;
      font-size: 24rpx;

      &_text {
        color: $u-tips-color;
      }

      // .more {
      // 	color: #1B72EC;
      // }
    }

    .more {
      @include btwBox();
      padding: 20rpx 36rpx 20rpx;
      border-top: 1px solid rgba(153, 153, 153, 0.2);
      color: $uni-color-primary;

      .more_right {
        @include vCenterBox();
      }
    }
  }

  .u-empty {
    margin-top: 20vh !important;
  }
}
</style>
