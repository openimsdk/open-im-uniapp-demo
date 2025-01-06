<template>
  <web-view :src="linkUrl"></web-view>
</template>

<script>
export default {
  data() {
    return {
      linkUrl: "",
    };
  },
  onShow() {
    this.linkUrl = 'https://doc.rentsoft.cn/'
  },
  onReady() {
    // #ifdef APP-PLUS
    setTimeout(() => {
      this.$scope
        .$getAppWebview()
        .children()[0]
        .setStyle({
          top: uni.getWindowInfo().statusBarHeight,
          height: uni.getWindowInfo().safeArea.height,
        });
    });
    // #endif
  },
};
</script>

<style lang="scss"></style>
