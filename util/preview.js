import { ContactChooseTypes } from "@/constant";
import { getPurePath } from "@/util/common";
import IMSDK, { IMMethods } from "openim-uniapp-polyfill";

const isWebResource = (url) => {
  const webResourceRegex = /^(http|https):\/\//i;
  return webResourceRegex.test(url);
};

export const forwardImg = async (localImagePath) => {
  const message = await IMSDK.asyncApi(
    IMMethods.CreateImageMessageFromFullPath,
    IMSDK.uuid(),
    getPurePath(localImagePath)
  );
  console.log(getPurePath(localImagePath), message);
  uni.navigateTo({
    url: `/pages/common/contactChoose/index?type=${
      ContactChooseTypes.SendImage
    }&forwardMessage=${encodeURIComponent(JSON.stringify(message))}`,
  });
};

export const downloadToAlbum = (url) => {
  uni.downloadFile({
    url,
    success(res) {
      let url = res.tempFilePath;
      uni.saveImageToPhotosAlbum({
        filePath: url,
        success() {
          uni.showToast({
            title: "已保存到系统相册",
            icon: "none",
          });
        },
        fail() {
          uni.showToast({
            title: "保存失败",
            icon: "none",
          });
        },
      });
    },
  });
};

export const myPreview = (current, urls) => {
  uni.previewImage({
    current,
    urls,
    indicator: "none",
    longPressActions: {
      itemList: ["转发图片", "保存图片"],
      success({ tapIndex, index }) {
        if (tapIndex === 0) {
          uni.closePreviewImage();

          if (isWebResource(urls[index])) {
            uni.getImageInfo({
              src: urls[index],
              success: (res) => {
                forwardImg(res.path);
              },
            });
          } else {
            forwardImg(urls[index]);
          }
        } else {
          downloadToAlbum(urls[index]);
        }
      },
    },
  });
};
