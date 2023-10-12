<template>
  <view class="">
    <view class="forbidden_footer" v-if="getPlaceholder.length > 0">
      <img
        style="margin-right: 8rpx"
        src="static/images/forbidden_footer.png"
      />
      <text>{{ getPlaceholder }}</text>
    </view>
    <view
      v-else
      :style="{ 'pointer-events': getPlaceholder ? 'none' : 'auto' }"
    >
      <view class="chat_footer">
        <view class="input_content">
          <CustomEditor
            :placeholder="getPlaceholder"
            class="custom_editor"
            ref="customEditor"
            @ready="editorReady"
            @focus="editorFocus"
            @blur="editorBlur"
            @input="editorInput"
            @tryAt="showAtPanel"
          />
          <view v-if="storeQuoteMessage" class="quote_message">
            <view class="content">
              <u-parse :content="getQuotedContent" />
            </view>
            <image
              @click="cancelQuote"
              style="width: 16px; height: 16px"
              src="@/static/images/chating_footer_quote_close.png"
              alt=""
            />
          </view>
        </view>

        <view class="footer_action_area">
          <image
            v-show="!hasContent"
            @click.prevent="updateActionBar"
            src="@/static/images/chating_footer_add.png"
            alt=""
            srcset=""
          />
          <image
            v-show="hasContent"
            @touchend.prevent="sendTextMessage"
            src="@/static/images/send_btn.png"
            alt=""
            srcset=""
          />
        </view>
      </view>
      <chating-action-bar
        @sendMessage="sendMessage"
        @prepareMediaMessage="prepareMediaMessage"
        v-show="actionBarVisible"
      />
      <u-action-sheet
        :safeAreaInsetBottom="true"
        round="12"
        :actions="actionSheetMenu"
        @select="selectClick"
        :closeOnClickOverlay="true"
        :closeOnClickAction="true"
        :show="showActionSheet"
        @close="showActionSheet = false"
      >
      </u-action-sheet>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { formatInputHtml, getPurePath, html2Text } from "@/util/common";
