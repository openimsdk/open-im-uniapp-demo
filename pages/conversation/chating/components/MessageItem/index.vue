<template>
  <view
    v-if="!getNoticeContent"
    @click="clickMessageItem"
    :id="`auchor${source.clientMsgID}`"
    class="message_item"
    :class="{ message_item_self: isSender, message_item_active: isActive }"
  >
    <view
      v-if="mutipleCheckVisible"
      class="check_wrap"
      :class="{ check_wrap_active: source.checked, check_wrap_disabled: canMutipleCheck }"
    >
      <u-icon
        v-show="source.checked"
        name="checkbox-mark"
        size="12"
        color="#fff"
      />
    </view>
    <my-avatar
      @click="showInfo"
      size="42"
      :desc="announcePublisher.nickname || source.senderNickname"
      :src="announcePublisher.faceURL || source.senderFaceUrl"
    />
    <view class="message_container">
      <view class="message_sender" :style="{ 'flex-direction': !isSender ? 'row-reverse' : 'row' }" >
        <text>{{ formattedMessageTime }}</text>
        <text style="margin-left: 2rpx;margin-right: 2rpx;">{{ '' }}</text>
        <text v-if="!isSingle">{{ announcePublisher.nickname || source.senderNickname }}</text>
      </view>
      <view class="message_send_state_box">
        <view style="height: 100%;display: flex;justify-items: center;align-items: center;">
          <view class="message_send_state">
            <u-loading-icon v-if="showSending && !isPreview" />
            <image
              @click="reSendMessage"
              v-if="isFailedMessage && !isPreview"
              src="@/static/images/chating_message_failed.png"
            />
            <text v-if="readLimitSensitive" class="read_limit_count">{{
              `${count}s`
            }}</text>
          </view>
        </view>
        <view
          @longpress.prevent="showMenu"
          class="message_content_wrap message_content_wrap_shadow"
        >
          <text-message-render
            v-if="showTextRender"
            :message="source"
            @showInfo="showInfo"
          />
          <media-message-render v-else-if="showMediaRender" :message="source" />
          <audio-message-render
            v-else-if="showAudioRender"
            :message="source"
            :isSender="isSender"
          />
          <face-message-render v-else-if="showFaceRender" :message="source" />
          <file-message-render v-else-if="showFileRender" :message="source" />
          <card-message-render v-else-if="showCardRender" :message="source" />
          <merge-message-render v-else-if="showMergeRender" :message="source" />
          <location-message-render
            v-else-if="showLocationRender"
            :message="source"
          />
          <group-announce-render
            v-else-if="showGroupAnnouncement"
            :message="source"
          />
          <error-message-render v-else />
        </view>
      </view>
      
      <quote-message-render :message="source" v-if="isQuoteMessage" />

      <transition name="fade">
        <message-menu
          v-if="menuState.visible"
          :message="source"
          :isSender="isSender"
          :is_bottom="menuState.isBottom"
          :paterWidth="menuState.paterWidth"
          @close="menuState.visible = false"
        />
      </transition>
    </view>
  </view>

  <view
    v-else
    class="notice_message_container"
    :id="`auchor${source.clientMsgID}`"
  >
    <!-- <text>{{ getNoticeContent }}</text> -->
    <mp-html
      @linktap="navigate"
      :previewImg="false"
      :showImgMenu="false"
      :lazyLoad="false"
      :content="getNoticeContent"
    />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, {
  AllowType,
  IMMethods,
  MessageStatus,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import ChatingList from "../ChatingList.vue";
import TextMessageRender from "./TextMessageRender.vue";
import MediaMessageRender from "./MediaMessageRender.vue";
import AudioMessageRender from "./AudioMessageRender.vue";
import FaceMessageRender from "./FaceMessageRender.vue";
import FileMessageRender from "./FileMessageRender.vue";
import CardMessageRender from "./CardMessageRender.vue";
import MergeMessageRender from "./MergeMessageRender.vue";
import QuoteMessageRender from "./QuoteMessageRender.vue";
import LocationMessageRender from "./LocationMessageRender.vue";
import GroupAnnounceRender from "./GroupAnnounceRender.vue";
import ErrorMessageRender from "./ErrorMessageRender.vue";
import MessageMenu from "./MessageMenu.vue";
import {
  CustomType,
  noticeMessageTypes,
  PageEvents,
  UpdateMessageTypes,
} from "@/constant";
import { tipMessaggeFormat, offlinePushInfo, formatMessageTime } from "@/util/imCommon";

const textRenderTypes = [
  MessageType.TextMessage,
  MessageType.AtTextMessage,
  MessageType.QuoteMessage,
];

const mediaRenderTypes = [MessageType.VideoMessage, MessageType.PictureMessage];

export default {
  components: {
    MyAvatar,
    TextMessageRender,
    MediaMessageRender,
    AudioMessageRender,
    FaceMessageRender,
    FileMessageRender,
    CardMessageRender,
    MergeMessageRender,
    QuoteMessageRender,
    LocationMessageRender,
    GroupAnnounceRender,
    ErrorMessageRender,
    MessageMenu,
  },
  props: {
    source: Object,
    isSender: {
      type: Boolean,
      default: false,
    },
    mutipleCheckVisible: {
      type: Boolean,
      default: false,
    },
    menuOutsideFlag: Number,
    isPreview: Boolean,
    isActive: Boolean,
  },
  data() {
    return {
      menuState: {
        visible: false,
        isBottom: false,
        paterWidth: false,
        sendingDelay: true,
      },
      count: 30,
      timer: null,
      announcePublisher: {},
      conversationID: "",
    };
  },
  computed: {
    ...mapGetters(["storeCurrentConversation", "storeSelfInfo", "storeRevokeMap"]),
    isSingle() {
      return this.storeCurrentConversation.conversationType === SessionType.Single;
    },
    formattedMessageTime() {
      return formatMessageTime(this.source.sendTime);
    },
    showTextRender() {
      return textRenderTypes.includes(this.source.contentType);
    },
    showMediaRender() {
      return mediaRenderTypes.includes(this.source.contentType);
    },
    showAudioRender() {
      return this.source.contentType === MessageType.VoiceMessage;
    },
    showFaceRender() {
      return this.source.contentType === MessageType.FaceMessage;
    },
    showFileRender() {
      return this.source.contentType === MessageType.FileMessage;
    },
    showCardRender() {
      return this.source.contentType === MessageType.CardMessage;
    },
    showMergeRender() {
      return this.source.contentType === MessageType.MergeMessage;
    },
    showLocationRender() {
      return this.source.contentType === MessageType.LocationMessage;
    },
    showGroupAnnouncement() {
      return this.source.contentType === MessageType.GroupAnnouncementUpdated;
    },
    getNoticeContent() {
      if (this.showGroupAnnouncement) {
        return "";
      }
      const isNoticeMessage = noticeMessageTypes.includes(
        this.source.contentType,
      );
      return !isNoticeMessage
        ? ""
        : tipMessaggeFormat(
            this.source,
            this.$store.getters.storeCurrentUserID,
          );
    },
    isQuoteMessage() {
      return (
        this.source.contentType === MessageType.QuoteMessage ||
        this.source.atTextElem?.quoteMessage
      );
    },
    isSuccessMessage() {
      return this.source.status === MessageStatus.Succeed;
    },
    isFailedMessage() {
      return this.source.status === MessageStatus.Failed;
    },
    showSending() {
      return this.source.status === MessageStatus.Sending && !this.sendingDelay;
    },
    readLimitSensitive() {
      return (
        this.source.attachedInfoElem?.isPrivateChat &&
        this.source.isRead &&
        !this.isPreview
      );
    },
    canMutipleCheck() {
      return this.source.disabled || this.source.contentType === MessageType.GroupAnnouncementUpdated;
    },
  },
  mounted() {
    this.$emit("messageItemRender", this.source.clientMsgID);
    this.isReadObserver();
    this.setSendingDelay();
    this.count = this.source.attachedInfoElem?.burnDuration || 30;
    this.conversationID =
      this.$store.getters.storeCurrentConversation.conversationID;
  },
  beforeDestroy() {
    if (this.count !== 0 && !this.isPreview) {
      this.checkPrivateMessage();
    }
  },
  watch: {
    menuOutsideFlag(newVal) {
      if (this.menuState.visible) {
        this.menuState.visible = false;
      }
    },
    readLimitSensitive: {
      handler(newVal) {
        if (newVal) {
          this.startCount();
        }
      },
      immediate: true,
    },
    showGroupAnnouncement: {
      handler(newVal) {
        if (newVal) {
          this.getAnnouncementPublisher();
        }
      },
      immediate: true,
    },
  },
  methods: {
    navigate(link) {
      this.showInfo(link.href);
    },
    reSendMessage() {
      this.$store.dispatch("message/updateOneMessage", {
        message: this.source,
        type: UpdateMessageTypes.KeyWords,
        keyWords: [
          {
            key: "status",
            value: MessageStatus.Sending,
          },
        ],
      });
      IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
        recvID: this.storeCurrentConversation.userID,
        groupID: this.storeCurrentConversation.groupID,
        message: this.source,
        offlinePushInfo,
      })
        .then(({ data }) => {
          this.$store.dispatch("message/updateOneMessage", {
            message: data,
            isSuccess: true,
          });
        })
        .catch(({ data, errCode, errMsg }) => {
          this.$store.dispatch("message/updateOneMessage", {
            message: data,
            type: UpdateMessageTypes.KeyWords,
            keyWords: [
              {
                key: "status",
                value: MessageStatus.Failed,
              },
              {
                key: "errCode",
                value: errCode,
              },
            ],
          });
        });
    },
    async showMenu() {
      if (this.isPreview || this.showGroupAnnouncement) {
        return;
      }
      this.$emit("closeMune");
      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select(".message_content_wrap")
          .boundingClientRect((res) => {
            console.log(res.top);
            this.menuState.paterWidth = res.width;
            this.menuState.isBottom = res.top < 250;
            this.menuState.visible = true;
          })
          .exec();
      });
    },
    getAnnouncementPublisher() {
      let group = {};
      try {
        group = JSON.parse(this.source.notificationElem.detail).group;
      } catch (e) {}
      if (!group.notificationUserID) return;
      IMSDK.asyncApi(
        IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
        IMSDK.uuid(),
        {
          groupID: group.groupID,
          userIDList: [group.notificationUserID],
        },
      ).then(({ data }) => (this.announcePublisher = data[0] ?? {}));
    },
    checkPrivateMessage() {
      if (this.source.attachedInfoElem?.isPrivateChat) {
        this.clearPrivateMessage();
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    startCount() {
      this.timer = setInterval(() => {
        if (this.count > 0) {
          this.count -= 1;
        } else {
          this.checkPrivateMessage();
        }
      }, 1000);
    },
    clearPrivateMessage() {
      IMSDK.asyncApi(IMSDK.IMMethods.DeleteMessage, IMSDK.uuid(), {
        conversationID: this.conversationID,
        clientMsgID: this.source.clientMsgID,
      })
        .then(() => {
          this.$store.dispatch("message/deleteMessages", [this.source]);
        })
        .catch(() => uni.$u.toast("删除失败"));
    },
    setSendingDelay() {
      if (this.source.status === MessageStatus.Sending) {
        setTimeout(() => {
          this.sendingDelay = false;
        }, 2000);
      }
    },
    isReadObserver() {
      const isNoticeMessage = noticeMessageTypes.includes(
        this.source.contentType,
      );
      if (
        this.isPreview ||
        (this.isSender && !isNoticeMessage) ||
        this.source.isRead === true ||
        this.source.sessionType === SessionType.Notification
      ) {
        return;
      }

      const observer = uni.createIntersectionObserver(ChatingList);
      observer
        .relativeTo("#scroll_view")
        .observe(
          `#auchor${this.source.clientMsgID}`,
          ({ intersectionRatio }) => {
            if (intersectionRatio > 0) {
              if (this.source.isAppend) {
                this.$store.dispatch("message/updateOneMessage", {
                  message: this.source,
                  type: UpdateMessageTypes.KeyWords,
                  keyWords: {
                    key: "isAppend",
                    value: false,
                  },
                });
              }
              // if (!isNoticeMessage) {
              //   IMSDK.asyncApi(
              //     IMSDK.IMMethods.MarkMessagesAsReadByMsgID,
              //     IMSDK.uuid(),
              //     {
              //       conversationID: this.$store.getters.storeCurrentConversation.conversationID,
              //       clientMsgIDList: [this.source.clientMsgID]
              //     }).then(() => (this.source.isRead = true));
              // }

              observer.disconnect();
            }
          },
        );
    },
    showInfo(userID) {
      if (this.showGroupAnnouncement || this.isPreview) {
        return;
      }

      const sourceID = userID ?? this.source.sendID;

      if (this.source.sessionType === SessionType.Single) {
        uni.navigateTo({
          url: `/pages/common/userCard/index?sourceID=${sourceID}`,
        });
      } else {
        if (
          this.$store.getters.storeCurrentGroup.lookMemberInfo ===
          AllowType.NotAllowed
        ) {
          return;
        }
        IMSDK.asyncApi(
          IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
          IMSDK.uuid(),
          {
            groupID: this.source.groupID,
            userIDList: [sourceID],
          },
        ).then(({ data }) => {
          const member = data[0];
          uni.$u.route("/pages/common/userCard/index", {
            sourceID,
            memberInfo: member ? JSON.stringify(member) : "",
            disableAdd:
              this.$store.getters.storeCurrentGroup.applyMemberFriend ===
              AllowType.NotAllowed,
          });
        });
      }
    },
    clickMessageItem() {
      if (this.mutipleCheckVisible && !this.canMutipleCheck) {
        this.$store.dispatch("message/updateOneMessage", {
          message: {
            ...this.source,
            checked: !this.source.checked,
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.message_item {
  display: flex;
  flex-direction: row;
  padding: 16rpx 44rpx;
  // padding-top: 48rpx;
  position: relative;

  .check_wrap {
    @include centerBox();
    box-sizing: border-box;
    width: 40rpx;
    min-width: 40rpx;
    height: 40rpx;
    min-height: 40rpx;
    border: 2px solid #979797;
    border-radius: 50%;
    margin-top: 16rpx;
    margin-right: 24rpx;

    &_active {
      background-color: #1d6bed;
      border: none;
    }

    &_disabled {
      background-color: #c8c9cc;
    }
  }

  .message_container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 20rpx;
    // text-align: start;
    max-width: 80%;
    position: relative;

    .message_sender {
      @include nomalEllipsis();
      display: flex;
      max-width: 480rpx;
      // font-size: 24rpx;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 6rpx;
    }

    .message_content_wrap {
      @include vCenterBox();
      text-align: start;
      // font-size: 14px;
      color: $uni-text-color;
      width: fit-content;
      max-width: 100%;

      .bg_container {
        padding: 16rpx 24rpx;
        border-radius: 0rpx 12rpx 12rpx 12rpx;
        background-color: #f0f0f0;
      }
    }
  }

  .message_send_state_box{
    display: flex;
    flex-direction: row-reverse;
  }

  .message_send_state {
    @include centerBox();
    margin-left: 12rpx;
    // margin-top: 48rpx;
    width: 48rpx;
    height: 48rpx;

    .read_limit_count {
      // font-size: 24rpx;
      font-size: 0.85rem;
      color: #999;
    }

    image {
      width: 16px;
      height: 16px;
    }
  }

  /deep/.emoji_display {
    width: 24px;
    height: 18px;
    vertical-align: sub;
  }

  &_self {
    flex-direction: row-reverse;

    .check_wrap {
      margin-right: 0;
      margin-left: 24rpx;
    }

    .message_container {
      margin-left: 0;
      margin-right: 20rpx;
      // text-align: end;
      align-items: flex-end;

      .message_content_wrap {
        flex-direction: row-reverse;

        .bg_container {
          border-radius: 12rpx 0 12rpx 12rpx;
          background-color: #dcebfe !important;
        }
      }
    }

    .message_send_state_box{
      flex-direction: row;
    }

    .message_send_state {
      margin-left: 0rpx;
      margin-right: 12rpx;
    }
  }

  &_active {
    background-color: #fdf5e9;
  }
}

.notice_message_container {
  @include ellipsisWithLine(2);
  text-align: center;
  margin: 24rpx 48rpx;
  // font-size: 24rpx;
  font-size: 0.85rem;
  color: #999;
  position: relative;
}

.fade-leave,
.fade-enter-to {
  opacity: 1;
}

.fade-leave-active,
.fade-enter-active {
  transition: all 0.5s;
}

.fade-leave-to,
.fade-enter {
  opacity: 0;
}
</style>
