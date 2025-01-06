<template>
  <view class="page_container">
    <custom-nav-bar :title="storeCurrentConversation.showName" />

    <u-list
      @scrolltolower="scrolltolower"
      lowerThreshold="100"
      class="notify_list"
      height="1"
    >
      <u-list-item v-for="message in getRenderList" :key="message.clientMsgID">
        <notify-message-render :source="message" />
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import NotifyMessageRender from "./NotifyMessageRender.vue";
export default {
  components: {
    CustomNavBar,
    NotifyMessageRender,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeHistoryMessageList",
      "storeHasMoreMessage",
      "storeCurrentUserID",
    ]),
    getRenderList() {
      return this.storeHistoryMessageList.reverse();
    },

  },
  onLoad() {
    this.loadMessageList();
  },
  onUnload() {
    this.resetConversationState();
    this.resetMessageState();
  },
  methods: {
    ...mapActions("conversation", ["resetConversationState"]),
    ...mapActions("message", ["getHistoryMesageList", "resetMessageState"]),
    scrolltolower() {
      if (!this.loading && this.storeHasMoreMessage) {
        this.loadMessageList(true);
      }
    },
    async loadMessageList(isLoadMore = false) {
      this.loading = true;
      const options = {
        conversationID: this.storeCurrentConversation.conversationID,
        userID: "",
        groupID: "",
        count: 20,
        startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
        lastMinSeq: 0,
      };
      try {
        const { emptyFlag } = await this.getHistoryMesageList(options);
      } catch (e) {
        console.log(e);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f8f8f8;

  .notify_list {
    flex: 1;
    margin-top: 24rpx;
  }
}
</style>
