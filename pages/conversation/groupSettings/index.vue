<template>
  <view class="group_settings_container">
    <custom-nav-bar title="群聊设置" />
    <view class="group_settings_content">
      <view class="setting_row info_row">
        <view class="group_avatar" @click="updateGroupAvatar">
          <my-avatar
            :src="storeCurrentConversation.faceURL"
            :isGroup="true"
            size="46"
          />
          <image
            v-if="isOwner"
            class="edit_icon"
            src="@/static/images/group_setting_edit.png"
            alt=""
          />
        </view>
        <view class="group_info">
          <view class="group_info_name">
            <text class="group_name"
              >{{ storeCurrentConversation.showName }}({{
                storeCurrentGroup.memberCount
              }})</text
            >
            <image
              v-if="isOwner || isAdmin"
              @click="toUpdateGroupName"
              style="width: 24rpx; height: 24rpx"
              src="@/static/images/group_edit.png"
              alt=""
            />
          </view>

          <text @click="copyGroupID" class="sub_title">{{
            storeCurrentConversation.groupID
          }}</text>
        </view>
      </view>

      <group-member-row
        v-if="isJoinGroup"
        :isNomal="!isAdmin && !isOwner"
        :groupID="storeCurrentConversation.groupID"
        :memberCount="storeCurrentGroup.memberCount"
        :groupMemberList="groupMemberList"
      />
      <view v-if="isJoinGroup" class="setting_row">
        <setting-item
          v-if="isOwner || isAdmin"
          @click="toGroupManage"
          title="群管理"
          :border="false"
        />
      </view>

      <view class="setting_row">
        <setting-item
          v-if="isJoinGroup"
          danger
          @click="() => (confirmType = isOwner ? 'Dismiss' : 'Quit')"
          :title="isOwner ? '解散群聊' : '退出群聊'"
          :border="false"
        />
      </view>

      <u-modal
        :content="getConfirmContent"
        asyncClose
        :show="confirmType !== null"
        showCancelButton
        @confirm="confirm"
        @cancel="() => (confirmType = null)"
      ></u-modal>
    </view>

    <u-toast ref="uToast"></u-toast>
    <action-sheet
      :groupID="storeCurrentConversation.groupID"
      :visible.sync="actionSheetVisible"
    />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { GroupMemberListTypes } from "@/constant";
import IMSDK, {
  GroupMemberRole,
  GroupStatus,
  GroupVerificationType,
  IMMethods,
  MessageReceiveOptType,
} from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import GroupMemberRow from "./components/GroupMemberRow.vue";
import ActionSheet from "./components/ActionSheet.vue";
import { getPurePath } from "@/util/common";

const ConfirmTypes = {
  Dismiss: "Dismiss",
  Quit: "Quit",
};

