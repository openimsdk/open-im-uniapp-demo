<template>
  <view class="create_group_container">
    <custom-nav-bar title="发起群聊" />
    <u-toast ref="uToast"></u-toast>
    <view class="main">
      <view class="group_base_info">
        <my-avatar
          @click="chooseImage"
          :isGroup="true"
          :src="groupFaceUrl"
          size="44"
        />
        <u--input
          placeholder="取个群名称方便后续搜索"
          border="none"
          maxlength="16"
          v-model="groupName"
        ></u--input>
      </view>

      <view class="member_row" @click="toChooseMember">
        <view class="desc_title">
          <text>群成员</text>
          <text>{{ `${checkedMemberList.length}人` }}</text>
        </view>
        <view class="member_list">
          <view
            v-for="member in checkedMemberList.slice(0, 5)"
            :key="member.userID"
            class="member_item"
          >
            <my-avatar :src="member.userID" :desc="member.nickname" size="42" />
          </view>
        </view>
      </view>
    </view>
    <view class="action_bar">
      <u-button
        :loading="createLoading"
        :disabled="disabledCreate"
        @click="complateCreate"
        type="primary"
        text="完成创建"
      ></u-button>
    </view>
  </view>
</template>

<script>
import { ContactChooseTypes } from "@/constant";
import IMSDK, {
  GroupType,
  IMMethods,
  SessionType,
} from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { navigateToDesignatedConversation } from "@/util/imCommon";
import { getPurePath, toastWithCallback, uploadForm } from "@/util/common";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
  },
  data() {
    return {
      groupName: "",
      groupFaceUrl: "",
      checkedMemberList: [],
      fileList: [],
      createLoading: false,
    };
  },
  computed: {
    disabledCreate() {
      return !this.groupName || this.checkedMemberList.length === 0;
    },
  },
  onLoad(options) {
    const { checkedMemberList } = options;
    this.checkedMemberList = checkedMemberList
      ? JSON.parse(checkedMemberList)
      : [];
  },
  methods: {
    toChooseMember() {
      const checkedIDList = this.checkedMemberList.map(
        (member) => member.userID,
      );
      uni.navigateTo({
        url: `/pages/common/contactChoose/index?type=${
          ContactChooseTypes.GetList
        }&checkedUserIDList=${JSON.stringify(checkedIDList)}`,
      });
    },
    complateCreate() {
      this.createLoading = true;
      const options = {
        adminUserIDs: [],
        memberUserIDs: this.checkedMemberList.map((member) => member.userID),
        groupInfo: {
          groupType: GroupType.WorkingGroup,
          groupName: this.groupName,
          faceURL: this.groupFaceUrl,
        },
      };
      IMSDK.asyncApi(IMSDK.IMMethods.CreateGroup, IMSDK.uuid(), options)
        .then(({ data }) => {
          toastWithCallback("创建成功", () =>
            navigateToDesignatedConversation(
              data.groupID,
              SessionType.WorkingGroup,
              true,
            ),
          );
        })
        .finally(() => (this.createLoading = false));
    },
    getCheckedUsers(list) {
      this.checkedMemberList = [...list];
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async ({ tempFilePaths, tempFiles }) => {
          const path = tempFilePaths[0];
          const nameIdx = path.lastIndexOf("/") + 1;
          const typeIdx = path.lastIndexOf(".") + 1;
          let fileName = path.slice(nameIdx);
          let fileType = path.slice(typeIdx);

          if (uni.getSystemInfoSync().uniPlatform !== 'app') {
            fileType = tempFiles[0].type
            fileName = tempFiles[0].name
          }

          try {
            // #ifdef MP-WEIXIN
            const url = await uploadForm(tempFiles[0])
            // #endif

            // #ifdef APP-PLUS || H5
            const {
              data: { url },
            } = await IMSDK.asyncApi(IMMethods.UploadFile, IMSDK.uuid(), {
              filepath: getPurePath(tempFilePaths[0]),
              name: fileName,
              contentType: fileType,
              uuid: IMSDK.uuid(),
              file: tempFiles[0]
            });
            // #endif
            this.groupFaceUrl = url;
          } catch (error) {
            uni.$u.toast("上传失败");
          }
        },
        fail: function (err) {
          uni.$u.toast("上传失败");
        },
      });
    },
  },
};
</script>

<style lang="scss">
.create_group_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .group_base_info {
    @include vCenterBox();
    padding: 44rpx;
    background-color: #fff;
    margin: 36rpx 0;

    .u-input {
      margin-left: 48rpx;
    }
  }

  .member_row {
    padding: 44rpx;
    background-color: #fff;
    color: #999;

    .desc_title {
      @include vCenterBox();
      justify-content: space-between;
    }

    .member_list {
      display: flex;
      flex-wrap: wrap;
      margin-top: 24rpx;

      .member_item {
        @include colBox(false);
        align-items: center;
        margin-right: 12rpx;

        .member_name {
          @include nomalEllipsis();
          max-width: 42px;
          margin-top: 12rpx;
        }
      }
    }
  }

  .action_bar {
    background-color: #fff;
    padding: 44rpx 44rpx;
  }
}
</style>
