<template>
  <view class="bg_container" style="background: none !important;border: 1px solid #E8EAEF !important; width: 380rpx;" @click="doubleClick">
    <view class="announcement_title">
      <image src="@/static/images/chating_message_notice.png" mode=""></image>
      <text>群公告</text>
    </view>
    <view class="announcement_content">
      {{ getContent }}
    </view>
  </view>
</template>

<script>
export default {
  name: "GroupAnnounceRender",
  components: {},
  props: {
    message: Object,
  },
  data() {
    return {
	    lastTapDiffTime: 0
    };
  },
  computed: {
    getContent() {
      let detail = {};
      try {
        detail = JSON.parse(this.message.notificationElem.detail);
      } catch (e) {}

      return detail.group?.notification ?? "";
    },
  },
  methods: {
    doubleClick() {
      const curTime = new Date().getTime();
      const lastTime = this.lastTapDiffTime;

      this.lastTapDiffTime = curTime;

      const diff = curTime - lastTime;
      if (diff < 300) {
        uni.navigateTo({
          url: `/pages/conversation/groupAnnouncement/index`,
        });
      }   
    }
  },
};
</script>

<style lang="scss" scoped>
.announcement_title {
  display: flex;
  align-items: center;
  color: #666;

  image {
    margin-right: 8rpx;
    width: 16px;
    height: 16px;
  }
}

.announcement_content {
  max-width: 70vw;
  word-break: break-all;
  overflow: hidden;
  margin-top: 12rpx;
}
</style>