import { parseMessageByType, offlinePushInfo } from "@/util/imCommon";
import {
  ChatingFooterActionTypes,
  UpdateMessageTypes,
  GroupMemberListTypes,
} from "@/constant";
import IMSDK, {
  GroupMemberRole,
  GroupStatus,
  IMMethods,
  MessageStatus,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import UParse from "@/components/gaoyia-parse/parse.vue";
import CustomEditor from "./CustomEditor.vue";
import ChatingActionBar from "./ChatingActionBar.vue";

const needClearTypes = [
  MessageType.TextMessage,
  MessageType.AtTextMessage,
  MessageType.QuoteMessage,
];

const albumChoose = [
  {
    name: "图片",
    type: ChatingFooterActionTypes.Album,
    idx: 0,
  },
  {
    name: "视频",
    type: ChatingFooterActionTypes.Album,
    idx: 1,
  },
];
const cameraChoose = [
  {
    name: "拍照",
    type: ChatingFooterActionTypes.Camera,
    idx: 0,
  },
  {
    name: "录制",
    type: ChatingFooterActionTypes.Camera,
    idx: 1,
  },
];

export default {
  components: {
    CustomEditor,
    ChatingActionBar,
    UParse,
  },
  props: {
    footerOutsideFlag: Number,
  },
  data() {
    return {
      customEditorCtx: null,
      inputHtml: "",
      actionBarVisible: false,
      isInputFocus: false,
      actionSheetMenu: [],
      showActionSheet: false,
    };
  },
  computed: {
    ...mapGetters([
      "storeQuoteMessage",
      "storeCurrentConversation",
      "storeCurrentGroup",
      "storeCurrentMemberInGroup",
      "storeBlackList",
    ]),
    getQuotedContent() {
      if (!this.storeQuoteMessage) {
        return "";
      }
      return `回复${parseMessageByType(this.storeQuoteMessage)}`;
    },
    hasContent() {
      return html2Text(this.inputHtml) !== "";
    },
    getPlaceholder() {
      const isSingle =
        this.storeCurrentConversation.conversationType === SessionType.Single;
      if (!isSingle && this.storeCurrentGroup.status === GroupStatus.Muted) {
        return this.storeCurrentMemberInGroup.roleLevel !==
          GroupMemberRole.Nomal
          ? ""
          : "群主或管理员已开启全体禁言";
      }
      if (
        !isSingle &&
        (this.storeCurrentGroup.status === GroupStatus.Dismissed ||
          this.storeCurrentMemberInGroup.groupID !==
            this.storeCurrentGroup.groupID)
      ) {
        return "您已不在该群组";
      }
      if (
        !isSingle &&
        this.storeCurrentMemberInGroup.muteEndTime > Date.now()
      ) {
        const timeStr = dayjs(
          this.storeCurrentMemberInGroup.muteEndTime,
        ).format("YYYY/MM/DD HH:mm");
        return `你已被禁言至${timeStr}`;
      }
      if (
        isSingle &&
        this.storeBlackList.find(
          (black) => black.userID === this.storeCurrentConversation.userID,
        )
      ) {
        return "对方已被拉入黑名单";
      }
      return "";
    },
  },
  watch: {
    footerOutsideFlag(newVal) {
      this.onClickActionBarOutside();
    },
  },
  mounted() {
    this.setSendMessageListener();
    this.setKeyboardListener();
  },
  beforeDestroy() {
    this.disposeSendMessageListener();
    this.disposeKeyboardListener();
  },
  methods: {
    ...mapActions("message", ["pushNewMessage", "updateOneMessage"]),
    getEl(el) {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(el)
          .boundingClientRect((data) => {
            resolve(data);
          })
          .exec();
      });
    },
    async createTextMessage() {
      let message = "";
      const { text, atUserList } = formatInputHtml(this.inputHtml);
      if (atUserList.length === 0) {
        if (this.storeQuoteMessage) {
          message = await IMSDK.asyncApi(
            IMMethods.CreateQuoteMessage,
            IMSDK.uuid(),
            {
              text,
              message: this.storeQuoteMessage,
            },
          );
        } else {
          message = await IMSDK.asyncApi(
            IMMethods.CreateTextMessage,
            IMSDK.uuid(),
            text,
          );
          console.log(message);
        }
      } else {
        const quoteMessage = this.storeQuoteMessage
          ? this.storeQuoteMessage
          : "";
        message = await IMSDK.asyncApi(
          IMMethods.CreateTextAtMessage,
          IMSDK.uuid(),
          {
            text,
            atUserIDList: atUserList.map((item) => item.atUserID),
            atUsersInfo: atUserList,
            message: quoteMessage,
          },
        );
      }
      console.log(message);
      return message;
    },
    async sendTextMessage() {
      
      if (!this.hasContent) return;
      const message = await this.createTextMessage();
      this.sendMessage(message);
    },
    sendMessage(message) {
      this.pushNewMessage(message);
      if (needClearTypes.includes(message.contentType)) {
        this.customEditorCtx.clear();
      }
      this.$emit("scrollToBottom");
      IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
        recvID: this.storeCurrentConversation.userID,
        groupID: this.storeCurrentConversation.groupID,
        message,
        offlinePushInfo,
      })
        .then(({ data }) => {
          this.updateOneMessage({
            message: data,
            isSuccess: true,
          });
        })
        .catch(({ data, errCode, errMsg }) => {
          this.updateOneMessage({
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
      if (this.storeQuoteMessage) {
        this.$store.commit("message/SET_QUOTE_MESSAGE", undefined);
      }
    },

    // action
    cancelQuote() {
      this.$store.commit("message/SET_QUOTE_MESSAGE", undefined);
    },
    onClickActionBarOutside() {
      if (this.actionBarVisible) {
        this.actionBarVisible = false;
      }
    },
    updateActionBar() {
      this.actionBarVisible = !this.actionBarVisible;
    },
    editorReady(e) {
      this.customEditorCtx = e.context;
      this.customEditorCtx.clear();
    },
    editorFocus() {
      this.isInputFocus = true;
    },
    editorBlur() {
      this.isInputFocus = false;
    },
    editorInput(e) {
      this.inputHtml = e.detail.html;
      uni.$u.throttle(this.updateTyping, 2000);
    },
    showAtPanel() {
      if (!this.$store.getters.storeCurrentConversation.groupID) return;

      uni.$u.route("/pages/conversation/groupMemberList/index", {
        type: GroupMemberListTypes.ChooseAt,
        groupID: this.$store.getters.storeCurrentConversation.groupID,
      });
    },
    backspace() {
      this.customEditorCtx.undo();
    },

    prepareMediaMessage(type) {
      if (type === ChatingFooterActionTypes.Album) {
        this.actionSheetMenu = [...albumChoose];
      } else {
        this.actionSheetMenu = [...cameraChoose];
      }
      this.showActionSheet = true;
    },
    updateTyping() {
      if (
        this.storeCurrentConversation.conversationType === SessionType.Single
      ) {
        IMSDK.asyncApi(IMSDK.IMMethods.TypingStatusUpdate, IMSDK.uuid(), {
          recvID: this.storeCurrentConversation.userID,
          msgTip: "yes",
        });
      }
    },

    // from comp
    batchCreateImageMesage(paths) {
      paths.forEach(async (path) => {
        const message = await IMSDK.asyncApi(
          IMMethods.CreateImageMessageFromFullPath,
          IMSDK.uuid(),
          getPurePath(path),
        );
        this.sendMessage(message);
      });
    },
    selectClick({ idx }) {
      if (idx === 0) {
        if (this.actionSheetMenu[0].type === ChatingFooterActionTypes.Album) {
          this.chooseOrShotImage(["album"]).then((paths) =>
            this.batchCreateImageMesage(paths),
          );
        } else {
          this.chooseOrShotImage(["camera"]).then((paths) =>
            this.batchCreateImageMesage(paths),
          );
        }
      } else {
        const whenGetFile = (data) => {
          const purePath = getPurePath(data.path);
          IMSDK.getVideoCover(purePath).then(async ({ path }) => {
            console.log(getPurePath(path));
            const message = await IMSDK.asyncApi(
              IMMethods.CreateVideoMessageFromFullPath,
              IMSDK.uuid(),
              {
                videoPath: purePath,
                videoType: data.videoType,
                duration: Number(data.duration.toFixed()),
                snapshotPath: getPurePath(path),
              },
            );
            this.sendMessage(message);
          });
        };
        if (this.actionSheetMenu[0].type === ChatingFooterActionTypes.Album) {
          this.chooseOrShotVideo(["album"]).then(whenGetFile);
        } else {
          this.chooseOrShotVideo(["camera"]).then(whenGetFile);
        }
      }
    },
    chooseOrShotImage(sourceType) {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count: 9,
          sizeType: ["compressed"],
          sourceType,
          success: function ({ tempFilePaths }) {
            resolve(tempFilePaths);
          },
          fail: function (err) {
            console.log(err);
            reject(err);
          },
        });
      });
    },
    chooseOrShotVideo(sourceType) {
      return new Promise((resolve, reject) => {
        uni.chooseVideo({
          compressed: true,
          sourceType,
          extension: ["mp4"],
          success: function ({ tempFilePath, duration }) {
            const idx = tempFilePath.lastIndexOf(".");
            const videoType = tempFilePath.slice(idx + 1);
            if (tempFilePath.includes("_doc/")) {
              tempFilePath = `file://${plus.io.convertLocalFileSystemURL(
                tempFilePath,
              )}`;
            }
            console.log(tempFilePath);
            resolve({
              path: tempFilePath,
              videoType,
              duration,
            });
          },
          fail: function (err) {
            console.log(err);
            reject(err);
          },
        });
      });
    },
    insertAt(userID, nickname) {
      const { atUserList } = formatInputHtml(this.inputHtml);
      if (atUserList.find((item) => item.atUserID === userID)) {
        return;
      }
      this.$refs.customEditor.createCanvasData(userID, nickname);
    },

    // message status
    sendProgressHandler({ data: { progress, message } }) {
      this.updateOneMessage({
        message,
        type: UpdateMessageTypes.KeyWords,
        keyWords: {
          key: "uploadProgress",
          value: progress,
        },
      });
    },
    setSendMessageListener() {
      IMSDK.subscribe(
        IMSDK.IMEvents.SendMessageProgress,
        this.sendProgressHandler,
      );
    },
    disposeSendMessageListener() {
      IMSDK.unsubscribe(
        IMSDK.IMEvents.SendMessageProgress,
        this.sendProgressHandler,
      );
    },

    // keyboard
    keyboardChangeHander({ height }) {
      if (height > 0) {

        if (this.actionBarVisible) {
          this.actionBarVisible = false;
        }
      }
    },
    setKeyboardListener() {
      uni.onKeyboardHeightChange(this.keyboardChangeHander);
    },
    disposeKeyboardListener() {
      uni.offKeyboardHeightChange(this.keyboardChangeHander);
    },
  },
};
</script>

