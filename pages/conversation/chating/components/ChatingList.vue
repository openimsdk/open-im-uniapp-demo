<template>
  <scroll-view
    :scroll-with-animation="withAnimation"
    @click="click"
    id="scroll_view"
    :style="{
      height: '1px',
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: `100% ${bgHeight}`,
    }"
    @scroll="throttleScroll"
    :scroll-top="scrollTop"
    scroll-y
    :scroll-into-view="scrollIntoView"
    upper-threshold="250"
    @scrolltoupper="scrolltoupper"
  >
    <!-- <view class="watermark-view">
      <view v-for="i in 20" :key="i">
        <view v-for="j in 20" :key="j">
          <view
            class="watermark"
            :key="i + j"
            :style="{ top: 150 * (i - 1) + 'px', left: 150 * (j - 1) + 'px' }"
          >
            {{ storeSelfInfo.nickname }}
          </view>
        </view>
      </view>
    </view> -->
    <view id="scroll_wrap">
      <u-loadmore nomoreText="" :status="loadMoreStatus" />
      <view
        v-for="(item, index) in storeHistoryMessageList"
        :key="item.clientMsgID"
      >
        <view v-if="getTimeLine" class="time_gap_line">
          {{ getTimeLine(item, storeHistoryMessageList[index - 1]) }}
        </view>
        <message-item-render
          :mutipleCheckVisible="mutipleCheckVisible"
          :menuOutsideFlag="menuOutsideFlag"
          @messageItemRender="messageItemRender"
          :source="item"
          :isSender="item.sendID === storeCurrentUserID"
          @closeMune="closeMune"
        />
        <view v-if="sendFailedDesc" class="time_gap_line send_failed_tip">
          {{ sendFailedDesc(item) }}
        </view>
      </view>
      <view
        style="visibility: hidden; height: 12px"
        id="auchormessage_bottom_item"
      ></view>
    </view>
    <!-- <transition name="fade">
      <view
        @click="scrollToBottom(false)"
        v-show="getNewMesageCount && !needScoll"
        class="new_message_flag fade"
      >
        <image
          style="height: 10px; width: 11px"
          src="@/static/images/common_db_arrow.png"
        />
        <text>{{ `${getNewMesageCount}条新消息` }}</text>
      </view>
    </transition> -->
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
    menuOutsideFlag: Number,
    mutipleCheckVisible: Boolean,
  },
  data() {
    return {
      scrollIntoView: "",
      scrollWithAnimation: false,
      scrollTop: 0,
      old: {
      	scrollTop: 0
      },
      initFlag: true,
      isOverflow: false,
      needScoll: true,
      withAnimation: false,
      messageLoadState: {
        lastMinSeq: 0,
        loading: false,
      },
      bgUrl: "",
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
  beforeMount() {
    this.updateBgUrl();
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
        // setTimeout(() => this.scrollToAnchor(`auchor${clientMsgID}`, false, true), 200)
        this.checkInitHeight();
        // this.scrollToAnchor('message_bottom_item',true)
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
        //TODO handle the exception
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
      this.old.scrollTop = scrollTop
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
            // let top = res.height - this.scrollViewHeight;
            // if (top > 0) {
            this.scrollTop = this.old.scrollTop
            this.$nextTick(() => this.scrollTop = res.height);
            if (isInit) {
              this.$emit("initSuccess");
            }
            // }
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
    closeMune() {
      this.$emit("closeMune");
    },
    updateBgUrl() {
      const bgMap = uni.getStorageSync("IMBgMap") || {};
      this.bgUrl =
        bgMap[this.$store.getters.storeCurrentConversation.conversationID] ||
        "";
    },
  },
};
</script>

<style lang="scss" scoped>
#scroll_view {
  flex: 1;
  background-repeat: no-repeat;
  position: relative;
}

.watermark-view {
  width: 100%;
  height: 100%;
  position: fixed;
}

.watermark {
  font-size: 16px; /* 水印文字大小 */
  color: #f0f2f6; /* 水印文字颜色，使用透明度控制可见度 */
  position: absolute; /* 水印相对定位 */
  transform: rotate(-45deg);
  pointer-events: none; /* 防止水印文字干扰交互 */
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
