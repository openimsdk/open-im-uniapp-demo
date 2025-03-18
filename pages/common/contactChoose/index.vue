<template>
  <view class="contact_choose_container">
    <custom-nav-bar title="联系人" />

    <view class="search_bar_wrap">
      <u-search
        shape="square"
        placeholder="搜索"
        :showAction="false"
        v-model="keyword"
      />
    </view>

    <view class="tab_container">
      <template v-if="activeTab === 0">
        <setting-item
          @click="tabChange(tabs[0].idx)"
          :title="tabs[0].title"
          :border="false"
        />

        <view class="tab_pane"></view>
      </template>

      <template v-else>
        <view class="tab_pane" v-show="activeTab === 1">
          <choose-index-list
            @updateCheck="updateCheckedUser"
            :indexList="getChooseData.indexList"
            :itemArr="getChooseData.dataList"
            :checkedIDList="checkedUserIDList"
            :disabledIDList="disabledUserIDList"
            :showCheck="true"
          />
        </view>
      </template>
    </view>
    <choose-index-footer
      :comfirmLoading="comfirmLoading"
      @removeItem="updateCheckedUserOrGroup"
      @confirm="confirm"
      :choosedData="getCheckedInfo"
    />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { ContactChooseTypes } from "@/constant";
import { formatChooseData, toastWithCallback } from "@/util/common";
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserItem from "@/components/UserItem/index.vue";
import ChooseIndexList from "@/components/ChooseIndexList/index.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";

export default {
  components: {
    CustomNavBar,
    UserItem,
    ChooseIndexList,
    ChooseIndexFooter,
    SettingItem,
  },
  data() {
    return {
      keyword: "",
      type: ContactChooseTypes.Card,
      activeTab: 0,
      groupID: "",
      checkedUserIDList: [],
      disabledUserIDList: [],
      comfirmLoading: false,
      tabs: [
        {
          idx: 1,
          title: "我的好友",
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      "storeFriendList",
      "storeCurrentConversation",
      "storeCurrentUserID",
      "storeConversationList",
    ]),
    getChooseData() {
      if (this.keyword) {
        return {
          indexList: ["#"],
          dataList: [
            this.storeFriendList.filter(
              (friend) =>
                friend.nickname.includes(this.keyword) ||
                friend.remark.includes(this.keyword)
            ),
          ],
        };
      }
      return formatChooseData(this.storeFriendList);
    },
    getCheckedInfo() {
      const tmpUserIDList = [...this.checkedUserIDList];
      const checkedFriends = this.storeFriendList.filter((friend) => {
        const idx = tmpUserIDList.findIndex(
          (userID) => userID === friend.userID
        );
        if (idx > -1) {
          tmpUserIDList.splice(idx, 1);
        }
        return idx > -1;
      });
      return [...checkedFriends];
    },
  },
  onLoad(options) {
    const {
      groupID,
      type,
      checkedUserIDList,
    } = options;
    this.type = type;
    this.groupID = groupID;
    this.checkedUserIDList = checkedUserIDList
      ? JSON.parse(checkedUserIDList)
      : [];
    if (this.type === ContactChooseTypes.Invite) {
      this.checkDisabledUser();
    }
  },
  methods: {
    checkDisabledUser() {
      const friendIDList = this.storeFriendList.map((friend) => friend.userID);
      IMSDK.asyncApi("getUsersInGroup", IMSDK.uuid(), {
        groupID: this.groupID,
        userIDList: friendIDList,
      }).then(({ data }) => {
        this.disabledUserIDList = data;
      });
    },
    tabChange(idx) {
      this.keyword = "";
      this.activeTab = idx;
    },
    updateCheckedUserOrGroup(item) {
      if (item.userID) {
        this.updateCheckedUser(item);
      }
    },
    updateCheckedUser({ userID }) {
      if (this.checkedUserIDList.includes(userID)) {
        const idx = this.checkedUserIDList.findIndex((item) => item === userID);
        const tmpArr = [...this.checkedUserIDList];
        tmpArr.splice(idx, 1);
        this.checkedUserIDList = [...tmpArr];
      } else {
        this.checkedUserIDList = [...this.checkedUserIDList, userID];
      }
    },
    confirm() {
      if (this.activeTab) {
        this.activeTab = 0;
        return;
      }
      this.comfirmLoading = true;
      if (this.type === ContactChooseTypes.GetList) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.$vm.getCheckedUsers(this.getCheckedInfo);
        this.comfirmLoading = false;

        uni.navigateBack({
          delta: 1,
        });
        return;
      }

      if (this.type === ContactChooseTypes.Invite) {
        IMSDK.asyncApi(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuid(), {
          groupID: this.groupID,
          reason: "",
          userIDList: this.getCheckedInfo.map((user) => user.userID),
        })
          .then(() => {
            toastWithCallback("操作成功", () => uni.navigateBack());
            this.comfirmLoading = false;
          })
          .catch(() => toastWithCallback("操作失败"));
        return;
      }

      this.comfirmLoading = false;
    },
  },
  onBackPress() {
    if (this.activeTab) {
      this.activeTab = 0;
      return true;
    }
    return false;
  },
};
</script>

<style lang="scss" scoped>
/deep/.u-popup {
  flex: none;
}
.contact_choose_container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .tab_container {
    @include colBox(false);
    flex: 1;
    overflow: hidden;

    .setting_item {
      padding: 32rpx 36rpx;
    }

    .title {
      height: 60rpx;
      display: flex;
      justify-content: start;
      align-items: center;
      // padding: 16rpx 8rpx;
      background: #f8f9fa;
      color: #8e9ab0;
      font-size: 24rpx;
    }

    .tabs_bar {
      @include vCenterBox();
      justify-content: space-evenly;

      .tab_item {
        @include colBox(false);
        align-items: center;

        image {
          width: 50px;
          height: 50px;
        }
      }
    }

    .tab_pane {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;

      .member_list {
        flex: 1;
        height: 80% !important;
        /deep/uni-scroll-view {
          max-height: 100% !important;
        }
      }

      .user_list {
        height: 100% !important;
      }

      .member_anchor {
        background-color: #f8f8f8 !important;
        border: none !important;
      }
    }
  }
}
</style>
