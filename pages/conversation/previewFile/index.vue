<template>
  <view class="preview_file_container">
    <custom-nav-bar title="文件" />
    <view class="main_area">
      <view class="file_info">
        <image src="@/static/images/preview_file_icon.png" mode=""></image>
        <text class="file_name">{{ fileEl.fileName }}</text>
        <text class="file_size">文件大小：{{ getSize }}</text>
      </view>
      <view class="doload_action">
        <u-icon
          v-if="downloadUrl"
          @click="openFile"
          name="share-square"
          label="打开"
          size="32"
        ></u-icon>
        <u-icon
          v-if="!downloading && !downloadUrl"
          @click="download"
          name="download"
          label="下载"
          size="32"
        >
        </u-icon>
        <u-loading-icon
          v-if="downloading"
          mode="semicircle"
          text="下载中"
        ></u-loading-icon>
      </view>
    </view>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { bytesToSize } from "@/util/imCommon";
import { getPurePath } from "@/util/common";
export default {
  name: "",
  components: {
    CustomNavBar,
  },
  data() {
    return {
      downloading: false,
      msgID: "",
      fileEl: {},
      downloaded: {},
      downloadUrl: "",
    };
  },
  computed: {
    loginUserID() {
      return this.$store.getters.storeCurrentUserID;
    },
    getSize() {
      return bytesToSize(this.fileEl.fileSize ?? 0);
    },
  },
  watch: {
    downloaded: {
      async handler(newVal) {
        let path = newVal[this.msgID];
        this.downloadUrl = await this.checkFile(path);
      },
      // deep: true,
      immediate: true,
    },
  },
  onLoad(options) {
    const { fileEl, msgID } = options;
    this.fileEl = JSON.parse(options.fileEl);
    this.msgID = msgID;
    this.checkDownloaded();
  },
  methods: {
    checkDownloaded() {
      this.downloaded =
        uni.getStorageSync(`${this.loginUserID}_downloaded`) || {};
    },
    back() {
      uni.navigateBack();
    },
    download() {
      if (!this.fileEl.sourceUrl) {
        this.$u.toast("无效的链接");
        return;
      }

      if (this.downloading) return;
      this.showToast("下载中", true);
      this.downloading = true;
      uni.downloadFile({
        url: this.fileEl.sourceUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveFile({
              tempFilePath: res.tempFilePath, //文件的临时路径
              success: ({ savedFilePath }) => {
                const tmpData = {
                  ...this.downloaded,
                };
                console.log(savedFilePath);
                tmpData[this.msgID] = savedFilePath;
                uni.setStorage({
                  key: `${this.loginUserID}_downloaded`,
                  data: {
                    ...tmpData,
                  },
                });
                this.downloaded = {
                  ...tmpData,
                };
                uni.$u.toast(`文件已保存到${getPurePath(savedFilePath)}`);
                // 打开文件
                uni.openDocument({
                  filePath: escape(savedFilePath),
                  success: function () {},
                  fail: function () {},
                  complete: () => {
                    this.$refs.uToast.hide();
                    this.downloading = false;
                  },
                });
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
      uni.openDocument({
        filePath: this.downloadUrl,
        fail: function () {
          uni.$u.toast(
            `文件打开失败，请前往文件管理器打开`,
          );
        },
      });
    },
    showToast(message, isLoading = false) {
      if (this.$refs.uToast.isShow) {
        this.$refs.uToast.hide();
      }

      this.$refs.uToast.show({
        message,
        position: "bottom",
        loading: isLoading,
        type: isLoading ? "loading" : "default",
        duration: isLoading ? 6000 : 2000,
      });
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
  },
};
</script>

<style lang="scss">
.preview_file_container {
  @include colBox(false);
  height: 100vh;

  .main_area {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;
  }

  .file_info {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #0c1c33;

    .file_name {
      @include nomalEllipsis();
      font-weight: 500;
      max-width: 80vw;
    }

    .file_size {
      font-size: 28rpx;
      margin-top: 8rpx;
    }

    image {
      width: 56px;
      height: 56px;
      margin-bottom: 36rpx;
    }
  }

  .doload_action {
    display: flex;
    justify-content: center;
  }
}
</style>
