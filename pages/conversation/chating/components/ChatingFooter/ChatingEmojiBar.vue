<template>
  <view class="chat_emoji_bar">
    <u-row class="emoji_row">
      <u-col
        @click="clickEmoji(emoji)"
        v-for="emoji in emojiList"
        :key="emoji"
        :id="emoji"
        span="2"
        style="display: flex;justify-content: center;align-items: center;"
      >
        <text style="font-size: 20px;margin-bottom: 6px;">{{ emoji }}</text>
      </u-col>
    </u-row>
  </view>
</template>

<script>
import emojis from "@/common/emojis.js";
export default {
  components: {},
  data() {
    return {};
  },
  computed: {
    emojiList() {
      return emojis;
    },
  },
  mounted() {},
  methods: {
    clickEmoji(emoji) {
      this.$emit("insertEmoji", emoji);
    },
    backspace() {
      this.$emit("backspace");
    },
  },
};
</script>

<style lang="scss" scoped>
.chat_emoji_bar {
  padding: 24rpx 36rpx;
  position: relative;

  .emoji_row {
    flex-wrap: wrap;
    margin-bottom: 12rpx;
  }
}
</style>
