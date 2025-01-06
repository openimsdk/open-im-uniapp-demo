<template>
  <view class="file_message_container" @click="openFile">
    <view class="file_info">
      <text class="file_name">{{ message.fileElem.fileName }}</text>
      <text class="file_size">{{ getSizeStr }}</text>
    </view>
    <view style="position: relative;">
      <image :src="getIcon" alt="" srcset="" />
      <image v-if="!downloadUrl" class="mask"
        src="@/static/images/file_message/file_mask.png" alt="" srcset="" />
      <image class="mask download" v-if="downloading" src="@/static/images/file_message/file_suspend.png" alt="" srcset="" />
      <image v-if="!downloading && !downloadUrl" class="download"
        src="@/static/images/file_message/file_download.png" alt="" srcset="" />
    </view>
  </view>
</template>

<script>
import { bytesToSize } from "@/util/imCommon";
import { getPurePath, getFileIcon } from "@/util/common";
export default {
  name: "",
  props: {
    message: Object,
  },
  data() {
    return {
      downloading: false,
      downloaded: {},
      downloadUrl: "",
    };
  },
  mounted() {
    this.checkDownloaded();
  },
  computed: {
    loginUserID() {
      return this.$store.getters.storeCurrentUserID;
    },
    getSizeStr() {
      return bytesToSize(this.message.fileElem.fileSize);
    },
    getIcon() {
      return getFileIcon(this.message.fileElem.fileName);
    }
  },
  watch: {
    downloaded: {
      async handler(newVal) {
        let path = newVal[this.message.clientMsgID];
        const downloadUrl = await this.checkFile(path)
        this.downloadUrl = downloadUrl;
      },
      // deep: true,
      immediate: true,
    },
  },
  methods: {
    checkDownloaded() {
      this.downloaded = uni.getStorageSync(`${this.loginUserID}_downloaded`) || {};
    },
    download() {
      if (!this.message.fileElem.sourceUrl) {
        this.$u.toast("无效的链接");
        return;
      }

      if (this.downloading) return;
      this.downloading = true;
      uni.downloadFile({
        url: this.message.fileElem.sourceUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveFile({
              tempFilePath: res.tempFilePath, //文件的临时路径
              success: ({ savedFilePath }) => {
                const tmpData = {
                  ...this.downloaded,
                };
                console.log(savedFilePath);
                tmpData[this.message.clientMsgID] = savedFilePath;
                uni.setStorage({
                  key: `${this.loginUserID}_downloaded`,
                  data: {
                    ...tmpData,
                  },
                });
                this.downloaded = {
                  ...tmpData,
                };
                this.showToast(`文件已保存到${getPurePath(savedFilePath)}`);
                this.downloading = false;
              },
              fail: function (err) {
                this.showToast("保存失败");
                this.downloading = false;
              },
            });
          } else {
            this.showToast("下载失败");
            this.downloading = false;
          }
        },
        fail: () => {
          this.showToast("下载失败");
          this.downloading = false;
        },
      });
    },
    openFile() {
      if(!this.downloadUrl) {
        this.download()
        return
      }
      
      uni.openDocument({
        filePath: this.downloadUrl,
        fail: () => {
          this.showToast('文件打开失败，请前往文件管理器打开')
        },
      });
    },
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      })
    },
    checkFile(path) {
      return new Promise((resolve) => {
        if (!path) {
          resolve("");
          return;
        }
        plus.io.resolveLocalFileSystemURL(
          path,
          (res) => {
            resolve(path);
          },
          (err) => {
            console.log(err);
            const tmpArr = [...this.downloaded];
            delete tmpArr[this.msgID];
            uni.setStorage({
              key: `${this.loginUserID}_downloaded`,
              data: {
                ...tmpArr,
              },
            });
            this.downloaded = [...tmpArr];
            resolve("");
          },
        );
      });
    },
    toPreviewFile() {
      uni.$u.route("/pages/conversation/previewFile/index", {
        fileEl: JSON.stringify(this.message.fileElem),
        msgID: this.message.clientMsgID,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.file_message_container {
  @include vCenterBox();
  padding: 24rpx 32rpx;
  background: #fff;
  justify-content: space-between;
  width: 380rpx;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  border-radius: 12rpx;
  border: 1px solid #ececec;

  .file_info {
    @include colBox(true);
    height: 44px;
    margin-right: 24rpx;
    max-width: 280rpx;

    .file_name {
      @include nomalEllipsis();
    }

    .file_size {
      color: #999;
      font-size: 24rpx;
    }
  }

  image {
    width: 38px;
    height: 44px;
  }

  .mask {
    top: 0;
    left: 0;
    position: absolute;
  }

  .download {
    width: 44rpx;
    height: 44rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
