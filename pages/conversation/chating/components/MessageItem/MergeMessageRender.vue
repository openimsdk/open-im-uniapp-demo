<template>
  <view @click="toPreview" class="merge_message_container">
    <view class="merge_title">
      <text>{{ title }}</text>
    </view>
    <view class="merge_desc">
      <text
        v-for="(item, idx) in message.mergeElem.abstractList"
        v-if="idx < 4"
        :key="idx"
        class="merge_item"
      >
        {{ item }}
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: "CardMessageRender",
  components: {},
  props: {
    message: Object,
  },
  data() {
    return {};
  },
  computed: {
    title() {
      // const sessionType = this.message.mergeElem.multiMessage[0].sessionType;
      // if (sessionType === 1) {
      //   return this.message.mergeElem.title;
      // }
      return this.message.mergeElem.title;
    },
  },
  methods: {
    toPreview() {
      uni.$u.route("/pages/conversation/previewMerge/index", {
        mergeData: encodeURIComponent(JSON.stringify(this.message.mergeElem)),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.merge_message_container {
  padding: 0 !important;
  width: 444rpx;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  border-radius: 12rpx;
  border: 1px solid #ececec;
  background: #fff;

  .merge_title {
    padding: 12rpx 24rpx;
    border-bottom: 1px solid #ececec;

    text {
      @include ellipsisWithLine(1);
    }
  }

  .merge_desc {
    @include colBox(false);
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    color: #666;

    .merge_item {
      @include ellipsisWithLine(3);
      padding: 4rpx 0;
    }
  }
}
</style>
