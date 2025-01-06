<template>
  <view class="page_container">
    <custom-nav-bar :title="title" />

    <u-list class="message_list" height="1">
      <u-list-item v-for="message in mergeList" :key="message.clientMsgID">
        <nomal-message-item @click="clickMessage" :source="message" />
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { myPreview } from "@/util/preview";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import NomalMessageItem from "./NomalMessageItem.vue";
import { MessageType } from "openim-uniapp-polyfill";
export default {
  components: {
    CustomNavBar,
    NomalMessageItem,
  },
  data() {
    return {
      mergeList: [],
      title: "",
    };
  },
  onLoad(options) {
    try {
      const mergeData = JSON.parse(decodeURIComponent(options.mergeData));
      this.mergeList = mergeData.multiMessage;
      this.title = mergeData.title;
    } catch (e) {}
  },
  methods: {
    clickMessage(message) {
      switch (message.contentType) {
        case MessageType.PictureMessage:
          // uni.previewImage({
          //   urls: [message.pictureElem.sourcePicture.url],
          // });
          myPreview(0, [message.pictureElem.sourcePicture.url])
          break;
        case MessageType.VideoMessage:
          uni.$u.route("/pages/conversation/previewVideo/index", {
            previewVideoUrl: message.videoElem.videoUrl,
          });
          break;
        case MessageType.CardMessage:
          uni.$u.route("/pages/common/userCard/index", {
            sourceID: message.cardElem.userID,
          });
          break;
        case MessageType.LocationMessage:
          let locationInifo = {};
          try {
            locationInifo = JSON.parse(message.locationElem.description);
          } catch (e) {}
          if (!locationInifo.latng) return;

          uni.$u.route("/pages/conversation/previewLocation/index", {
            latng: locationInifo.latng,
          });
          break;
        case MessageType.MergeMessage:
          uni.$u.route("/pages/conversation/previewMerge/index", {
            mergeData: encodeURIComponent(JSON.stringify(message.mergeElem)),
          });
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f8f8;

  .message_list {
    flex: 1;
    margin-top: 24rpx;
  }
}
</style>
