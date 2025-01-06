<template>
  <view class="text_message_container bg_container">
    <mp-html
      @linktap="navigate"
      :previewImg="false"
      :showImgMenu="false"
      :lazyLoad="false"
      :content="getContent"
    />
    <!-- <u-parse :imgOptions="false" @navigate="navigate" :content="getContent" /> -->
  </view>
</template>

<script>
import { parseBr } from "@/util/common";
import { parseAt, parseLink } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";

export default {
  name: "TextMessageRender",
  components: {},
  props: {
    message: Object,
  },
  computed: {
    getContent() {
      if (this.message.contentType === MessageType.QuoteMessage) {
        return this.message.quoteElem.text;
      }
      if (this.message.contentType === MessageType.AtTextMessage) {
        return parseAt(this.message.atTextElem);
      }
      return parseLink(parseBr(this.message.textElem?.content));
    },
  },
  data() {
    return {};
  },
  methods: {
    navigate(link) {
      // console.log(link);
      if (link.innerText.includes("@")) {
        this.$emit("showInfo", link.href);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
