<template>
  <view class="conversation_container">
    <chat-header ref="chatHeaderRef" />
    <scroll-view
      class="scroll-view"
      scroll-y="true"
      refresher-enabled="true"
      :refresher-triggered="triggered"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scroll="scroll"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRestore"
			@scrolltolower="scrolltolower"
    >
      <u-swipe-action
        ref="swipeWrapperRef"
        class="swipe_wrapper"
        v-show="!storeIsSyncing"
      >
        <conversation-item
          v-for="item in storeConversationList"
          :key="item.conversationID"
          @closeAllSwipe="closeAllSwipe"
          :source="item"
          ref="conversationItem"
        />
      </u-swipe-action>
    </scroll-view>
    <view class="loading_wrap" v-if="storeProgress > 0 && storeProgress < 100">
      <u-loading-icon :vertical="true" :text="storeProgress+'%'"></u-loading-icon>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import ChatHeader from "./components/ChatHeader.vue";
import ConversationItem from "./components/ConversationItem.vue";

export default {
  components: {
    ChatHeader,
    ConversationItem,
  },
  data() {
    return {
      scrollTop: 0,
      old: {
        scrollTop: 0
      },
      lastClickTime: 0,
      doubleClick: 0,
      triggered: false,
      refreshing: false,
    };
  },
  computed: {
    ...mapGetters(["storeConversationList", "storeIsSyncing", "storeProgress"]),
  },
  onReady() {
    this.$nextTick(() => plus.navigator.closeSplashscreen());
  },
  onLoad() {
    this._freshing = false;
    this.triggered = true;
  },
  onTabItemTap(item) {
    const currentTime = Date.now();
    if (item.index == 0 && currentTime - this.lastClickTime < 300) {
      this.scrollToTop()
    } else {
      this.lastClickTime = currentTime;
    }
  },
  methods: {
    scroll(e) {
      this.old.scrollTop = e.detail.scrollTop
    },
    scrollToTop() {
      const conversationItem = this.$refs.conversationItem;
      if (conversationItem) {
        uni.createSelectorQuery()
          .in(this)
          .select(`.conversation_item`)
          .boundingClientRect(async (rect) => {
            if (rect) {
              const itemHeight = rect.height;
              const index = await this.getNextUnReadIndex(itemHeight)
              const totalHeight = itemHeight * index;
              this.scrollTop = this.old.scrollTop
              this.$nextTick(function() {
                this.scrollTop = totalHeight;
              });
            }
          })
          .exec();
      }
    },
    getNextUnReadIndex(itemHeight) {
      return new Promise((resolve) => {
        uni.createSelectorQuery()
          .in(this)
          .select('.scroll-view')
          .scrollOffset((res) => {
            let start = Math.ceil(res.scrollTop / itemHeight)

            if((res.scrollTop % itemHeight) === 0){
              start++
            }

            this.doubleClick = this.storeConversationList.slice(0, start).filter((item) => item.unreadCount > 0).length

            const unReadList = this.storeConversationList.filter((item) => item.unreadCount > 0)
            const current = unReadList[this.doubleClick %= unReadList.length]
            
            const index = this.storeConversationList.findIndex((item) => item.conversationID === current.conversationID)
            resolve(index);
          })
          .exec()
      });
    },
    onRefresh() {
      if (this._freshing) return;
      this._freshing = true;
      this.queryList(true)
    },
    onRestore() {
      this.triggered = 'restore';
      console.log("onRestore");
    },
    scrolltolower() {
      this.queryList()
    },
    async queryList(isFirstPage = false) {
      await this.$store.dispatch(
        "conversation/getConversationList",
        isFirstPage,
      );
      this.triggered = false;
      this._freshing = false;
    },
    closeAllSwipe() {
      this.$refs.swipeWrapperRef.closeAll();
    },
  },
};
</script>

<style lang="scss" scoped>
.conversation_container {
  @include colBox(false);
  height: 100vh;
  overflow-y: hidden;
}

.conversation_search {
  padding: 0 44rpx 24rpx;
}

.z-paging-content {
  flex: 1;
}

.swipe_wrapper {
  @include colBox(false);
  flex: 1;
  width: 100%;
  overflow-y: auto;
}

.scroll-view{
  height: 0;
  flex: 1;
}

.loading_wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/deep/.u-swipe-action-item__right__button__wrapper__text {
  -webkit-line-clamp: 2 !important;
  max-width: 32px;
}
</style>
