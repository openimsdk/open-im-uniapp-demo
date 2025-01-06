<template>
  <view
    :style="{ left: getLeft, right: getRight }"
    class="message_menu_container"
    :class="{ message_menu_container_bottom: is_bottom }"
  >
    <view
      class="message_menu_item"
      v-for="item in menuList"
      v-if="item.visible"
      @click="menuClick(item)"
      :key="item.idx"
    >
      <image :src="item.icon" alt="" srcset="" />
      <text>{{ item.title }}</text>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { MessageMenuTypes, ContactChooseTypes, PageEvents } from "@/constant";
import IMSDK, {
  GroupMemberRole,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import { parseAt } from '@/util/imCommon'

import copy from "@/static/images/chating_message_copy.png";
import forward from "@/static/images/chating_message_forward.png";
import reply from "@/static/images/chating_message_reply.png";
import revoke from "@/static/images/chating_message_revoke.png";
import multiple from "@/static/images/chating_message_multiple.png";
import del from "@/static/images/chating_message_del.png";

const canCopyTypes = [
  MessageType.TextMessage,
  MessageType.AtTextMessage,
  MessageType.QuoteMessage,
];

export default {
  components: {},
  props: {
    message: {
      type: Object,
    },
    is_bottom: {
      type: Boolean,
      default: true,
    },
    isSender: Boolean,
    paterWidth: Number,
  },
  data() {
    return {
      contentType: null
    };
  },
  computed: {
    ...mapGetters(["storeCurrentMemberInGroup", "storeCurrentUserID"]),
    getLeft() {
      // 145 + 145*0.2
      if (this.isSender && this.paterWidth < 174) {
        return "auto";
      }
      if (!this.isSender && this.paterWidth < 174) {
        return "0";
      }
      return "20%";
    },
    getRight() {
      if (this.isSender && this.paterWidth < 174) {
        return "0";
      }
      return "auto";
    },
    canRevoke() {
      const interval = this.message.sendTime < Date.now() - 5 * 60 * 1000;
      if (interval) {
        return false;
      }
      if (
        this.message.sessionType !== SessionType.Single &&
        this.storeCurrentMemberInGroup.roleLevel !== GroupMemberRole.Nomal
      ) {
        return true;
      }

      return this.isSender;
    },
    menuList() {
      return [
        {
          idx: 0,
          type: MessageMenuTypes.Copy,
          title: "复制",
          icon: copy,
          visible: canCopyTypes.includes(this.message.contentType),
        },
        {
          idx: 1,
          type: MessageMenuTypes.Del,
          title: "删除",
          icon: del,
          visible: true,
        },
        {
          idx: 2,
          type: MessageMenuTypes.Forward,
          title: "转发",
          icon: forward,
          visible: true,
        },
        {
          idx: 4,
          type: MessageMenuTypes.Revoke,
          title: "撤回",
          icon: revoke,
          visible: this.canRevoke,
        },
      ];
    },
  },
  mounted() {
    this.contentType = this.message.contentType
  },
  methods: {
    ...mapActions("message", ["deleteMessages", "updateOneMessage", "updateQuoteMessageRevoke"]),
    ...mapActions("conversation"),
    menuClick({ type }) {
      switch (type) {
        case MessageMenuTypes.Copy:
          uni.setClipboardData({
            data: this.getCopyText(),
            success: () => {
              uni.hideToast();
              this.$nextTick(() => {
                uni.$u.toast("复制成功");
              });
            },
          });
          break;
        case MessageMenuTypes.Del:
          IMSDK.asyncApi(IMSDK.IMMethods.DeleteMessage, IMSDK.uuid(), {
            conversationID:
              this.$store.getters.storeCurrentConversation.conversationID,
            clientMsgID: this.message.clientMsgID,
          })
            .then(() => {
              this.deleteMessages([this.message]);
              uni.$u.toast("删除成功");
            })
            .catch(() => uni.$u.toast("删除失败"));
          break;
        case MessageMenuTypes.Forward:
          uni.navigateTo({
            url: `/pages/common/contactChoose/index?type=${
              ContactChooseTypes.ForWard
            }&forwardMessage=${encodeURIComponent(JSON.stringify(this.message))}`,
          });
          break;
        case MessageMenuTypes.Revoke:
          IMSDK.asyncApi(IMSDK.IMMethods.RevokeMessage, IMSDK.uuid(), {
            conversationID:
              this.$store.getters.storeCurrentConversation.conversationID,
            clientMsgID: this.message.clientMsgID,
          })
            .then(() => {
              this.updateOneMessage({
                message: {
                  ...this.message,
                  contentType: MessageType.RevokeMessage,
                  notificationElem: {
                    detail: JSON.stringify({
                      clientMsgID: this.message.clientMsgID,
                      revokeTime: Date.now(),
                      revokerID: this.storeCurrentUserID,
                      revokerNickname: "你",
                      revokerRole: 0,
                      seq: this.message.seq,
                      sessionType: this.message.sessionType,
                      sourceMessageSendID: this.message.sendID,
                      sourceMessageSendTime: this.message.sendTime,
                      sourceMessageSenderNickname: this.message.senderNickname,
                    }),
                  },
                },
              });
              this.updateQuoteMessageRevoke({
                clientMsgID: this.message.clientMsgID
              })
            })
            .catch(() => uni.$u.toast("撤回失败"));
          break;
        default:
          break;
      }
      this.$emit("close");
    },
    getCopyText() {
      if (this.message.contentType === MessageType.AtTextMessage) {
        return parseAt(this.message.atTextElem, true);
      }
      if (this.message.contentType === MessageType.QuoteMessage) {
        return this.message.quoteElem.text;
      }
      return this.message.textElem.content;
    },
  },
};
</script>

<style scoped lang="scss">
.message_menu_container {
  display: flex;
  flex-wrap: wrap;
  min-width: 145px;
  max-width: 145px;
  background-color: #5b5b5b;
  padding: 12px 20px;
  padding-bottom: 0;
  border-radius: 8px;
  position: absolute;
  top: -12px;
  // left: 0%;
  transform: translateY(-100%);
  z-index: 9;

  &_bottom {
    top: unset;
    bottom: 0;
    transform: translateY(110%);
  }

  .message_menu_item {
    @include colBox(false);
    align-items: center;
    font-size: 12px;
    color: #fff;
    padding-right: 16px;
    padding-bottom: 12px;

    &:nth-child(4n) {
      padding-right: 0;
    }

    image {
      width: 17px;
      height: 19px;
      margin-bottom: 4px;
    }
  }
}
</style>
