<template>
  <view @click="clickItem" class="result_item">
    <view class="wrap">
      <my-avatar
        :src="item.faceURL || item.senderNickname"
        :desc="
          item.remark || item.nickname || item.showName || item.senderNickname
        "
        :isGroup="item.groupID !== undefined && !item.senderNickname"
        size="42"
        v-if="!isFile"
      />
      <my-avatar
        v-else
        src="/static/images/chating_message_file.png"
        size="42"
      />
      <view class="result_item_details">
        <view class="title">
          <view class="name">
            {{
              item.remark ||
              item.nickname ||
              item.groupName ||
              item.showName ||
              item.senderNickname
            }}
          </view>
          <text class="desc">{{ item.position }}</text>
        </view>
        <view
          class="sub_title"
          v-if="item.company || item.latestMsg || messageContent"
        >
          {{ item.company || item.latestMsg || messageContent }}
        </view>
      </view>
    </view>
    <view v-if="item.sendTime !== undefined" class="time">
      {{ getLatestTime }}
    </view>
  </view>
</template>

<script>
import MyAvatar from "@/components/MyAvatar/index.vue";
import { formatConversionTime, parseMessageByType } from "@/util/imCommon";
export default {
  name: "GlobalResultItem",
  components: {
    MyAvatar,
  },
  props: {
    item: Object,
    isPreview: Boolean,
    isFile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  computed: {
    getLatestTime() {
      return formatConversionTime(this.item.sendTime);
    },
    messageContent() {
      if (this.item.clientMsgID) {
        return parseMessageByType(this.item);
      }
      return "";
    },
  },
  methods: {
    clickItem() {
      if (this.isPreview) {
        this.$emit("click", this.item);
        return;
      }
      if (this.item.userID) {
        uni.$u.route("/pages/common/userCard/index", {
          sourceID: this.item.userID,
        });
        return;
      }
      if (this.item.groupName) {
        uni.$u.route("/pages/common/groupCard/index", {
          sourceID: this.item.groupID,
        });
        return;
      }
      if (this.item.conversationID) {
        uni.$u.route("/pages/common/globalChatLosPreview/index", {
          chatData: JSON.stringify(this.item),
        });
        return;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
    flex: 1;
    margin-left: 20rpx;
    overflow: hidden;

    .title {
      display: flex;
      align-items: baseline;

      .name {
        @include nomalEllipsis();
        max-width: 280rpx;
        color: $uni-text-color;
      }

      .desc {
        @include nomalEllipsis();
        margin-left: 20rpx;
        font-size: 24rpx;
        color: #666;
      }
    }

    .sub_title {
      @include nomalEllipsis();
      font-size: 24rpx;
      color: #999;
      max-width: 360rpx;
      margin-top: 8rpx;
    }
  }

  .time {
    font-size: 24rpx;
    color: #adadad;
  }
}
</style>
