<template>
  <scroll-view :scroll-with-animation="withAnimation" @click="click" id="scroll_view" :style="{
    backgroundSize: `100% ${bgHeight}`,
  }" @scroll="throttleScroll" :scroll-top="scrollTop" scroll-y :scroll-into-view="scrollIntoView" upper-threshold="250"
    @scrolltoupper="scrolltoupper">
    <view id="scroll_wrap">
      <view v-if="loadMoreStatus !== 'nomore'">
        <u-loadmore nomoreText="" :status="loadMoreStatus" />
      </view>
      <view v-for="(item, index) in storeHistoryMessageList" :key="item.clientMsgID">
        <view v-if="getTimeLine" class="time_gap_line">
          {{ getTimeLine(item, storeHistoryMessageList[index - 1]) }}
        </view>
        <message-item-render :mutipleCheckVisible="mutipleCheckVisible" @messageItemRender="messageItemRender"
          :source="item" :isSender="item.sendID === storeCurrentUserID" />
        <view v-if="sendFailedDesc" class="time_gap_line send_failed_tip">
          {{ sendFailedDesc(item) }}
        </view>
      </view>
      <view style="visibility: hidden; height: 12px" id="auchormessage_bottom_item"></view>
    </view>
    <view v-show="getNewMesageCount && !needScoll">
      <transition name="fade">
        <view @click="scrollToBottom(false)" class="new_message_flag fade">
          <image style="height: 10px; width: 11px" src="@/static/images/common_db_arrow.png" />
          <text>{{ `${getNewMesageCount}条新消息` }}</text>
        </view>
      </transition>
    </view>
  </scroll-view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dayjs from "dayjs";
import { SendMessageFailedType } from "@/constant";
import MessageItemRender from "./MessageItem/index.vue";
import { MessageStatus } from "openim-uniapp-polyfill";

export default {
  name: "",
  components: {
    MessageItemRender,
  },
  props: {
    mutipleCheckVisible: Boolean,
  },
  data() {
    return {
      scrollIntoView: "",
      scrollWithAnimation: false,
      scrollTop: 0,
      initFlag: true,
      isOverflow: false,
      needScoll: true,
      withAnimation: false,
      messageLoadState: {
        lastMinSeq: 0,
        loading: false,
      },
      bgHeight: "",
    };
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeHistoryMessageList",
      "storeHasMoreMessage",
      "storeCurrentUserID",
      "storeSelfInfo",
    ]),
    loadMoreStatus() {
      console.log(this.storeHistoryMessageList);
      if (!this.storeHasMoreMessage) {
        return "nomore";
      }
      return this.messageLoadState.loading ? "loading" : "loadmore";
    },
    getNewMesageCount() {
      return this.storeHistoryMessageList.filter((message) => message.isAppend)
        .length;
    },
    sendFailedDesc() {
      return (message) => {
        if (
          message.status === MessageStatus.Failed &&
          message.errCode === SendMessageFailedType.Blacked
        ) {
          return "消息已发出，但被对方拒收了";
        }
        if (
          message.status === MessageStatus.Failed &&
          message.errCode === SendMessageFailedType.NotFriend
        ) {
          return "对方开启了好友验证，你还不是他（她）好友。请先发送好友验证，对方验证通过后，才能聊天。";
        }
        return "";
      };
    },
    getTimeLine() {
      return (message, preMessage) => {
        const sendTime = message.sendTime;
        const preSendTime = preMessage?.sendTime;
        if (preSendTime && sendTime - preSendTime > 600000) {
          const fromNowStr = dayjs(sendTime).fromNow();
          if (fromNowStr.includes("秒")) {
            return "刚刚";
          }
          return dayjs(sendTime).calendar();
        }
        return null;
      };
    },
  },
  mounted() {
    this.loadMessageList();
  },
  methods: {
    ...mapActions("message", ["getHistoryMesageList"]),
    messageItemRender(clientMsgID) {
      if (
        this.initFlag &&
        clientMsgID ===
        this.storeHistoryMessageList[this.storeHistoryMessageList.length - 1]
          .clientMsgID
      ) {
        this.initFlag = false;
        setTimeout(() => this.scrollToBottom(true), 200);
        this.checkInitHeight();
      }
    },
    async loadMessageList(isLoadMore = false) {
      this.messageLoadState.loading = true;
      const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID;
      const options = {
        conversationID: this.storeCurrentConversation.conversationID,
        userID: "",
        groupID: "",
        count: 20,
        startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
        lastMinSeq: this.messageLoadState.lastMinSeq,
      };
      try {
        const { emptyFlag, lastMinSeq } =
          await this.getHistoryMesageList(options);
        this.messageLoadState.lastMinSeq = lastMinSeq;
        if (emptyFlag) {
          this.$emit("initSuccess");
        }
      } catch (e) {
        console.log(e);
      }
      this.$nextTick(function () {
        if (isLoadMore && lastMsgID) {
          this.scrollToAnchor(`auchor${lastMsgID}`);
        }
        this.messageLoadState.loading = false;
      });
    },
    click(e) {
      this.$emit("click", e);
    },
    onScroll(event) {
      const { scrollHeight, scrollTop } = event.target;
      this.needScoll =
        scrollHeight - scrollTop < uni.getWindowInfo().windowHeight * 1.2;
    },
    throttleScroll(event) {
      uni.$u.throttle(() => this.onScroll(event), 150);
    },
    scrolltoupper() {
      if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
        this.loadMessageList(true);
      }
    },
    scrollToBottom(isInit = false, isRecv = false) {
      if (isRecv && !this.needScoll) {
        return;
      }

      if (!isInit) {
        this.withAnimation = true;
        setTimeout(() => (this.withAnimation = false), 100);
      }

      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select("#scroll_wrap")
          .boundingClientRect((res) => {
            this.scrollTop = res.height;
            if (isInit) {
              this.$emit("initSuccess");
            }
          })
          .exec();
      });
    },
    scrollToAnchor(auchor) {
      this.$nextTick(function () {
        this.scrollIntoView = auchor;
      });
    },
    checkInitHeight() {
      this.getEl("#scroll_view").then(({ height }) => {
        this.bgHeight = `${height}px`;
      });
    },
    getEl(el) {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(el)
          .boundingClientRect((data) => {
            resolve(data);
          })
          .exec();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#scroll_view {
  flex: 1;
  background-repeat: no-repeat;
  position: relative;
  /* #ifdef  H5 || APP-PLUS */
  height: 1px;
  /* #endif */
}

.watermark-view {
  width: 100%;
  height: 100%;
  position: fixed;
}

.uni-scroll-view {
  position: relative;
}

.new_message_flag {
  position: sticky;
  background: #ffffff;
  box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  padding: 4px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: fit-content;
  font-size: 24rpx;
  color: #006aff;
}

.time_gap_line {
  position: relative;
  padding: 0 10vw 12rpx;
  text-align: center;
  // font-size: 24rpx;
  font-size: 0.93rem;
  color: #999;
}

.fade-leave,
.fade-enter-to {
  opacity: 1;
}

.fade-leave-active,
.fade-enter-active {
  transition: all 0.3s;
}

.fade-leave-to,
.fade-enter {
  opacity: 0;
}
</style>