export default {
  components: {
    CustomNavBar,
    MyAvatar,
    SettingItem,
    GroupMemberRow,
    ActionSheet,
  },
  props: {},
  data() {
    return {
      actionSheetVisible: false,
      confirmType: null,
      switchLoading: {
        pin: false,
        opt: false,
        mute: false,
      },
      groupMemberList: [],
      isJoinGroup: true
    };
  },
  onShow() {
    this.getGroupMemberList();
    if (this.storeCurrentConversation.groupID) {
      IMSDK.asyncApi(
        IMMethods.IsJoinGroup,
        IMSDK.uuid(),
        this.storeCurrentConversation.groupID
      ).then((res) => {
        this.isJoinGroup = res.data
      });
    }
  },
  watch: {
    "storeCurrentGroup.memberCount"() {
      this.getGroupMemberList();
    },
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeCurrentMemberInGroup",
      "storeCurrentGroup",
    ]),
    getConfirmContent() {
      if (this.confirmType === ConfirmTypes.Quit) {
        return "确定要退出当前群聊吗？";
      }
      if (this.confirmType === ConfirmTypes.Dismiss) {
        return "确定要解散当前群聊吗？";
      }
      return "";
    },
    isOwner() {
      return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Owner;
    },
    isAdmin() {
      return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Admin;
    },
    getGroupVerStr() {
      if (
        this.storeCurrentGroup.needVerification ===
        GroupVerificationType.ApplyNeedInviteNot
      ) {
        return "群成员邀请无需验证";
      }
      if (
        this.storeCurrentGroup.needVerification === GroupVerificationType.AllNot
      ) {
        return "允许所有人加群";
      }
      return "需要发送验证消息";
    },
    isAllMuted() {
      return this.storeCurrentGroup.status === GroupStatus.Muted;
    },
  },
  methods: {
    getGroupMemberList() {
      IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
        groupID: this.storeCurrentConversation.groupID,
        filter: 0,
        offset: 0,
        count: !this.isAdmin && !this.isOwner ? 9 : 8,
      })
        .then(({ data }) => {
          console.log(data);
          this.groupMemberList = [...data];
        })
        .catch((err) => {
          console.log(err);
        });
    },
    toGroupManage() {
      uni.navigateTo({
        url: "/pages/conversation/groupManage/index",
      });
    },
    toUpdateGroupName() {
      if (!this.isAdmin && !this.isOwner) {
        return;
      }

      uni.navigateTo({
        url: `/pages/conversation/updateGroupOrNickname/index?sourceInfo=${JSON.stringify(
          this.storeCurrentGroup,
        )}`,
      });
    },
    copyGroupID() {
      uni.setClipboardData({
        data: this.storeCurrentGroup.groupID,
        success: () => {
          uni.hideToast();
          this.$nextTick(() => {
            uni.$u.toast("复制成功");
          });
        },
      });
    },
    showActionSheet() {
      if (!this.isAdmin && !this.isOwner) {
        return;
      }

      this.actionSheetVisible = true;
    },
    updateGroupAvatar() {
      if (!this.isAdmin && !this.isOwner) {
        return;
      }

      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async ({ tempFilePaths }) => {
          const path = tempFilePaths[0];
          const nameIdx = path.lastIndexOf("/") + 1;
          const typeIdx = path.lastIndexOf(".") + 1;
          const fileName = path.slice(nameIdx);
          const fileType = path.slice(typeIdx);
          try {
            const {
              data: { url },
            } = await IMSDK.asyncApi(IMMethods.UploadFile, IMSDK.uuid(), {
              filepath: getPurePath(tempFilePaths[0]),
              name: fileName,
              contentType: fileType,
              uuid: IMSDK.uuid(),
            });
            await IMSDK.asyncApi(IMSDK.IMMethods.SetGroupInfo, IMSDK.uuid(), {
              groupID: this.storeCurrentConversation.groupID,
              faceURL: url,
            });
            uni.$u.toast("修改成功");
          } catch (error) {
            uni.$u.toast("修改失败");
          }
        },
      });
    },
    confirm() {
      let funcName = "";
      let sourceID = this.storeCurrentConversation.groupID;
      if (this.confirmType === ConfirmTypes.Quit) {
        funcName = IMSDK.IMMethods.QuitGroup;
      }
      if (this.confirmType === ConfirmTypes.Dismiss) {
        funcName = IMSDK.IMMethods.DismissGroup;
      }
      IMSDK.asyncApi(funcName, IMSDK.uuid(), sourceID)
        .then(() => {
          uni.$u.toast("操作成功");
          setTimeout(
            () =>
              uni.switchTab({
                url: "/pages/conversation/conversationList/index",
              }),
            250,
          );
        })
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.confirmType = null));
    },
  },
};
</script>

<style lang="scss" scoped>
.group_settings_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .group_settings_content {
    overflow-y: auto;
  }

  .setting_row {
    background-color: #fff;
    margin: 24rpx;
    border-radius: 6px;
    overflow: hidden;
  }

  .info_row {
    @include vCenterBox();
    padding: 36rpx 44rpx;

    .group_avatar {
      margin-right: 16rpx;
      position: relative;

      .edit_icon {
        position: absolute;
        right: -6rpx;
        bottom: -6rpx;
        width: 11px;
        height: 11px;
      }
    }

    .group_info {
      min-height: 46px;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;

      &_name {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .group_name {
          // @include nomalEllipsis();
          font-size: 34rpx;
          max-width: 380rpx;
          margin-right: 24rpx;
        }
      }

      .sub_title {
        @include nomalEllipsis();
        margin-bottom: 0;
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style>
