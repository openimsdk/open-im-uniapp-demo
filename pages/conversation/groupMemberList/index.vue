<template>
  <view @click="pageClick" class="group_members_container">
    <group-member-list-header
      ref="navHeaderRef"
      :checkVisible.sync="showCheck"
      :isTransfer="isTransfer"
      :isNomal="!isOwner && !isAdmin"
      :groupID="groupID"
      @removeMember="showMemberCheck"
    />

    <view class="search_bar_wrap">
      <u-search
        disabled
        class="search_bar"
        shape="square"
        placeholder="搜索"
        :showAction="false"
        v-model="keyword"
      />
    </view>

    <u-list
      class="member_list"
      @scrolltolower="loadMore"
      lowerThreshold="100"
      height="1"
    >
      <u-list-item v-for="member in groupMemberList" :key="member.userID">
        <user-item
          @itemClick="userClick"
          @updateCheck="updateCheck"
          :checked="isChecked(member.userID)"
          :checkVisible="showCheck"
          :disabled="!canCheck(member) && showCheck"
          :item="member"
        />
      </u-list-item>
      <view
        v-show="loadState.loading"
        class="member_loading"
      >
        <u-loading-icon></u-loading-icon>
      </view>
    </u-list>

    <choose-index-footer
      v-if="showCheck"
      :comfirmLoading="comfirmLoading"
      @removeItem="updateCheck"
      @confirm="confirm"
      :choosedData="getChoosedData"
      :isRemove="isRemove"
      :maxLength="groupMemberLength"
    />

    <u-modal
      :show="showConfirmModal"
      asyncClose
      showCancelButton
      @confirm="modalConfirm"
      @cancel="() => (showConfirmModal = false)"
      :content="
        isRemove
          ? '确定移除已选群成员？'
          : `确定要把群主转移给${choosedTransferMember.nickname}吗？`
      "
    />
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
let moreActionArea;
import { GroupMemberListTypes } from "@/constant";
import IMSDK, { GroupMemberRole } from "openim-uniapp-polyfill";
import UserItem from "@/components/UserItem/index.vue";
import GroupMemberListHeader from "./components/GroupMemberListHeader.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";
export default {
  components: {
    GroupMemberListHeader,
    ChooseIndexFooter,
    UserItem,
  },
  data() {
    return {
      showCheck: false,
      groupID: "",
      keyword: "",
      showConfirmModal: false,
      comfirmLoading: false,
      groupMemberList: [],
      choosedMemberIDList: [],
      choosedTransferMember: {},
      type: GroupMemberListTypes.Preview,
      isRightKick: true,
      loadState: {
        hasMore: true,
        loading: false,
      },
    };
  },
  computed: {
    getChoosedData() {
      const tmpList = [...this.choosedMemberIDList];
      return this.groupMemberList.filter(
        (member) => {
          const idx = tmpList.findIndex((item) => item === member.userID);
          if (idx > -1) {
            tmpList.splice(idx, 1);
          }
          return idx > -1;
        },
      );
    },
    isRemove() {
      return this.type === GroupMemberListTypes.Kickout;
    },
    isTransfer() {
      return this.type === GroupMemberListTypes.Transfer;
    },
    isChecked() {
      return (userID) => this.choosedMemberIDList.includes(userID);
    },
    isOwner() {
      return (
        this.$store.getters.storeCurrentMemberInGroup.roleLevel ===
        GroupMemberRole.Owner
      );
    },
    isAdmin() {
      return (
        this.$store.getters.storeCurrentMemberInGroup.roleLevel ===
        GroupMemberRole.Admin
      );
    },
    canCheck() {
      return ({ roleLevel, userID }) => {
        if (this.type === GroupMemberListTypes.Kickout) {
          return (
            (this.isOwner ||
              (this.isAdmin && roleLevel !== GroupMemberRole.Owner)) &&
            userID !== this.$store.getters.storeCurrentUserID
          );
        }

        return userID !== this.$store.getters.storeCurrentUserID;
      };
    },
    groupMemberLength() {
      return this.$store.getters.storeCurrentGroup?.memberCount ?? 0;
    },
  },
  onLoad(options) {
    const { groupID, type } = options;
    this.loadMemberList(groupID);
    this.type = type;
    this.groupID = groupID;
    this.isRightKick = type === GroupMemberListTypes.Kickout;
    if (
      this.isRightKick
    ) {
      this.showCheck = true;
    }
  },
  methods: {
    async pageClick(e) {
      if (!moreActionArea) {
        moreActionArea = await this.getEl(".more_container");
      }
      if (!moreActionArea) return;
      if (
        e.target.y < moreActionArea.top ||
        e.target.y > moreActionArea.bottom ||
        e.target.x < moreActionArea.left
      ) {
        this.$refs.navHeaderRef.checkMenu();
      }
    },
    confirm() {
      this.showConfirmModal = true;
    },
    modalConfirm() {
      let func = () => {};
      if (this.type === GroupMemberListTypes.Kickout) {
        func = IMSDK.asyncApi(IMSDK.IMMethods.KickGroupMember, IMSDK.uuid(), {
          groupID: this.getChoosedData[0].groupID,
          reason: "",
          userIDList: this.getChoosedData.map((member) => member.userID),
        });
      } else {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.TransferGroupOwner,
          IMSDK.uuid(),
          {
            groupID: this.choosedTransferMember.groupID,
            newOwnerUserID: this.choosedTransferMember.userID,
          },
        );
      }
      func
        .then(() => this.showToast("操作成功", () => uni.navigateBack()))
        .catch(() => this.showToast("操作失败"))
        .finally(() => (this.showConfirmModal = false));
    },
    updateChoosedData(userID) {
      if (this.choosedMemberIDList.includes(userID)) {
        const idx = this.choosedMemberIDList.findIndex(
          (item) => item === userID,
        );
        const tmpArr = [...this.choosedMemberIDList];
        tmpArr.splice(idx, 1);
        this.choosedMemberIDList = tmpArr;
      } else {
        this.choosedMemberIDList = [...this.choosedMemberIDList, userID];
      }
      console.log(this.choosedMemberIDList);
    },
    userClick(member) {
      if (this.type === GroupMemberListTypes.Transfer) {
        if (member.userID === this.$store.getters.storeCurrentUserID) return;
        this.choosedTransferMember = member;
        this.showConfirmModal = true;
      } else {
        uni.$u.route("/pages/common/userCard/index", {
          sourceID: member.userID,
          memberInfo: JSON.stringify(member),
        });
      }
    },
    updateCheck(member) {
      this.updateChoosedData(member.userID);
    },
    showMemberCheck() {
      this.type = GroupMemberListTypes.Kickout;
      this.showCheck = true;
    },
    loadMore() {
      const stateKey = "loadState";
      const methodKey = "loadMemberList";
      if (this[stateKey].hasMore && !this[stateKey].loading) {
        this[methodKey]();
      }
    },
    loadMemberList(groupID) {
      this.loadState.loading = true;
      IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
        groupID: groupID ?? this.groupID,
        filter: 0,
        offset: this.groupMemberList.length,
        count: 500,
      })
        .then(({ data }) => {
          this.groupMemberList = [...this.groupMemberList, ...data];
          this.loadState.hasMore = data.length === 500;
        })
        .finally(() => (this.loadState.loading = false));
    },
    showToast(message, complete = null) {
      this.$refs.uToast.show({
        message,
        complete,
      });
    },
    getEl(el) {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(el)
          .boundingClientRect((data) => {
            // 存在data，且存在宽和高，视为渲染完毕
            resolve(data);
          })
          .exec();
      });
    },
  },
  onBackPress(options) {
    if (this.showCheck && this.isRightKick) {
      this.showCheck = false;
      this.type = GroupMemberListTypes.Preview;
      return true;
    }
    return false;
  },
};
</script>

<style lang="scss" scoped>
.group_members_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .at_all_btn {
    font-weight: 500;
    padding: 24rpx 44rpx;
  }

  /deep/.u-popup {
    flex: none;
  }

  .member_list {
    flex: 1;
  }
}
</style>
