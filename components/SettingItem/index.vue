<template>
  <view
    @click="onClick"
    class="setting_item"
    :class="{ setting_item_border: border }"
  >
    <text :style="{ color: danger ? '#FF381F' : '$uni-text-color' }">{{
      title
    }}</text>
    <u-switch
      :loading="loading"
      @change="onChange"
      :asyncChange="true"
      v-if="is_switch"
      size="20"
      :value="switchValue"
    />
    <view v-else class="setting_right">
      <slot></slot>
      <u-icon v-if="arrow" name="arrow-right" color="#999" size="18" />
    </view>
  </view>
</template>

<script>
export default {
  name: "",
  components: {},
  props: {
    title: String,
    danger: {
      type: Boolean,
      default: false,
    },
    is_switch: {
      type: Boolean,
      default: false,
    },
    switchValue: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: true,
    },
    arrow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    onClick() {
      this.$emit("click");
    },
    onChange(value) {
      this.$emit("switch", value);
    },
  },
};
</script>

<style lang="scss" scoped>
.setting_item {
  @include btwBox();
  padding: 24rpx 36rpx;
  color: $uni-text-color;

  .setting_right {
    @include vCenterBox();
  }

  &_border {
    border-bottom: 1px solid rgba(153, 153, 153, 0.2);
  }
}
</style>
