<template>
  <view @click="toDetails" class="location_message_container">
    <view class="desc_container">
      <view class="location_title">
        {{ locationDetails.name }}
      </view>
      <view class="location_subTitle">
        {{ locationDetails.addr }}
      </view>
    </view>
    <u--image
      :showLoading="true"
      :src="locationDetails.url"
      width="444rpx"
      height="222rpx"
      @click="toDetails"
    ></u--image>
  </view>
</template>

<script>
import { PageEvents } from "@/constant";
export default {
  name: "LocationMessageRender",
  components: {},
  props: {
    message: Object,
  },
  computed: {
    locationDetails() {
      let info = {};
      try {
        info = JSON.parse(this.message.locationElem.description);
      } catch (e) {}
      return info;
    },
  },
  data() {
    return {};
  },
  methods: {
    toDetails() {
      uni.navigateTo({
        url: `/pages/conversation/previewLocation/index?latng=${this.locationDetails.latng}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.location_message_container {
  width: 444rpx;
  border-radius: 12rpx;
  border: 1px solid #e6e6e6;
  background-color: #fff !important;

  .location_title,
  .location_subTitle {
    @include nomalEllipsis();
    color: #0c1c33;
  }

  .location_subTitle {
    font-size: 24rpx;
    color: #999;
  }

  .desc_container {
    padding: 24rpx;
  }
}
</style>
