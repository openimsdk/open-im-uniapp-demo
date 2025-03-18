<template>
  <scroll-view
    :scroll-with-animation="withAnimation"
    @click="click"
    id="scroll_view"
    :style="{
      height: '1px'
    }"
    @scroll="throttleScroll"
    :scroll-top="scrollTop"
    scroll-y
    :scroll-into-view="scrollIntoView"
    upper-threshold="250"
    @scrolltoupper="scrolltoupper"
  >
    <view id="scroll_wrap">
      <u-loadmore nomoreText="" :status="loadMoreStatus" />
      <view
        v-for="item in storeHistoryMessageList"
        :key="item.clientMsgID"
      >
        <message-item-render
          @messageItemRender="messageItemRender"
          :source="item"
          :isSender="item.sendID === storeCurrentUserID"
        />
      </view>
      <view
        style="visibility: hidden; height: 12px"
        id="auchormessage_bottom_item"
      ></view>
    </view>
  </scroll-view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import MessageItemRender from "./MessageItem/index.vue";

export default {
  name: "",
  components: {
    MessageItemRender,
  },
  props: {},
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
        loading: false,
      },
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
      if (!this.storeHasMoreMessage) {
        return "nomore";
      }
      return this.messageLoadState.loading ? "loading" : "loadmore";
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
        count: 20,
        startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
        viewType: 0,
      };
      try {
        const { emptyFlag } =
          await this.getHistoryMesageList(options);
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
