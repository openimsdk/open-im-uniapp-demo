<template>
  <view class="contact_choose_container">
    <u-modal
      :show="showConfirmModal"
      showCancelButton
      asyncClose
      @confirm="modalConfirm"
      @cancel="() => (showConfirmModal = false)"
      :content="`确定要发送${cardInfo.nickname}的名片吗？`"
    />
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
        <template v-for="item in tabs">
          <setting-item
            v-if="!(!showGroup && item.idx === 2)"
            @click="tabChange(item.idx)"
            :key="item.idx"
            :title="item.title"
            :border="false"
          />
        </template>

        <view class="tab_pane" v-if="showConversation">
          <view class="title">
            <text style="margin-left: 36rpx">最近会话</text>
          </view>
          <u-list class="member_list">
            <u-list-item
              v-for="item in renderConversations"
              :key="item.conversationID"
            >
              <user-item
                @updateCheck="updateCheckedUserOrGroup"
                :checked="
                  checkedGroupIDList.includes(item.groupID) ||
                  checkedUserIDList.includes(item.userID)
                "
                :disabled="
                  disabledGroupIDList.includes(item.groupID) ||
                  disabledUserIDList.includes(item.userID)
                "
                :item="item"
                :checkVisible="showCheck"
              />
            </u-list-item>
          </u-list>
        </view>
        <view class="tab_pane" v-else></view>
      </template>

      <template v-else>
        <view class="tab_pane" v-show="activeTab === 1">
          <choose-index-list
            @itemClick="userClick"
            @updateCheck="updateCheckedUser"
            :indexList="getChooseData.indexList"
            :itemArr="getChooseData.dataList"
            :checkedIDList="checkedUserIDList"
            :disabledIDList="disabledUserIDList"
            :showCheck="showCheck"
          />
        </view>

        <view class="tab_pane" v-show="activeTab === 2">
          <u-list class="member_list">
            <u-list-item v-for="item in renderGroupList" :key="item.groupID">
              <user-item
                @updateCheck="updateCheckedGroup"
                :checked="checkedGroupIDList.includes(item.groupID)"
                :disabled="disabledGroupIDList.includes(item.groupID)"
                :item="item"
                :checkVisible="showCheck"
              />
            </u-list-item>
          </u-list>
        </view>
      </template>

    </view>
    <choose-index-footer
      :comfirmLoading="comfirmLoading"
      v-if="showCheck"
      @removeItem="updateCheckedUserOrGroup"
      @confirm="confirm"
      :choosedData="getCheckedInfo"
    />
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import { ContactChooseTypes, PageEvents } from "@/constant";
import { formatChooseData, toastWithCallback } from "@/util/common";
import { offlinePushInfo } from "@/util/imCommon";
import IMSDK, {
  GroupStatus,
  IMMethods,
  SessionType,
  MessageStatus,
} from "openim-uniapp-polyfill";
import { UpdateMessageTypes } from "@/constant";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserItem from "@/components/UserItem/index.vue";
import ChooseIndexList from "@/components/ChooseIndexList/index.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";

const showGroupTypes = [
  ContactChooseTypes.Mute,
  ContactChooseTypes.ForWard,
  ContactChooseTypes.BatchForWard,
  ContactChooseTypes.MergeForWard,
  ContactChooseTypes.SendImage
];

