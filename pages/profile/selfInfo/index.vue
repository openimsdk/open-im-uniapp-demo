<template>
  <view class="page_container">
    <custom-nav-bar title="个人资料" />

    <view class="info_wrap">
      <info-item :loading="loadingState.faceURL" @click="updateAvatar" title="头像">
        <my-avatar :src="selfInfo.faceURL" :desc="selfInfo.nickname" size="30" slot="value" />
      </info-item>
      <info-item @click="updateNickname" title="姓名" :content="selfInfo.nickname" />
      <info-item :loading="loadingState.gender" @click="updateGender" title="性别" :content="getGender" />
      <info-item :loading="loadingState.birth" @click="() => (showDatePicker = true)" title="生日" :content="getBirth" />
    </view>

    <view class="info_wrap">
      <info-item :showArrow="false" title="手机号码" :content="selfInfo.phoneNumber || '-'" />
      <info-item :showArrow="false" title="邮箱" :content="selfInfo.email || '-'" />
    </view>

    <u-datetime-picker :minDate="0" :maxDate="nowDate" :show="showDatePicker" @confirm="confirmDate"
      @cancel="() => (showDatePicker = false)" v-model="selfInfo.birth" mode="date" />
  </view>
</template>

<script>
import { businessInfoUpdate } from "@/api/login";
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import dayjs from "dayjs";
import InfoItem from "./InfoItem.vue";
import { getPurePath, uploadForm } from "@/util/common";

export default {
  components: {
    CustomNavBar,
    MyAvatar,
    InfoItem,
  },
  data() {
    return {
      showDatePicker: false,
      loadingState: {
        faceURL: false,
        gender: false,
        birth: false,
      },
      nowDate: Date.now(),
    };
  },
  computed: {
    selfInfo() {
      return this.$store.getters.storeSelfInfo;
    },
    getGender() {
      if (this.selfInfo.gender === 0) {
        return "保密";
      }
      if (this.selfInfo.gender === 1) {
        return "男";
      }
      return "女";
    },
    getBirth() {
      const birth = this.selfInfo.birth ?? 0;
      return dayjs(birth).format("YYYY-MM-DD");
    },
  },
  methods: {
    updateNickname() {
      uni.navigateTo({
        url: `/pages/common/markOrIDPage/index?isSelfNickname=true&sourceInfo=${JSON.stringify(
          this.selfInfo,
        )}`,
      });
    },
    updateGender() {
      uni.showActionSheet({
        itemList: ["男", "女"],
        success: async ({ tapIndex }) => {
          this.loadingState.gender = true;
          await this.updateSelfInfo(
            {
              gender: tapIndex + 1,
            },
            "gender",
          );
        },
      });
    },
    updateAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async ({ tempFilePaths, tempFiles }) => {
          const path = tempFilePaths[0];
          const nameIdx = path.lastIndexOf("/") + 1;
          const typeIdx = path.lastIndexOf(".") + 1;
          let fileName = path.slice(nameIdx);
          let fileType = path.slice(typeIdx);
          this.loadingState.faceURL = true;

          if (uni.getSystemInfoSync().uniPlatform !== 'app') {
            fileType = tempFiles[0].type
            fileName = tempFiles[0].name
          }

          // #ifdef MP-WEIXIN
          const url = await uploadForm(tempFiles[0])
          // #endif

          // #ifdef APP-PLUS || H5
          const {
            data: { url },
          } = await IMSDK.asyncApi(IMSDK.IMMethods.UploadFile, IMSDK.uuid(), {
            filepath: getPurePath(tempFilePaths[0]),
            name: fileName,
            contentType: fileType,
            uuid: IMSDK.uuid(),
            file: tempFiles[0]
          });
          // #endif
          console.log(url);
          this.updateSelfInfo(
            {
              faceURL: url,
            },
            "faceURL",
          );
          this.loadingState.faceURL = false;
        },
      });
    },
    toQrCode() {
      uni.navigateTo({
        url: `/pages/common/userOrGroupQrCode/index`,
      });
    },
    copyID() {
      uni.setClipboardData({
        data: this.selfInfo.userID,
        success: () => {
          uni.hideToast();
          this.$nextTick(() => {
            uni.$u.toast("复制成功");
          });
        },
      });
    },
    async updateSelfInfo(data, key) {
      try {
        await businessInfoUpdate({
          userID: this.selfInfo.userID,
          ...data,
        });
        await this.$store.dispatch("user/updateBusinessInfo");
        uni.$u.toast("修改成功");
      } catch (e) {
        console.log(e);
        uni.$u.toast("修改失败");
      }
      this.loadingState[key] = false;
    },
    confirmDate({ value }) {
      this.loadingState.birth = true;
      this.updateSelfInfo(
        {
          birth: value,
        },
        "birth",
      );
      this.showDatePicker = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  background-color: #f8f8f8;

  .info_wrap {
    margin: 24rpx 24rpx 0 24rpx;
    background: #fff;
    border-radius: 6px;

    .qr_icon {
      width: 22px;
      height: 23px;
    }
  }
}
</style>
