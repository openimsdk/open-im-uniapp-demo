<template>
  <u-avatar
    @longpress="longpress"
    @click="click"
    @onError="errorHandle"
    :src="getAvatarUrl"
    :text="avatarText"
    bgColor="#0089FF"
    :defaultUrl="getDdefaultUrl"
    :shape="shape"
    :size="size"
    mode="aspectFill"
    font-size="14"
  >
  </u-avatar>
</template>

<script>
import defaultGroupIcon from "static/images/contact_my_group.png";
import defaultNotifyIcon from "static/images/default_notify_icon.png";
export default {
  name: "MyAvatar",
  props: {
    src: String,
    shape: {
      type: String,
      default: "square",
    },
    size: {
      type: String,
      default: "40",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    isNotify: {
      type: Boolean,
      default: false,
    },

    desc: String,
  },
  data() {
    return {
      avatarText: undefined,
    };
  },
  computed: {
    getAvatarUrl() {
      if (this.src) {
        return this.src;
      }
      if (this.isGroup) {
        return defaultGroupIcon;
      }
      if (this.isNotify) {
        return defaultNotifyIcon;
      }
      this.avatarText = this.desc ? this.desc.slice(0, 1) : "未知";
      return "";
    },
    getDdefaultUrl() {
      return this.isGroup ? defaultGroupIcon : undefined;
    },
  },
  methods: {
    errorHandle() {
      this.avatarText = this.desc ? this.desc.slice(0, 1) : "未知";
    },
    redirectShow() {
      if (this.avatarText) {
        this.avatarText = undefined;
      }
    },
    click() {
      this.$emit("click");
    },
    longpress() {
      this.$emit("longpress");
    },
  },
  watch: {
    src() {
      this.redirectShow();
    },
    desc() {
      this.redirectShow();
    },
  },
};
</script>

<style></style>