const showConversationTypes = [
  ContactChooseTypes.ForWard,
  ContactChooseTypes.BatchForWard,
  ContactChooseTypes.MergeForWard,
  ContactChooseTypes.ShareCard,
  ContactChooseTypes.InviteMeeting,
  ContactChooseTypes.SendImage
];

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
      showConfirmModal: false,
      groupID: "",
      cardInfo: {},
      mergeInfo: {},
      forwardMessage: "",
      checkedUserIDList: [],
      disabledUserIDList: [],
      checkedGroupIDList: [],
      disabledGroupIDList: [],
      originConversations: [],
      comfirmLoading: false,
      tabs: [
        {
          idx: 1,
          title: "我的好友",
        },
        {
          idx: 2,
          title: "我的群聊",
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      "storeFriendList",
      "storeGroupList",
      "storeCurrentConversation",
      "storeCurrentUserID",
      "storeConversationList",
    ]),
    showCheck() {
      return this.type !== ContactChooseTypes.Card;
    },
    showGroup() {
      return showGroupTypes.includes(this.type);
    },
    showConversation() {
      return showConversationTypes.includes(this.type);
    },
    getChooseData() {
      if (this.keyword) {
        return {
          indexList: ["#"],
          dataList: [
            this.storeFriendList.filter(
              (friend) =>
                friend.nickname.includes(this.keyword) ||
                friend.remark.includes(this.keyword),
            ),
          ],
        };
      }
      return formatChooseData(this.storeFriendList);
    },
    renderGroupList() {
      return this.keyword
        ? this.storeGroupList.filter((group) =>
            group.groupName.includes(this.keyword),
          )
        : this.storeGroupList;
    },
    renderConversations() {
      return this.keyword
        ? this.originConversations.filter((cve) =>
            cve.showName.includes(this.keyword),
          )
        : this.originConversations;
    },
    getCheckedInfo() {
      const tmpUserIDList = [...this.checkedUserIDList];
      const tmpGroupIDList = [...this.checkedGroupIDList];
      const checkedFriends = this.storeFriendList.filter((friend) => {
        const idx = tmpUserIDList.findIndex(
          (userID) => userID === friend.userID,
        );
        if (idx > -1) {
          tmpUserIDList.splice(idx, 1);
        }
        return idx > -1;
      });
      const checkedGroups = this.storeGroupList.filter((group) => {
        const idx = tmpGroupIDList.findIndex(
          (groupID) => groupID === group.groupID,
        );
        if (idx > -1) {
          tmpGroupIDList.splice(idx, 1);
        }
        return idx > -1;
      });
      const checkedConversation = this.originConversations.filter(
        (cve) =>
          tmpUserIDList.includes(cve.userID) ||
          tmpGroupIDList.includes(cve.groupID),
      );
      return [...checkedFriends, ...checkedGroups, ...checkedConversation];
    },
  },
  onLoad(options) {
    const {
      groupID,
      type,
      mergeInfo,
      cardInfo,
      forwardMessage,
      checkedUserIDList,
      checkedGroupIDList,
    } = options;
    this.type = type;
    this.groupID = groupID;
    this.cardInfo = cardInfo ? JSON.parse(cardInfo) : {};
    this.mergeInfo = decodeURIComponent(mergeInfo);
    this.forwardMessage = decodeURIComponent(forwardMessage) || "";
    this.checkedUserIDList = checkedUserIDList
      ? JSON.parse(checkedUserIDList)
      : [];
    this.checkedGroupIDList = checkedGroupIDList
      ? JSON.parse(checkedGroupIDList)
      : [];
    this.originConversations = this.storeConversationList.filter(
      (conversation) =>
        conversation.conversationType !== SessionType.Notification,
    );
    if (this.type === ContactChooseTypes.Invite) {
      this.checkDisabledUser();
    }
    if (showGroupTypes.includes(this.type)) {
      this.checkDisabledGroup();
    }
  },
  methods: {
    checkDisabledUser() {
      const friendIDList = this.storeFriendList.map((friend) => friend.userID);
      IMSDK.asyncApi(
        "getUsersInGroup",
        IMSDK.uuid(),
        {
          groupID: this.groupID,
          userIDList: friendIDList,
        },
      ).then(({ data }) => {
        this.disabledUserIDList = data;
      });
    },
    checkDisabledGroup() {
      this.disabledGroupIDList = this.storeGroupList
        .filter((group) => group.status !== GroupStatus.Nomal)
        .map((group) => group.groupID);
    },
    tabChange(idx) {
      this.keyword = "";
      this.activeTab = idx;
    },
    updateCheckedUserOrGroup(item) {
      if (item.userID) {
        this.updateCheckedUser(item);
      } else {
        this.updateCheckedGroup(item);
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
    updateCheckedGroup({ groupID }) {
      if (this.checkedGroupIDList.includes(groupID)) {
        const idx = this.checkedGroupIDList.findIndex(
          (item) => item === groupID,
        );
        const tmpArr = [...this.checkedGroupIDList];
        tmpArr.splice(idx, 1);
        this.checkedGroupIDList = [...tmpArr];
      } else {
        this.checkedGroupIDList = [...this.checkedGroupIDList, groupID];
      }
    },
    userClick(item) {
      this.cardInfo = {
        ...item,
      };
      this.showConfirmModal = true;
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

      this.getCheckedInfo.map(async (item) => {
        let message = {};

        if (this.type === ContactChooseTypes.SendImage) {
          message = JSON.parse(this.forwardMessage)
        }

        if (this.type === ContactChooseTypes.ForWard) {
          message = await IMSDK.asyncApi(
            IMMethods.CreateForwardMessage,
            IMSDK.uuid(),
            JSON.parse(this.forwardMessage),
          );
        }

        if (this.type === ContactChooseTypes.ShareCard) {
          message = await IMSDK.asyncApi(
            IMMethods.CreateCardMessage,
            IMSDK.uuid(),
            this.cardInfo,
          );
        }

        if (this.type === ContactChooseTypes.MergeForWard) {
          const { messageList, title, summaryList } = JSON.parse(
            this.mergeInfo,
          );
          message = await IMSDK.asyncApi(
            IMMethods.CreateMergerMessage,
            IMSDK.uuid(),
            {
              messageList,
              title,
              summaryList,
            },
          );
        }

        if (this.type === ContactChooseTypes.BatchForWard) {
          const { messageList } = JSON.parse(this.mergeInfo);
					let arr = []
					const promiseArray = messageList.map(async (item) => {
						const message = await IMSDK.asyncApi(
							IMMethods.CreateForwardMessage,
							IMSDK.uuid(),
							item,
						);
					  arr.push(message);
					});
					
					Promise.all(promiseArray)
					  .then(() => {
					    // console.log(arr);
							arr.map((message)=>{
								IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
								    recvID: item.userID,
								    groupID: item.groupID,
								    message,
								    offlinePushInfo,
								  })
								    .then(({ data }) => {
								      if (!isInConversation) return;
								      this.$store.dispatch("message/updateOneMessage", {
								        message: data,
								        isSuccess: true,
								      });
								    })
								    .catch(({ data, errCode, errMsg }) => {
								      if (!isInConversation) return;
								      this.$store.dispatch("message/updateOneMessage", {
								        message: data,
								        type: UpdateMessageTypes.KeyWords,
								        keyWords: [
								          {
								            key: "status",
								            value: MessageStatus.Failed,
								          },
								          {
								            key: "errCode",
								            value: errCode,
								          },
								        ],
								      });
								    });
							})
					  })
					  .catch((error) => {
					    console.error("BatchForWard Error:", error);
					  });
					return null
        }

        const isInConversation = this.inCurrentConversation(item);
        if (isInConversation) {
          this.$store.dispatch("message/pushNewMessage", message);
        }
        IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
          recvID: item.userID,
          groupID: item.groupID,
          message,
          offlinePushInfo,
        })
          .then(({ data }) => {
            if (!isInConversation) return;
            this.$store.dispatch("message/updateOneMessage", {
              message: data,
              isSuccess: true,
            });
          })
          .catch(({ data, errCode, errMsg }) => {
            if (!isInConversation) return;
            this.$store.dispatch("message/updateOneMessage", {
              message: data,
              type: UpdateMessageTypes.KeyWords,
              keyWords: [
                {
                  key: "status",
                  value: MessageStatus.Failed,
                },
                {
                  key: "errCode",
                  value: errCode,
                },
              ],
            });
          });
      });
      uni.$emit(PageEvents.MutipleCheckUpdate, { flag: false });
      toastWithCallback("转发成功", () => uni.navigateBack());
      this.comfirmLoading = false;
    },
    async modalConfirm() {
      const message = await IMSDK.asyncApi(
        IMMethods.CreateCardMessage,
        IMSDK.uuid(),
        this.cardInfo,
      );
      this.$store.dispatch("message/pushNewMessage", message);
      IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
        recvID: this.storeCurrentConversation.userID,
        groupID: this.storeCurrentConversation.groupID,
        message,
        offlinePushInfo,
      })
        .then(({ data }) => {
          this.$store.dispatch("message/updateOneMessage", {
            message: data,
            isSuccess: true,
          });
        })
        .catch(({ data, errCode, errMsg }) => {
          this.$store.dispatch("message/updateOneMessage", {
            message: data,
            type: UpdateMessageTypes.KeyWords,
            keyWords: [
              {
                key: "status",
                value: MessageStatus.Failed,
              },
              {
                key: "errCode",
                value: errCode,
              },
            ],
          });
        });
      // this.$nextTick(() => uni.$emit(PageEvents.ScrollToBottom, parsedMessage.clientMsgID))
      toastWithCallback("发送成功", () => {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.$vm.scrollToBottom();
        this.activeTab = 0;
        uni.navigateBack({
          delta: 1,
        });
      });
      this.showConfirmModal = false;
    },
    inCurrentConversation(item) {
      if (item.userID) {
        return item.userID === this.storeCurrentConversation.userID;
      }
      return item.groupID === this.storeCurrentConversation.groupID;
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
