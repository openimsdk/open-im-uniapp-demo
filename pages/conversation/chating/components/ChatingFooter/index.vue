<template>
  <view>
    <view>
      <view class="chat_footer">
        <view class="input_content">
          <CustomEditor
            class="custom_editor"
            ref="customEditor"
            @ready="editorReady"
            @focus="editorFocus"
            @blur="editorBlur"
            @input="editorInput"
          />
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
import { getPurePath, html2Text } from "@/util/common";
import { offlinePushInfo } from "@/util/imCommon";
import {
  ChatingFooterActionTypes,
  UpdateMessageTypes,
} from "@/constant";
import IMSDK, {
  IMMethods,
  MessageStatus,
  MessageType,
} from "openim-uniapp-polyfill";
import UParse from "@/components/gaoyia-parse/parse.vue";
import CustomEditor from "./CustomEditor.vue";
import ChatingActionBar from "./ChatingActionBar.vue";

const needClearTypes = [MessageType.TextMessage];

const albumChoose = [
  {
    name: "图片",
    type: ChatingFooterActionTypes.Album,
    idx: 0,
  },
  {
    name: "拍照",
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
      "storeCurrentConversation",
      "storeCurrentGroup",
      "storeBlackList",
    ]),
    hasContent() {
      return html2Text(this.inputHtml) !== "";
    },
  },
  watch: {
    footerOutsideFlag(newVal) {
      this.onClickActionBarOutside();
    },
  },
  mounted() {
    this.setKeyboardListener();
  },
  beforeDestroy() {
    this.disposeKeyboardListener();
  },
  methods: {
    ...mapActions("message", ["pushNewMessage", "updateOneMessage"]),
    async createTextMessage() {
      let message = "";
      const text = html2Text(this.inputHtml);
      message = await IMSDK.asyncApi(
            IMMethods.CreateTextMessage,
            IMSDK.uuid(),
            text
          );
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
    },
    prepareMediaMessage(type) {
      if (type === ChatingFooterActionTypes.Album) {
        this.actionSheetMenu = [...albumChoose];
      }
      this.showActionSheet = true;
    },

    // from comp
    batchCreateImageMesage(paths) {
      paths.forEach(async (path) => {
        const message = await IMSDK.asyncApi(
          IMMethods.CreateImageMessageFromFullPath,
          IMSDK.uuid(),
          getPurePath(path)
        );
        this.sendMessage(message);
      });
    },
    selectClick({ idx }) {
      if (idx === 0) {
        this.chooseOrShotImage(["album"]).then((paths) =>
          this.batchCreateImageMesage(paths)
        );
      } else {
        this.chooseOrShotImage(["camera"]).then((paths) =>
          this.batchCreateImageMesage(paths)
        );
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
