<template>
  <page-meta :root-font-size="$store.getters.storeRootFontSize"></page-meta>
  <view :style="{ backgroundColor: '#f8f8f8' }" class="chating_container">
    <chating-header @click="pageClick" ref="chatingHeaderRef" :mutipleCheckVisible="mutipleCheckVisible" @mutipleCheckUpdate="mutipleCheckUpdate"  />
    <chating-list
      @click="pageClick"
      :mutipleCheckVisible="mutipleCheckVisible"
      ref="chatingListRef"
      @initSuccess="initSuccess"
      :menuOutsideFlag="menuOutsideFlag"
      @closeMune="pageClick"
    />
    <chating-footer
      v-show="!mutipleCheckVisible"
      ref="chatingFooterRef"
      :footerOutsideFlag="footerOutsideFlag"
      @scrollToBottom="scrollToBottom"
    />
    <u-loading-page :loading="initLoading"></u-loading-page>
  </view>
</template>

<script>
import { mapActions } from "vuex";
import IMSDK from "openim-uniapp-polyfill";
import {
  ContactChooseTypes,
  GroupMemberListTypes,
  PageEvents,
} from "@/constant";
import ChatingHeader from "./components/ChatingHeader.vue";
import ChatingFooter from "./components/ChatingFooter/index.vue";
import ChatingList from "./components/ChatingList.vue";
import { markConversationAsRead, parseMessageByType } from "@/util/imCommon";

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
      menuOutsideFlag: 0,
      initLoading: true,
      mutipleCheckVisible: false,
      back2Tab: false,
      timer: null,
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
      true,
    );
    this.resetConversationState();
    this.resetMessageState();
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    ...mapActions("message", ["resetMessageState", "deleteMessages"]),
    ...mapActions("conversation", ["resetConversationState"]),
    scrollToBottom(isRecv = false) {
      // this.$refs.chatingListRef.scrollToAnchor(`auchor${clientMsgID}`, isRecv);
      this.$refs.chatingListRef.scrollToBottom(false, isRecv);
    },
    mutipleRemove() {
      const checkedMessages =
        this.$store.getters.storeHistoryMessageList.filter(
          (message) => message.checked,
        );
      if (checkedMessages.length === 0) {
        uni.$u.toast("请先选择要操作的消息");
        return;
      }
      let count = 0;
      checkedMessages.map((message) => {
        IMSDK.asyncApi(IMSDK.IMMethods.DeleteMessage, IMSDK.uuid(), {
          conversationID:
            this.$store.getters.storeCurrentConversation.conversationID,
          clientMsgID: message.clientMsgID,
        }).then(() => {
          count++;
          if (count === checkedMessages.length) {
            this.deleteMessages(checkedMessages);
            this.mutipleCheckUpdateHandler(false);
            uni.$u.toast("删除成功");
          }
        });
      });
    },
    forward(type) {
      const checkedMessages =
        this.$store.getters.storeHistoryMessageList.filter(
          (message) => message.checked,
        );
      if (checkedMessages.length === 0) {
        uni.$u.toast("请先选择要操作的消息");
        return;
      }

      const currentConversation = this.$store.getters.storeCurrentConversation;
      const title = currentConversation.groupID
        ? `群聊${currentConversation.showName}的聊天记录`
        : `和${currentConversation.showName}的聊天记录`;

      const mergeInfo = {
        messageList: [...checkedMessages],
        summaryList: checkedMessages.map(
          (message) => `${message.senderNickname}：${parseMessageByType(message)}`,
        ),
        title,
      };
      uni.navigateTo({
        url: `/pages/common/contactChoose/index?type=${type}&mergeInfo=${encodeURIComponent(JSON.stringify(mergeInfo))}`,
      });
    },
    async pageClick(e) {
      this.getEl(".message_menu_container").then((res) => {
        if (res) {
          this.menuOutsideFlag += 1;
        }
      });

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
      console.log("initSuccess");
      this.initLoading = false;
    },
    async getCheckedUsers(data) {
      this.$refs.chatingFooterRef.customEditorCtx.undo();
      for (const item of data) {
        this.$refs.chatingFooterRef.insertAt(item.userID, item.nickname);
        await uni.$u.sleep(200);
      }
    },

    // page event
    typingHandler() {
      this.$refs.chatingHeaderRef.updateTyping();
    },
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
    mutipleCheckUpdateHandler({ flag, message }) {
      this.mutipleCheckVisible = flag;
      // console.log('this.mutipleCheckVisible', flag, message)
      if (message) {
        this.$store.dispatch("message/updateOneMessage", {
          message: {
            ...message,
            checked: true,
          },
        });
      }
      if (!flag) {
        const tmpMessageList = [...this.$store.getters.storeHistoryMessageList];
        tmpMessageList.map((message) => (message.checked = false));
        this.$store.commit("message/SET_HISTORY_MESSAGE_LIST", tmpMessageList);
      }
    },
    setPageListener() {
      uni.$on(PageEvents.TypingUpdate, this.typingHandler);
      uni.$on(PageEvents.OnlineStateCheck, this.onlineCheckHandler);
      uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
      uni.$on(PageEvents.AtSomeOne, this.atSomeOneHandler);
      uni.$on(PageEvents.MutipleCheckUpdate, this.mutipleCheckUpdateHandler);
    },
    disposePageListener() {
      uni.$off(PageEvents.TypingUpdate, this.typingHandler);
      uni.$off(PageEvents.OnlineStateCheck, this.onlineCheckHandler);
      uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
      uni.$off(PageEvents.AtSomeOne, this.atSomeOneHandler);
      uni.$off(PageEvents.MutipleCheckUpdate, this.mutipleCheckUpdateHandler);
    },
    mutipleCheckUpdate() {
      this.mutipleCheckUpdateHandler({ flag: false });
    },
  },
  onBackPress() {
    if (!this.mutipleCheckVisible) {
      uni.switchTab({
        url: "/pages/conversation/conversationList/index",
      });
    } else {
      this.mutipleCheckUpdateHandler({ flag: false });
    }
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
