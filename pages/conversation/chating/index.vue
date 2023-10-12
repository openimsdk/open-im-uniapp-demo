<template>
  <page-meta :root-font-size="$store.getters.storeRootFontSize"></page-meta>
  <view :style="{ backgroundColor: '#f8f8f8' }" class="chating_container">
    <chating-header @click="pageClick" ref="chatingHeaderRef" />
    <chating-list
      @click="pageClick"
      ref="chatingListRef"
      @initSuccess="initSuccess"
    />
    <chating-footer
      ref="chatingFooterRef"
      :footerOutsideFlag="footerOutsideFlag"
      @scrollToBottom="scrollToBottom"
    />
    <u-loading-page :loading="initLoading"></u-loading-page>
  </view>
</template>

<script>
import { mapActions } from "vuex";
import {
  PageEvents,
} from "@/constant";
import ChatingHeader from "./components/ChatingHeader.vue";
import ChatingFooter from "./components/ChatingFooter/index.vue";
import ChatingList from "./components/ChatingList.vue";
import { markConversationAsRead } from "@/util/imCommon";

export default {
  components: {
    ChatingHeader,
    ChatingFooter,
    ChatingList,
  },
  data() {
    return {
      listHeight: 0,
      footerOutsideFlag: 0,
      initLoading: true,
      back2Tab: false,
      timer: null,
    };
  },
  onLoad(options) {
    this.setPageListener();
    if (options?.back2Tab) {
      this.back2Tab = JSON.parse(options.back2Tab);
    }
  },
  onUnload() {
    console.log("unload");
    this.disposePageListener();
    markConversationAsRead(
      {
        ...this.$store.getters.storeCurrentConversation,
      },
      true,
    );
    this.resetConversationState();
    this.resetMessageState();
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    ...mapActions("message", ["resetMessageState",]),
    ...mapActions("conversation", ["resetConversationState"]),
    scrollToBottom(isRecv = false) {
      this.$refs.chatingListRef.scrollToBottom(false, isRecv);
    },
    async pageClick(e) {
      this.footerOutsideFlag += 1;
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
    initSuccess() {
      this.initLoading = false;
    },

    // page event
    onlineCheckHandler() {
      this.$refs.chatingHeaderRef.checkOnline();
    },
    atSomeOneHandler({ userID, nickname }) {
      console.log("atSomeOneHandler");
      if (plus.os.name == 'iOS') {
        var UIImpactFeedbackGenerator = plus.ios.importClass(
          'UIImpactFeedbackGenerator',
        );
        var impact = new UIImpactFeedbackGenerator();
        impact.prepare();
        impact.init(1);
        impact.impactOccurred();
      } else {
        uni.vibrateLong();
      }
      this.$refs.chatingFooterRef.insertAt(userID, nickname);
    },
    setPageListener() {
      uni.$on(PageEvents.OnlineStateCheck, this.onlineCheckHandler);
      uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
      uni.$on(PageEvents.AtSomeOne, this.atSomeOneHandler);
    },
    disposePageListener() {
      uni.$off(PageEvents.OnlineStateCheck, this.onlineCheckHandler);
      uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
      uni.$off(PageEvents.AtSomeOne, this.atSomeOneHandler);
    },
  },
  onBackPress() {
    return true;
  },
  beforeDestroy() {
    uni.switchTab({
      url: "/pages/conversation/conversationList/index",
    });
  },
};
</script>

<style lang="scss" scoped>
.chating_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;
  background-color: #fff !important;
  position: relative;

  .watermark {
    font-size: 16px; /* 水印文字大小 */
    color: rgba(0, 0, 0, 0.2); /* 水印文字颜色，使用透明度控制可见度 */
    position: absolute; /* 水印相对定位 */
    transform: rotate(-45deg);
    pointer-events: none; /* 防止水印文字干扰交互 */

  }

  .mutiple_action_container {
    display: flex;
    border-top: 1px solid #eaebed;
    background: #f0f2f6;
    justify-content: space-evenly;
    padding: 12px 24px;

    .action_item {
      @include centerBox();
      flex-direction: column;

      image {
        width: 48px;
        height: 48px;
      }
    }
  }
}
</style>
