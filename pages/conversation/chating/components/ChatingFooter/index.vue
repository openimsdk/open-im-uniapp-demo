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
      v-show="getPlaceholder.length <= 0"
      :style="{ 'pointer-events': getPlaceholder ? 'none' : 'auto' }"
    >
      <view class="chat_footer">
        <image
          @click="updateRecordBtn"
          style="width: 26px; height: 26px"
          :src="
            showRecord
              ? '/static/images/chating_footer_audio_recording.png'
              : '/static/images/chating_footer_audio.png'
          "
        />
        <view class="input_content">
          <CustomEditor
            :placeholder="getPlaceholder"
            v-show="!showRecord"
            class="custom_editor"
            ref="customEditor"
            @ready="editorReady"
            @focus="editorFocus"
            @blur="editorBlur"
            @input="editorInput"
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
          <button
            class="record_btn"
            @longpress="longpressRecord"
            @touchmove="touchMoveSpeech"
            @touchend="endRecord"
            v-show="showRecord"
            customStyle="height:30px;"
          >
            {{ recording ? "松手发送" : "按住说话" }}
          </button>
        </view>

        <view class="footer_action_area">
          <image
            @click="updateEmojiBar"
            class="emoji_action"
            src="@/static/images/chating_footer_emoji.png"
            alt=""
            srcset=""
          />
          <!-- <image
            v-else
            @click="updateEmojiBar"
            class="emoji_action"
            src="@/static/images/chating_footer_audio_recording.png"
            alt=""
            srcset=""
          /> -->
          <image
            v-show="!hasContent"
            @click.prevent="updateActionBar"
            src="@/static/images/chating_footer_add.png"
            alt=""
            srcset=""
          />
          <image
            v-show="hasContent && !emojiBarVisible"
            @touchend.prevent="sendTextMessage"
            src="@/static/images/send_btn.png"
            alt=""
            srcset=""
          />
          <image
            v-show="hasContent && emojiBarVisible"
            @click.prevent="sendTextMessage"
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
      <chating-emoji-bar
        @insertEmoji="emojiClick"
        @backspace="backspace"
        v-show="emojiBarVisible"
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
      <record-overlay
        @recordFinish="recordFinish"
        ref="recordOverlayRef"
        :visible="recording"
      />
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { formatInputHtml, getPurePath, html2Text } from "@/util/common";
import { parseMessageByType, offlinePushInfo, parseAt } from "@/util/imCommon";
import {
  ChatingFooterActionTypes,
  UpdateMessageTypes,
  GroupMemberListTypes,
  PageEvents
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
import ChatingEmojiBar from "./ChatingEmojiBar.vue";
import RecordOverlay from "./RecordOverlay.vue";
import {
  gotoAppPermissionSetting,
  requestAndroidPermission,
  judgeIosPermission,
} from "@/util/permission";

const needClearTypes = [
  // MessageType.AdvanceTextMessage,
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
    ChatingEmojiBar,
    UParse,
    RecordOverlay,
  },
  props: {
    footerOutsideFlag: Number,
  },
  data() {
    return {
      customEditorCtx: null,
      inputHtml: "",
      showRecord: false,
      actionBarVisible: false,
      emojiBarVisible: false,
      isInputFocus: false,
      actionSheetMenu: [],
      showActionSheet: false,
      recording: false,
      recordTop: uni.getWindowInfo().windowHeight - 130,
      conversationID: null,
      isJoinGroup: true
    };
  },
  computed: {
    ...mapGetters([
      "storeQuoteMessage",
      "storeCurrentConversation",
      "storeCurrentGroup",
      "storeCurrentMemberInGroup",
      "storeBlackList",
      "storeRevokeMap"
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
    isNomal() {
      return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Nomal;
    },
    getPlaceholder() {
      const isSingle =
        this.storeCurrentConversation.conversationType === SessionType.Single;
      if (!isSingle && this.storeCurrentGroup.status === GroupStatus.Muted) {
        return !this.isNomal ? "" : "群主或管理员已开启全体禁言";
      }
      if (!isSingle && !this.isJoinGroup) {
        return "您已不在该群组";
      }
      if (
        !isSingle &&
        this.storeCurrentMemberInGroup.muteEndTime > Date.now()
      ) {
        return `您已被管理员或群主禁言！`;
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
      this.onClickEmojiBarOutside();
    },
  },
  mounted() {
    this.setSendMessageListener();
    this.setKeyboardListener();
    if (this.storeCurrentConversation.groupID) {
      IMSDK.asyncApi(
        IMMethods.IsJoinGroup,
        IMSDK.uuid(),
        this.storeCurrentConversation.groupID
      ).then((res) => {
        this.isJoinGroup = res.data
      });
    }
    this.conversationID = this.storeCurrentConversation.conversationID
    this.parseDraftText(this.storeCurrentConversation.draftText)
    IMSDK.asyncApi(
      IMMethods.SetConversationDraft,
      IMSDK.uuid(),
      {
        conversationID: this.conversationID,
        draftText: '',
      }
    );
  },
  beforeDestroy() {
    this.disposeSendMessageListener();
    this.disposeKeyboardListener();
    if (this.inputHtml && this.inputHtml.trim()) {
      IMSDK.asyncApi(
        IMMethods.SetConversationDraft,
        IMSDK.uuid(),
        {
          conversationID: this.conversationID,
          draftText: html2Text(this.inputHtml),
        }
      );
    }
  },
  methods: {
    ...mapActions("message", ["pushNewMessage", "updateOneMessage","updateQuoteMessageRevoke"]),
    parseDraftText(draftText) {
      let currentText = '';

      for (let i = 0; i < draftText.length; i++) {
        const currentChar = draftText[i];

        if (currentChar === '<') {
          if (currentText) {
            const text = currentText
            setTimeout(()=> {
              this.$refs.customEditor.insertEmoji(text);
            }, 100)
            currentText = '';
          }
          const imgEndIndex = draftText.indexOf('>', i);
          if (imgEndIndex !== -1) {
            const imgTag = draftText.substring(i, imgEndIndex + 1);

            if (imgTag.includes('class="at_el"')) {
              const customDataReg = /data-custom=".+"/;
              const atInfoArr = imgTag
                .match(customDataReg)[0]
                .slice(13, -1)
                .split("&amp;");
              this.$refs.customEditor.createCanvasData(atInfoArr[0].slice(7), atInfoArr[1].slice(15));
            }
            i = imgEndIndex;
          }
        } else {
          currentText += currentChar;
        }
      }
      if (currentText) {
        setTimeout(()=> {
          this.$refs.customEditor.insertEmoji(currentText);
        }, 700)
      }
    },
    longpressRecord() {
      this.recording = true;
      this.$nextTick(() => this.getRecordAreaData());
    },
    touchMoveSpeech(e) {
      uni.$u.throttle(
        this.$refs.recordOverlayRef.touchMoveSpeech(e, this.recordTop),
        250,
      );
    },
    endRecord() {
      this.recording = false;
      this.$refs.recordOverlayRef.checkStopType();
    },
    async recordFinish(path, duration) {
      const message = await IMSDK.asyncApi(
        IMMethods.CreateSoundMessageFromFullPath,
        IMSDK.uuid(),
        {
          soundPath: getPurePath(path),
          duration,
        },
      );
      this.sendMessage(message);
    },
    getRecordAreaData() {
      this.getEl(".record_area").then((data) => {
        if (data) {
          this.recordTop = data.top;
        }
      });
    },
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
      const { text, atUsersInfo } = formatInputHtml(this.inputHtml);
      if (atUsersInfo.length === 0) {
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
            atUserIDList: atUsersInfo.map((item) => item.atUserID),
            atUsersInfo,
            message: quoteMessage,
          },
        );
      }
      console.log(message);
      return message;
    },
    async sendTextMessage() {
      // if(this.emojiBarVisible){
      // 	uni.hideKeyboard()
      // }
      if (!this.hasContent) return;
      IMSDK.asyncApi('changeInputStates', IMSDK.uuid(), {
        conversationID: this.storeCurrentConversation.conversationID,
        focus: false,
      });
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
    onClickEmojiBarOutside() {
      if (this.emojiBarVisible) {
        this.emojiBarVisible = false;
      }
    },
    updateActionBar() {
      this.onClickEmojiBarOutside();
      this.actionBarVisible = !this.actionBarVisible;
    },
    updateEmojiBar() {
      this.onClickActionBarOutside();
      this.emojiBarVisible = !this.emojiBarVisible;
    },
    editorReady(e) {
      this.customEditorCtx = e.context;
      this.customEditorCtx.clear();
    },
    editorFocus() {
      this.isInputFocus = true;
      this.$emit("scrollToBottom");
    },
    editorBlur() {
      this.isInputFocus = false;
    },
    editorInput(e) {
      this.inputHtml = e.detail.html;
      uni.$u.throttle(this.updateTyping, 2000);
    },
    backspace() {
      this.customEditorCtx.undo();
    },
    updateRecordBtn() {
      if (!this.showRecord) {
        this.checkRecordPermission();
      }
      this.showRecord = !this.showRecord;
    },
    async checkRecordPermission() {
      if (uni.$u.os() === "ios") {
        const iosFlag = judgeIosPermission("record");
        if (iosFlag === 0) {
          uni.$u.toast("您已禁止访问麦克风，请前往开启");
          setTimeout(() => gotoAppPermissionSetting(), 250);
        }
        if (iosFlag === -1) {
          let recorderManager = uni.getRecorderManager();
          recorderManager.onStop(() => (recorderManager = null));
          recorderManager.start();
          setTimeout(() => recorderManager.stop());
        }
      } else {
        const androidFlag = await requestAndroidPermission(
          "android.permission.RECORD_AUDIO",
        );
        if (androidFlag === -1) {
          uni.$u.toast("您已禁止访问麦克风，请前往开启");
          setTimeout(() => gotoAppPermissionSetting(), 250);
        }
      }
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
        IMSDK.asyncApi('changeInputStates', IMSDK.uuid(), {
          conversationID: this.storeCurrentConversation.conversationID,
          focus: true,
        });
      }
    },

    // from comp
    emojiClick(emoji) {
      this.$refs.customEditor.insertEmoji(emoji);
    },
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
      const { atUsersInfo } = formatInputHtml(this.inputHtml);
      if (atUsersInfo.find((item) => item.atUserID === userID)) {
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
        if (this.emojiBarVisible) {
          this.emojiBarVisible = false;
        }
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

    .record_btn {
      // background-color: #3c9cff;
      background: #fff;
      color: black;
      height: 30px;
      font-size: 24rpx;
    }
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

    .emoji_action {
      margin-right: 24rpx;
    }

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
