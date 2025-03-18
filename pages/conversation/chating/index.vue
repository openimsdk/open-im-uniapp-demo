<template>
  <view :style="{ backgroundColor: '#f8f8f8' }" class="chating_container">
    <chating-header
      @click="pageClick"
      ref="chatingHeaderRef"
    />
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
    };
  },
  onLoad(options) {
    console.log("onload");
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
      true
    );
    this.resetConversationState();
    this.resetMessageState();
  },
  methods: {
    ...mapActions("message", ["resetMessageState", "deleteMessages"]),
    ...mapActions("conversation", ["resetConversationState"]),
    scrollToBottom(isRecv = false) {
      this.$refs.chatingListRef.scrollToBottom(false, isRecv);
    },
    pageClick(e) {
      this.footerOutsideFlag += 1;
    },
    initSuccess() {
      console.log("initSuccess");
      this.initLoading = false;
    },

    // page event
    setPageListener() {
      uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
    },
    disposePageListener() {
      uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
    },
  },
  onBackPress() {
    uni.switchTab({
      url: "/pages/conversation/conversationList/index",
    });
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

    /* 为不同的水印元素设置不同的偏移，以避免重叠 */
    // transform-origin: top right;
    // margin-top: 20px;
    // margin-right: 20px;
  }

  // ::before {
  //   content: "Your Watermark Text"; /* 替换为你想要的水印文字 */
  //   font-size: 16px; /* 水印文字大小 */
  //   color: rgba(0, 0, 0, 0.2); /* 水印文字颜色，使用透明度控制可见度 */
  //   position: absolute; /* 水印相对定位 */
  //   top: 20px; /* 距离顶部的距离 */
  //   right: 20px; /* 距离右侧的距离 */
  //   transform: rotate(-45deg); /* 将水印旋转为倾斜状态 */
  //   pointer-events: none; /* 防止水印文字干扰交互 */
  //   z-index: -1; /* 将水印置于底层 */
  // }

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
