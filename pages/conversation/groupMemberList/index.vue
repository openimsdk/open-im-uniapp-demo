<template>
  <view @click="pageClick" class="group_members_container">
    <group-member-list-header
      ref="navHeaderRef"
      :checkVisible.sync="showCheck"
      :isTransfer="isTransfer"
      :isNomal="isNomal"
      :groupID="groupID"
      @removeMember="showMemberCheck"
    />

    <view class="search_bar_wrap">
      <u-search shape="square" placeholder="搜索" v-model="keyword" />
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
          :disabled="showCheck"
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
      @removeItem="updateCheck"
      @confirm="confirm"
      :choosedData="getChoosedData"
      :isRemove="isRemove"
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
import {
  GroupAllowTypes,
  GroupMemberListTypes,
  GroupMemberRole,
} from "@/constant";
import IMSDK from "@/util/compatibleIM";
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
    getRenderData() {
      return this.groupMemberList;
    },
    getChoosedData() {
      return this.groupMemberList.filter((member) =>
        this.choosedMemberIDList.includes(member.userID)
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
    isNomal() {
      return (
        this.$store.getters.storeCurrentMemberInGroup.roleLevel ===
        GroupMemberRole.Nomal
      );
    },
  },
  onLoad(options) {
    const { groupID, type } = options;
    this.loadMemberList(groupID);
    this.type = type;
    this.groupID = groupID;
    this.isRightKick = type === GroupMemberListTypes.Kickout;
    if (this.isRightKick) {
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
        func = IMSDK.compatibleAPI(
          IMSDK.IMMethods.KickGroupMember,
          IMSDK.uuidv4(),
          this.getChoosedData[0].groupID,
          "",
          this.getChoosedData.map((member) => member.userID)
        );
      } else {
        func = IMSDK.compatibleAPI(
          IMSDK.IMMethods.TransferGroupOwner,
          IMSDK.uuidv4(),
          this.choosedTransferMember.groupID,
          this.choosedTransferMember.userID
        );
      }
      func
        .then(() => this.showToast("操作成功", () => uni.navigateBack()))
        .catch(() => this.showToast("操作失败"));
    },
    updateChoosedData(userID) {
      if (this.choosedMemberIDList.includes(userID)) {
        const idx = this.choosedMemberIDList.findIndex(
          (item) => item === userID
        );
        const tmpArr = [...this.choosedMemberIDList];
        tmpArr.splice(idx, 1);
        this.choosedMemberIDList = tmpArr;
      } else {
        this.choosedMemberIDList = [...this.choosedMemberIDList, userID];
      }
    },
    userClick(member) {
      if (this.type === GroupMemberListTypes.Transfer) {
        this.choosedTransferMember = member;
        this.showConfirmModal = true;
      } else {
        uni.$u.route("/pages/common/userCard/index", {
          sourceID: member.userID,
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
      if (this.loadState.hasMore && !this.loadState.loading) {
        this.loadMemberList();
      }
    },
    loadMemberList(groupID) {
      this.loadState.loading = true;
      IMSDK.compatibleAPI(
        IMSDK.IMMethods.GetGroupMemberList,
        IMSDK.uuidv4(),
        groupID ?? this.groupID,
        0,
        this.groupMemberList.length,
        20
      )
        .then(({ data }) => {
          this.groupMemberList = [...this.groupMemberList, ...data];
          this.loadState.hasMore = data.length === 20;
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
    if (this.showCheck && !this.isRightKick) {
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

  /deep/.u-popup {
    flex: none;
  }

  .member_list {
    flex: 1;
  }
}
</style>
