<template>
  <view
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
      lastStr: "",
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
