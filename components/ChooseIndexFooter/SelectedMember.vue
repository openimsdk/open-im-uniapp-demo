<template>
  <view class="selected_item">
    <view class="left_info">
      <my-avatar
        :src="source.faceURL"
        :desc="source.nickname || source.showName"
        :isGroup="Boolean(source.groupID)"
        size="42"
      />
      <text>{{ source.nickname || source.groupName || source.showName }}</text>
    </view>
    <view>
      <u-button @click="action" plain text="移除" type="primary" />
    </view>
  </view>
</template>

<script>
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  name: "",
  components: {
    MyAvatar,
  },
  props: {
    source: Object,
  },
  data() {
    return {};
  },
  methods: {
    action() {
      this.$emit("removeItem");
    },
  },
  mounted() {
    console.log(this.source);
  },
};
</script>

<style lang="scss" scoped>
.selected_item {
  @include btwBox();
  padding: 20rpx 0;

  .left_info {
    @include vCenterBox();

    .u-avatar {
      margin-right: 24rpx;
    }
  }

  .u-button {
    height: 48rpx;
  }
}
</style>
