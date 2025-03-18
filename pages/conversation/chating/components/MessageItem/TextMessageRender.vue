<template>
  <view class="text_message_container bg_container">
    <mp-html
      :previewImg="false"
      :showImgMenu="false"
      :lazyLoad="false"
      :content="getContent"
    />
  </view>
</template>

<script>
import { parseBr } from "@/util/common";

export default {
  name: "TextMessageRender",
  components: {},
  props: {
    message: Object,
  },
  computed: {
    getContent() {
      return parseBr(this.message.textElem?.content);
    },
  },
  data() {
    return {};
  },
  methods: {
    
  },
};
</script>

<style lang="scss" scoped></style>
