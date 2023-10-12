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
        shape="square"
        placeholder="搜索"
        v-model="keyword"
        :showAction="false"
      />
    </view>

    <view class="content">
      <view @click="clickItem" class="result_item">
        <view class="wrap">
          <my-avatar
            :src="chatData.faceURL"
            :desc="chatData.showName"
            :isGroup="chatData.conversationType === 3"
            size="42"
          />
          <view class="result_item_details">
            <view class="title">{{ chatData.showName }}</view>
            <image src="@/static/images/common_right.png"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <u-list class="generic_list">
        <u-list-item
          v-for="item in chatData.messageList"
          :key="item.clientMsgID"
        >
          <global-result-item
            isPreview
            :item="item"
            @click="jumpToMessage(item)"
          />
        </u-list-item>
      </u-list>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import GlobalResultItem from "../globalSearch/components/GlobalResultItem.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";

export default {
  name: "",
  components: {
    GlobalResultItem,
    MyAvatar,
  },
  data() {
    return {
      chatData: {},
      keyword: "",
    };
  },
  computed: {
    ...mapGetters(["storeSelfInfo"]),
  },
  onLoad(options) {
    if (options.chatData) {
      this.chatData = JSON.parse(options.chatData);
      console.log("JSON.parse(options.chatData)", JSON.parse(options.chatData));
    }
  },
  methods: {
    clickItem() {
      if (this.chatData.conversationType === 3) {
        uni.$u.route("/pages/common/groupCard/index", {
          sourceID: this.chatData.groupID,
        });
        return;
      }
      if (this.chatData.conversationType === 1) {
        const ids = this.chatData.conversationID.split("_");
        console.log(ids, this.storeSelfInfo.userID);
        const id = ids[1] === this.storeSelfInfo.userID ? ids[2] : ids[1];
        uni.$u.route("/pages/common/userCard/index", {
          sourceID: id,
        });
        return;
      }
    },
    back() {
      uni.navigateBack();
    },
    jumpToMessage(message) {
      uni.$u.route("/pages/common/previewHistoryMessage/index", {
        conversationData: JSON.stringify({
          ...this.chatData,
          messageList: undefined,
        }),
        jumpMessage: JSON.stringify(message),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f8f8;
  overflow-x: hidden;
  margin-top: var(--status-bar-height);

  .search_bar_wrap {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 68rpx;
    padding: 24rpx 44rpx;
    background-color: #fff;

    .back_icon {
      margin-right: 26rpx;
    }
  }

  .content {
    margin: 26rpx 26rpx 0;

    .result_item {
      display: flex;
      padding: 24rpx 36rpx;
      color: $uni-text-color;
      position: relative;
      background-color: #fff;

      .wrap {
        @include vCenterBox();
        flex: 1;
        overflow: hidden;
      }

      &_details {
        display: flex;
        flex: 1;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-left: 20rpx;
        overflow: hidden;

        .title {
          color: $uni-text-color;
        }

        image {
          width: 18px;
          height: 18px;
        }
      }
    }

    .generic_list {
      flex: 1;
    }
  }
}
</style>
