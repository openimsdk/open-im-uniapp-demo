<template>
  <view @click="pageClick" class="group_members_container">
    <group-member-list-header
      ref="navHeaderRef"
      :checkVisible.sync="showCheck"
      :isTransfer="isTransfer"
      :isAt="isAt"
      :isSetAdmin="isSetAdmin"
      :isMute="isMute"
      :isNomal="!isOwner && !isAdmin"
      :isCall="type === 'CallInvite'"
      :groupID="groupID"
      @removeMember="showMemberCheck"
    />

    <view class="search_bar_wrap">
      <u-search
        :disabled="groupMemberList.length === 0"
        @clear="searchOrCancel"
        @custom="searchOrCancel"
        @search="searchMember"
        class="search_bar"
        shape="square"
        placeholder="搜索"
        :showAction="false"
        :actionText="isSearching ? '取消' : '搜索'"
        v-model="keyword"
      />
    </view>

    <view v-if="type === 'ChooseAt'" class="at_all_btn" @click="atAll">
      所有人
    </view>

    <u-list
      class="member_list"
      @scrolltolower="loadMore"
      lowerThreshold="100"
      height="1"
    >
      <u-list-item v-for="member in getRenderData" :key="member.userID">
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
        v-show="loadState.loading || searchState.loading"
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
import IMSDK, { AllowType, GroupMemberRole } from "openim-uniapp-polyfill";
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
      isSearching: false,
      showConfirmModal: false,
      comfirmLoading: false,
      groupMemberList: [],
      searchMemberList: [],
      searchChoosedList: [],
      choosedMemberIDList: [],
      choosedTransferMember: {},
      type: GroupMemberListTypes.Preview,
      isRightKick: true,
      loadState: {
        hasMore: true,
        loading: false,
      },
      searchState: {
        hasMore: true,
        loading: false,
      },
      callMediaType: "",
    };
  },
  computed: {
    getRenderData() {
      return this.isSearching ? this.searchMemberList : this.groupMemberList;
    },
    getChoosedData() {
      const tmpList = [...this.choosedMemberIDList];
      return [...this.groupMemberList, ...this.searchChoosedList].filter(
        (member) => {
          const idx = tmpList.findIndex((item) => item === member.userID);
          if (idx > -1) {
            tmpList.splice(idx, 1);
          }
          return idx > -1;
        },
      );
    },
    isSetAdmin() {
      return this.type === GroupMemberListTypes.SetAdmin;
    },
    isMute() {
      return this.type === GroupMemberListTypes.Mute;
    },
    isRemove() {
      return this.type === GroupMemberListTypes.Kickout;
    },
    isTransfer() {
      return this.type === GroupMemberListTypes.Transfer;
    },
    isAt() {
      return this.type === GroupMemberListTypes.ChooseAt;
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
        if ((this.type === GroupMemberListTypes.SetAdmin || this.type === GroupMemberListTypes.Mute) && roleLevel === GroupMemberRole.Admin) {
          return false
        }
        if (this.type === GroupMemberListTypes.Kickout) {
          return (
            (this.isOwner ||
              (this.isAdmin && roleLevel !== GroupMemberRole.Owner)) &&
            userID !== this.$store.getters.storeCurrentUserID
          );
        }
        if (this.type === GroupMemberListTypes.ChooseAt) {
          return true;
        }

        return userID !== this.$store.getters.storeCurrentUserID;
      };
    },
    groupMemberLength() {
      return this.$store.getters.storeCurrentGroup?.memberCount ?? 0;
    },
  },
  onLoad(options) {
    const { groupID, type, callMediaType } = options;
    this.loadMemberList(groupID);
    this.type = type;
    this.groupID = groupID;
    this.isRightKick = type === GroupMemberListTypes.Kickout;
    if (
      this.isRightKick ||
      type === GroupMemberListTypes.ChooseAt ||
      type === GroupMemberListTypes.CallInvite ||
      type === GroupMemberListTypes.SetAdmin ||
      type === GroupMemberListTypes.Mute
    ) {
      this.showCheck = true;
    }
    if (callMediaType) {
      this.callMediaType = callMediaType;
    }
    this.setIMListener();
  },
  onUnload() {
    this.disposeIMListener();
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
    searchOrCancel() {
      if (this.isSearching) {
        this.isSearching = false;
        this.keyword = "";
        this.searchState.hasMore = true;
        this.searchState.loading = false;
      } else {
        this.searchMember();
      }
    },
    async searchMember() {
      this.isSearching = true;
      this.searchMemberList = [];
      await this.loadSearchList();
    },
    confirm() {
      if (
        this.type === GroupMemberListTypes.ChooseAt ||
        this.type === GroupMemberListTypes.CallInvite
      ) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        if (this.type === GroupMemberListTypes.ChooseAt) {
          prevPage.$vm.getCheckedUsers(this.getChoosedData);
        } else {
          prevPage.$vm.sendRtcInvite(
            this.callMediaType,
            this.getChoosedData.map((item) => item.userID),
          );
        }
        uni.navigateBack({
          delta: 1,
        });
        return;
      }
      this.showConfirmModal = true;
    },
    atAll() {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.$vm.getCheckedUsers([
        ...this.getChoosedData,
        {
          userID: "AtAllTag",
          nickname: "所有人",
        },
      ]);
      uni.navigateBack({
        delta: 1,
      });
    },
    modalConfirm() {
      let func = () => {};
      if (this.type === GroupMemberListTypes.Kickout) {
        func = IMSDK.asyncApi(IMSDK.IMMethods.KickGroupMember, IMSDK.uuid(), {
          groupID: this.getChoosedData[0].groupID,
          reason: "",
          userIDList: this.getChoosedData.map((member) => member.userID),
        });
      }
      func
        .then(() => {
          uni.$u.toast("操作成功");
          this.showCheck = false;
          uni.navigateBack({
            delta: 1,
          });
        })
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
        if (
          this.$store.getters.storeCurrentGroup.lookMemberInfo ===
          AllowType.NotAllowed
        ) {
          return;
        }
        uni.$u.route("/pages/common/userCard/index", {
          sourceID: member.userID,
          memberInfo: JSON.stringify(member),
          disableAdd:
            this.$store.getters.storeCurrentGroup.applyMemberFriend ===
            AllowType.NotAllowed,
        });
      }
    },
    updateCheck(member) {
      if (
        this.isSearching &&
        !this.choosedMemberIDList.includes(member.userID)
      ) {
        this.searchChoosedList = [...this.searchChoosedList, member];
      }
      this.updateChoosedData(member.userID);
    },
    showMemberCheck() {
      this.type = GroupMemberListTypes.Kickout;
      this.showCheck = true;
    },
    loadMore() {
      const stateKey = !this.isSearching ? "loadState" : "searchState";
      const methodKey = !this.isSearching ? "loadMemberList" : "loadSearchList";
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
    async loadSearchList() {
      this.searchState.loading = true;
      const options = {
        groupID: this.groupID,
        keywordList: [this.keyword],
        isSearchUserID: true,
        isSearchMemberNickname: true,
        offset: this.searchMemberList.length,
        count: 20,
      };
      try {
        const { data } = await IMSDK.asyncApi(
          IMSDK.IMMethods.SearchGroupMembers,
          IMSDK.uuid(),
          options,
        );
        console.log(data);
        this.searchMemberList = [...this.searchMemberList, ...data];
        this.searchState.hasMore = data.length === 20;
      } catch (e) {}
      this.searchState.loading = false;
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
    groupMemberInfoChangeHandler({ data }) {
      if (data.groupID === this.groupMemberList[0]?.groupID) {
        const idx = this.groupMemberList.findIndex(
          (member) => member.userID === data.userID,
        );
        if (idx > -1) {
          const tmpArr = [...this.groupMemberList];
          tmpArr[idx] = {
            ...data,
          };
          this.groupMemberList = [...tmpArr];
        }
      }
    },
    groupMemberAddedHandler({ data }) {
      if (
        data.groupID === this.groupMemberList[0]?.groupID &&
        this.groupMemberList.length < 20
      ) {
        const idx = this.groupMemberList.findIndex(
          (member) => member.userID === data.userID,
        );
        if (idx === -1) {
          this.groupMemberList = [...this.groupMemberList, data];
        }
      }
    },
    groupMemberDeletedHandler({ data }) {
      if (data.groupID === this.groupMemberList[0]?.groupID) {
        const idx = this.groupMemberList.findIndex(
          (member) => member.userID === data.userID,
        );
        if (idx !== -1) {
          const tmpArr = [...this.groupMemberList];
          tmpArr.splice(idx, 1);
          this.groupMemberList = [...tmpArr];
        }
      }
    },
    setIMListener() {
      uni.$on(IMSDK.IMEvents.OnGroupMemberInfoChanged, this.groupMemberInfoChangeHandler)
      uni.$on(IMSDK.IMEvents.OnGroupMemberAdded, this.groupMemberAddedHandler)
      uni.$on(IMSDK.IMEvents.OnGroupMemberDeleted, this.groupMemberDeletedHandler)
    },
    disposeIMListener() {
      uni.$off(IMSDK.IMEvents.OnGroupMemberInfoChanged, this.groupMemberInfoChangeHandler)
      uni.$off(IMSDK.IMEvents.OnGroupMemberAdded, this.groupMemberAddedHandler)
      uni.$off(IMSDK.IMEvents.OnGroupMemberDeleted, this.groupMemberDeletedHandler)
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
