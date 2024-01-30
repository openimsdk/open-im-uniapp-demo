<template>
  <view class="">
    <view class="forbidden_footer" v-if="getPlaceholder.length > 0">
      <image style="margin-right: 8rpx" src="/static/images/forbidden_footer.png" />
      <text>{{ getPlaceholder }}</text>
    </view>
    <view v-else :style="{ 'pointer-events': getPlaceholder ? 'none' : 'auto' }">
      <view class="chat_footer">
        <view class="input_content">
          <CustomEditor :placeholder="getPlaceholder" class="custom_editor" ref="customEditor" @ready="editorReady"
            @focus="editorFocus" @blur="editorBlur" @input="editorInput" />
        </view>

        <view class="footer_action_area">
          <image v-show="!hasContent" @click.prevent="updateActionBar" src="@/static/images/chating_footer_add.png" alt=""
            srcset="" />
          <image v-show="hasContent" @click="sendTextMessage" src="@/static/images/send_btn.png" alt=""
            srcset="" />
        </view>
      </view>
      <chating-action-bar @sendMessage="sendMessage" @prepareMediaMessage="prepareMediaMessage"
        v-show="actionBarVisible" />
      <u-action-sheet :safeAreaInsetBottom="true" round="12" :actions="actionSheetMenu" @select="selectClick"
        :closeOnClickOverlay="true" :closeOnClickAction="true" :show="showActionSheet" @close="showActionSheet = false">
      </u-action-sheet>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { formatInputHtml, getPurePath, html2Text, getPicInfo, getFileType, getVideoSnshot, base64toFile, uploadForm, getFileSize } from "@/util/common";