<style lang="scss" scoped>
.custom_editor {
  img {
    vertical-align: sub;
  }
}

.forbidden_footer {
  width: 100%;
  height: 112rpx;
  color: #8e9ab0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #f0f2f6;
}

.chat_footer {
  display: flex;
  align-items: center;
  // background-color: #e9f4ff;
  background: #f0f2f6;
  // height: 50px;
  max-height: 120px;
  padding: 24rpx 20rpx;

  .input_content {
    flex: 1;
    min-height: 30px;
    max-height: 120px;
    margin: 0 24rpx;
    border-radius: 8rpx;
    position: relative;

    // .record_btn {
    //   // background-color: #3c9cff;
    //   background: #fff;
    //   color: black;
    //   height: 30px;
    //   font-size: 24rpx;
    // }
  }

  .quote_message {
    @include vCenterBox();
    justify-content: space-between;
    margin-top: 12rpx;
    padding: 8rpx;
    // padding-top: 20rpx;
    border-radius: 6rpx;
    background-color: #fff;
    color: #666;

    .content {
      /deep/ uni-view {
        @include ellipsisWithLine(2);
      }
    }
  }

  .footer_action_area {
    display: flex;
    align-items: center;

    // .emoji_action {
    //   margin-right: 24rpx;
    // }

    image {
      width: 26px;
      height: 26px;
    }
  }

  .send_btn {
    height: 30px;
    line-height: 30px;
    background-color: #4a9cfc;
    padding: 0 8px;
    border-radius: 4px;
    color: #fff;
  }
}
</style>
