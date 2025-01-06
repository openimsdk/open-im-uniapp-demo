<template>
  <view
    :insertImageFlag="insertImageFlag"
    :insertAtFlag="insertAtFlag"
    :insertEmojiFlag="insertEmojiFlag"
    :change:insertEmojiFlag="input.insertEmojiFlagUpdate"
    :change:insertAtFlag="input.insertAtFlagUpdate"
    :change:insertImageFlag="input.insertImageFlagUpdate"
    class="editor_wrap"
  >
    <editor
      :placeholder="placeholder"
      id="editor2"
      @ready="editorReady"
      @focus="editorFocus"
      @blur="editorBlur"
      @input="editorInput"
    />
    <view class="canvas_container">
      <canvas
        v-if="canvasData.show"
        canvas-id="atCanvas"
        :style="{ width: canvasData.width }"
        id="atCanvas"
      ></canvas>
    </view>
  </view>
</template>

<script>
import { html2Text } from "@/util/common";
export default {
  props: {
    placeholder: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      editorCtx: null,
      canvasData: {
        width: 0,
        show: false,
      },
      imageData: {},
      insertImageFlag: null,
      insertAtFlag: null,
      lastStr: "",
      emojiData: "",
      insertEmojiFlag: null
    };
  },
  methods: {
    editorReady() {
      uni
        .createSelectorQuery()
        .select("#editor2")
        .context((res) => {
          this.$emit("ready", res);
          this.editorCtx = res.context;
        })
        .exec();
    },
    insertImage(imageData) {
      this.imageData = imageData;
      this.insertImageFlag = true;
    },
    insertEmoji(emoji) {
      this.$nextTick(() => {
        this.insertEmojiFlag = true;
        this.emojiData = emoji;
      });
    },
    internalInsertEmoji() {
      this.editorCtx.insertText({
        text: this.emojiData,
        complete: () => {
          this.insertEmojiFlag = false;
          this.emojiData = null
        },
      });
    },
    internalInsertImage() {
      this.editorCtx.insertImage({
        ...this.imageData,
        complete: () => {
          this.insertImageFlag = false;
          this.insertAtFlag = null;
          // plus.key.showSoftKeybord()
          // this.setDraftTextItem();
        },
      });
    },
    internalInsertAtEl({ text, width, userID, nickname }) {
      this.canvasData.width = `${width}px`;
      this.canvasData.show = true;
      setTimeout(() => {
        const ctx = uni.createCanvasContext("atCanvas");
        const fontSize = 14;
        ctx.setFontSize(fontSize);
        ctx.setFillStyle("#3e44ff");
        ctx.fillText(text, 0, 16);
        ctx.draw();
        this.canvasToTempFilePath(userID, nickname, width);
      }, 20);
    },
    createCanvasData(userID, nickname) {
      this.$nextTick(() => {
        this.insertAtFlag = {
          userID,
          nickname,
        };
      });
    },
    canvasToTempFilePath(sendID, senderNickname, width) {
      uni.canvasToTempFilePath({
        canvasId: "atCanvas",
        success: (res) => {
          this.insertImage({
            src: res.tempFilePath,
            width,
            height: "20px",
            data: {
              sendID,
              senderNickname,
            },
            extClass: "at_el",
          });
          uni.createCanvasContext("atCanvas").clearRect();
        },
      });
    },
    editorFocus() {
      this.$emit("focus");
    },
    editorBlur() {
      this.$emit("blur");
    },
    editorInput(e) {
      let str = e.detail.html;
      const oldArr = (this.lastStr ?? '').split("");
      let contentStr = str;
      oldArr.forEach((str) => {
        contentStr = contentStr.replace(str, "");
      });
      contentStr = html2Text(contentStr);
      this.$emit("input", e);
      this.lastStr = e.detail.html;
    },
  },
};
</script>

<script module="input" lang="renderjs">
export default {
	methods: {
    insertEmojiFlagUpdate(newValue, oldValue, ownerVm, vm) {
			if (newValue === null) {
				return;
			}
			if (newValue) {
				this.$el.querySelector('.ql-editor').setAttribute('inputmode', 'none')
				ownerVm.callMethod('internalInsertEmoji')
			} else {
				this.$el.querySelector('.ql-editor').removeAttribute('inputmode')
			}
		},
		insertImageFlagUpdate(newValue, oldValue, ownerVm, vm) {
			if (newValue === null) {
				return;
			}
			if (newValue) {
				this.$el.querySelector('.ql-editor').setAttribute('inputmode', 'none')
				ownerVm.callMethod('internalInsertImage')
			} else {
				this.$el.querySelector('.ql-editor').removeAttribute('inputmode')
			}
		},
		truncateText(text, maxWidth) {
			const container = document.createElement("div");
			container.style.width = "auto";
			container.style.overflow = "hidden";
			container.style.textOverflow = "ellipsis";
			container.style.whiteSpace = "nowrap";
			container.style.position = "absolute";
			container.style.visibility = "hidden";

			const textNode = document.createTextNode(text);
			container.appendChild(textNode);

			document.body.appendChild(container);

			const isOverflowing = container.scrollWidth > maxWidth;

			if (!isOverflowing) {
				const width = container.clientWidth + 4
				document.body.removeChild(container);
				return {
					text,
					width
				};
			}

			container.style.width = maxWidth + "px";
			container.style.visibility = "visible";

			let truncatedText = text;
			while (container.scrollWidth > maxWidth) {
			truncatedText = truncatedText.slice(0, -1);
			container.textContent = truncatedText + "...";
			}

			document.body.removeChild(container);
			return {
				text: `${truncatedText}...`,
				width: maxWidth + 4
			};
		}
	},
}
</script>

<style lang="scss" scoped>
.editor_wrap {
  position: relative;
}

#editor2 {
  background-color: #fff;
  min-height: 30px;
  max-height: 120px;
  height: auto;
  word-break: break-all;
}

/deep/.ql-editor {
  img {
    vertical-align: sub !important;
  }

  p {
    padding: 4px;
  }
}

.canvas_container {
  position: fixed;
  bottom: -99px;
  z-index: -100;

  &_name {
    max-width: 480rpx;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #atCanvas {
    height: 20px;
  }

  .convas_container_name {
    font-size: 16px !important;
  }
}
</style>