import { parseMessageByType, offlinePushInfo } from "@/util/imCommon";
import {
  ChatingFooterActionTypes,
  UpdateMessageTypes,
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
        return `你已被禁言`;
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
    // this.setSendMessageListener();
    this.setKeyboardListener();
  },
  beforeDestroy() {
    // this.disposeSendMessageListener();
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
        // #ifdef H5 || APP-PLUS
        this.customEditorCtx.clear();
        // #endif
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
    onClickActionBarOutside() {
      if (this.actionBarVisible) {
        this.actionBarVisible = false;
      }
    },
    updateActionBar() {
      this.actionBarVisible = !this.actionBarVisible;
    },
    editorReady(e) {
      // #ifdef H5 || APP-PLUS
      this.customEditorCtx = e.context;
      this.customEditorCtx.clear();
      // #endif
    },
    editorFocus() {
      this.isInputFocus = true;
    },
    editorBlur() {
      this.isInputFocus = false;
    },
    editorInput(e) {
      this.inputHtml = e.detail.html;
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

    // from comp
    batchCreateImageMesage({ tempFilePaths, tempFiles }) {
      // #ifdef APP-PLUS
      tempFilePaths.forEach(async (path) => {
        const message = await IMSDK.asyncApi(
          IMMethods.CreateImageMessageFromFullPath,
          IMSDK.uuid(),
          getPurePath(path),
        );
        this.sendMessage(message);
      });
      // #endif
      // #ifdef H5
      tempFiles.forEach(async (file) => {
        const { width, height } = await getPicInfo(file);
        const baseInfo = {
          uuid: IMSDK.uuid(),
          type: getFileType(file.name),
          size: file.size,
          width,
          height,
          url: file,
        }
        const options = {
          sourcePicture: baseInfo,
          bigPicture: baseInfo,
          snapshotPicture: baseInfo,
          sourcePath: "",
          file: file,
        };
        const { data } = await IMSDK.asyncApi(
          'createImageMessageByFile',
          IMSDK.uuid(),
          options,
        );
        this.sendMessage(data);
      });
      // #endif
      // #ifdef MP-WEIXIN
      tempFiles.forEach(async (file) => {
        const { width, height } = await getPicInfo(file);
        const url = await uploadForm(file)
        const baseInfo = {
          uuid: IMSDK.uuid(),
          type: getFileType(file.path),
          size: file.size,
          width,
          height,
          url,
        }
        const options = {
          sourcePicture: baseInfo,
          bigPicture: baseInfo,
          snapshotPicture: baseInfo,
          sourcePath: url,
        };
        const message = await IMSDK.asyncApi(
          'createImageMessageByURL',
          IMSDK.uuid(),
          options,
        );
        this.sendMessage(message);
      });
      // #endif
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
        const whenGetFile = async (data) => {
          // #ifdef H5
          const snapShotFile = await getVideoSnshot(URL.createObjectURL(data.path));
          const { width, height } = await getPicInfo(snapShotFile);
          const options = {
            videoFile: data.path,
            snapshotFile: snapShotFile,
            videoPath: "",
            duration: Number(data.duration.toFixed()),
            videoType: getFileType(data.path.name),
            snapshotPath: "",
            videoUUID: IMSDK.uuid(),
            videoUrl: "",
            videoSize: data.path.size,
            snapshotUUID: IMSDK.uuid(),
            snapshotSize: snapShotFile.size,
            snapshotUrl: URL.createObjectURL(snapShotFile),
            snapshotWidth: width,
            snapshotHeight: height,
            snapShotType: getFileType(data.path.name),
          };
          const { data: msg } = await IMSDK.asyncApi(
            'createVideoMessageByFile',
            IMSDK.uuid(),
            options,
          );
          this.sendMessage(msg);
          // #endif

          // #ifdef MP-WEIXIN
          const videoUrl = await uploadForm({
            path: data.tempFilePath,
            size: data.size
          })
          const snapshotSize = await getFileSize(data.thumbTempFilePath)
          const snapshotUrl = await uploadForm({
            path: data.thumbTempFilePath,
            size: snapshotSize
          })
          const mpOptions = {
            videoPath: '',
            duration: Number(data.duration.toFixed()),
            videoType: getFileType(data.tempFilePath),
            snapshotPath: '',
            videoUUID: IMSDK.uuid(),
            videoUrl,
            videoSize: data.size,
            snapshotUUID: IMSDK.uuid(),
            snapshotSize: 1024,
            snapshotUrl,
            snapshotWidth: data.width,
            snapshotHeight: data.height,
            snapShotType: getFileType(data.thumbTempFilePath),
          }
          const message = await IMSDK.asyncApi(
            'createVideoMessageByURL',
            IMSDK.uuid(),
            mpOptions,
          );
          this.sendMessage(message);
          // #endif

          // #ifdef APP-PLUS
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
          // #endif
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
          success: function ({ tempFilePaths, tempFiles }) {
            resolve({ tempFilePaths, tempFiles });
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
        // #ifdef MP-WEIXIN
        uni.chooseMedia({
          mediaType: ['video'],
          compressed: true,
          sourceType,
          success: function ({ tempFiles }) {
            resolve(tempFiles[0]);
          },
          fail: function (err) {
            reject(err);
          },
        });
        // #endif
        // #ifdef APP-PLUS || H5
        uni.chooseVideo({
          compressed: true,
          sourceType,
          extension: ["mp4"],
          success: function ({ tempFilePath, duration, tempFile }) {
            const idx = tempFilePath.lastIndexOf(".");
            const videoType = tempFilePath.slice(idx + 1);
            if (tempFilePath.includes("_doc/")) {
              tempFilePath = `file://${plus.io.convertLocalFileSystemURL(
                tempFilePath,
              )}`;
            }
            console.log(tempFilePath);
            // #ifdef APP-PLUS
            resolve({
              path: tempFilePath,
              videoType,
              duration,
            });
            // #endif
            // #ifdef H5
            resolve({
              path: tempFile,
              videoType,
              duration,
            });
            // #endif
          },
          fail: function (err) {
            console.log(err);
            reject(err);
          },
        });
        // #endif
      });
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
    /*  #ifdef  MP-WEIXIN  */
    height: 30px;
    word-break: break-all;
    overflow: auto;
    /*  #endif  */
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
