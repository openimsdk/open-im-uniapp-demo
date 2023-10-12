<template>
  <u-list class="generic_list" height="1">
    <view class="generic_list_card">
      <u-list-item
        @scrolltolower="scrolltolower"
        lowerThreshold="100"
        v-for="item in genericList"
        :key="item.userID || item.groupID || item.conversationID"
      >
        <global-result-item :item="item" :isFile="isFile" />
      </u-list-item>
    </view>
  </u-list>
</template>

<script>
import GlobalResultItem from "./GlobalResultItem.vue";

export default {
  name: "",
  components: {
    GlobalResultItem,
  },
  props: {
    genericList: {
      type: Array,
      default: () => [],
    },
    isFile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  methods: {
    scrolltolower() {
      this.$emit("scrolltolower");
    },
  },
};
</script>

<style lang="scss" scoped>
.generic_list {
  flex: 1;

  &_card {
    margin: 24rpx;
    border-radius: 6px;
    overflow: hidden;
  }
}
</style>
