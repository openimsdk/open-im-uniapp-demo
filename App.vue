<script>
import { mapGetters, mapActions } from "vuex";
import IMSDK from "@/util/compatibleIM";
import { getDbDir } from "@/util/common.js";
import { conversationSort } from "@/util/imCommon.js";
import {
  SessionType,
  MessageType,
  PageEvents,
  UpdateMessageTypes,
} from "@/constant";
import config from "./common/config";


export default {
  onLaunch: function () {
    this.setGlobalIMlistener();
    getDbDir()
      .then((path) => {
        const flag = IMSDK.IMApi.initSDK(IMSDK.uuidv4(), {
          platform: uni.$u.os() === 'ios' ? 1 : 2, // 平台，参照IMPlatform类,
          api_addr: config.apiUrl, // SDK的API接口地址。如：http://xxx:10002
          ws_addr: config.wsUrl, // SDK的websocket地址。如： ws://xxx:10001
          data_dir: path, // 数据存储路径
          object_storage: config.objectStorage, // 图片服务器
          log_level: 6,
        });

        if (!flag) {
          plus.navigator.closeSplashscreen();
          uni.$u.toast("初始化IMSDK失败！");
          return;
        }

        // 设置相关监听
        IMSDK.IMApi.setUserListener();
        IMSDK.IMApi.setFriendListener();
        IMSDK.IMApi.setGroupListener();
        IMSDK.IMApi.setAdvancedMsgListener();
        IMSDK.IMApi.setConversationListener();
        IMSDK.IMApi.setBatchMsgListener();

        const IMToken = uni.getStorageSync("IMToken");
        const IMUserID = uni.getStorageSync("IMUserID");
        if (IMToken && IMUserID) {
          IMSDK.compatibleAPI(
            IMSDK.IMMethods.Login,
            IMSDK.uuidv4(),
            IMUserID,
            IMToken
          )
            .then((res) => {
              this.$store.dispatch("user/getSelfInfo");
              this.$store.dispatch("conversation/getConversationList");
              this.$store.dispatch("contact/getFriendList");
              this.$store.dispatch("contact/getGrouplist");
              this.$store.dispatch("contact/getBlacklist");
              this.$store.dispatch("contact/getRecvFriendApplications");
              this.$store.dispatch("contact/getSentFriendApplications");
              this.$store.dispatch("contact/getRecvGroupApplications");
              this.$store.dispatch("contact/getSentGroupApplications");
              uni.switchTab({
                url: "/pages/conversation/conversationList/index?isRedirect=true",
              });
            })
            .catch((err) => {
              console.log(err);
              uni.removeStorage({
                key: "IMToken",
              });
              uni.removeStorage({
                key: "BusinessToken",
              });
              plus.navigator.closeSplashscreen();
            });
        } else {
          plus.navigator.closeSplashscreen();
        }
      })
      .catch(() => plus.navigator.closeSplashscreen());
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  computed: {
    ...mapGetters([
      "storeConversationList",
      "storeCurrentConversation",
      "storeCurrentUserID",
      "storeSelfInfo",
      "storeRecvFriendApplications",
      "storeRecvGroupApplications",
      "storeHistoryMessageList",
    ]),
    contactBadgeRely() {
      return {
        recvFriendApplications: this.storeRecvFriendApplications,
        recvGroupApplications: this.storeRecvGroupApplications,
        userKey: this.storeCurrentUserID,
      };
    },
  },
  methods: {
    ...mapActions("message", ["pushNewMessage", "updateOneMessage"]),
    ...mapActions("conversation", ["updateCurrentMemberInGroup"]),
    ...mapActions("contact", [
      "updateFriendInfo",
      "pushNewFriend",
      "updateBlackInfo",
      "pushNewBlack",
      "pushNewGroup",
      "updateGroupInfo",
      "pushNewRecvFriendApplition",
      "updateRecvFriendApplition",
      "pushNewSentFriendApplition",
      "updateSentFriendApplition",
      "pushNewRecvGroupApplition",
      "updateRecvGroupApplition",
      "pushNewSentGroupApplition",
      "updateSentGroupApplition",
    ]),
    setGlobalIMlistener() {
      // init
      IMSDK.subscribe(IMSDK.IMEvents.OnConnectFailed, (data) => {
        console.log(data);
      });
      IMSDK.subscribe(IMSDK.IMEvents.OnConnecting, (data) => {
        console.log(data);
      });
      IMSDK.subscribe(IMSDK.IMEvents.OnConnectSuccess, (data) => {
        console.log(data);
      });

      // sync
      const syncStartHandler = () => {};
      const syncFinishHandler = () => {};
      const syncFailedHandler = () => {};
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerStart, syncStartHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFinish, syncFinishHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFailed, syncFailedHandler);

      // self
      const selfInfoUpdateHandler = ({ userInfo }) => {
        const info = JSON.parse(userInfo);
        delete info.birth;
        this.$store.commit("user/SET_SELF_INFO", {
          ...this.storeSelfInfo,
          ...info,
        });
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnSelfInfoUpdated, selfInfoUpdateHandler);

      // message
      const newMessagesHandler = ({ messages }) => {
        const messageList = JSON.parse(messages);
        messageList.forEach(this.handleNewMessage);
      };
      const c2cReadReceiptHandler = ({ msgReceiptList }) => {
        const receiptList = JSON.parse(msgReceiptList);
        if (receiptList[0].userID !== this.storeCurrentConversation.userID) {
          return;
        }

        receiptList.forEach((item) => {
          item.msgIDList.forEach((msgID) => {
            this.updateOneMessage({
              message: {
                clientMsgID: msgID,
              },
              type: UpdateMessageTypes.KeyWords,
              keyWords: {
                key: "isRead",
                value: true,
              },
            });
          });
        });
      };
      const groupReadReceiptHandler = ({ groupMsgReceiptList }) => {
        const receiptList = JSON.parse(groupMsgReceiptList);
        console.log(receiptList);
        if (receiptList[0].groupID !== this.storeCurrentConversation.groupID) {
          return;
        }

        receiptList.forEach((item) => {
          item.msgIDList.forEach((msgID) => {
            const inlineMessage = this.storeHistoryMessageList.find(
              (message) => message.clientMsgID === msgID
            );
            if (inlineMessage) {
              inlineMessage.attachedInfoElem.groupHasReadInfo.hasReadUserIDList =
                [
                  ...(inlineMessage.attachedInfoElem.groupHasReadInfo
                    .hasReadUserIDList ?? []),
                  item.userID,
                ];
              inlineMessage.attachedInfoElem.groupHasReadInfo.hasReadCount += 1;
              this.updateOneMessage({
                message: {
                  ...inlineMessage,
                },
              });
            }
          });
        });
      };
      const newRecvMessageRevokedHandler = ({ msgRevoked }) => {
        const revokedMessage = JSON.parse(msgRevoked);
        if (!this.storeCurrentConversation.conversationID) {
          return;
        }

        this.updateOneMessage({
          message: {
            clientMsgID: revokedMessage.clientMsgID,
          },
          type: UpdateMessageTypes.KeyWords,
          keyWords: [
            {
              key: "contentType",
              value: MessageType.ADVANCEREVOKEMESSAGE,
            },
            {
              key: "content",
              value: JSON.stringify(revokedMessage),
            },
          ],
        });
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnRecvNewMessages, newMessagesHandler);
      IMSDK.subscribe(
        IMSDK.IMEvents.OnRecvC2CReadReceipt,
        c2cReadReceiptHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnRecvGroupReadReceipt,
        groupReadReceiptHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnNewRecvMessageRevoked,
        newRecvMessageRevokedHandler
      );

      // friend
      const friendInfoChangeHandler = ({ friendInfo }) => {
        const updatedInfo = JSON.parse(friendInfo);
        console.log(updatedInfo);
        this.updateFriendInfo({
          friendInfo: updatedInfo,
        });
      };
      const friendAddedHandler = ({ friendInfo }) => {
        const updatedInfo = JSON.parse(friendInfo);
        this.pushNewFriend(updatedInfo);
      };
      const friendDeletedHander = ({ friendInfo }) => {
        const updatedInfo = JSON.parse(friendInfo);
        this.updateFriendInfo({
          friendInfo: updatedInfo,
          isRemove: true,
        });
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendInfoChanged,
        friendInfoChangeHandler
      );
      IMSDK.subscribe(IMSDK.IMEvents.OnFriendAdded, friendAddedHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnFriendDeleted, friendDeletedHander);

      // blacklist
      const blackAddedHandler = ({ blackInfo }) => {
        const updatedInfo = JSON.parse(blackInfo);
        this.pushNewBlack(updatedInfo);
      };
      const blackDeletedHandler = ({ blackInfo }) => {
        const updatedInfo = JSON.parse(blackInfo);
        this.updateBlackInfo({
          blackInfo: updatedInfo,
          isRemove: true,
        });
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnBlackAdded, blackAddedHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnBlackDeleted, blackDeletedHandler);

      // group
      const joinedGroupAddedHandler = ({ groupInfo }) => {
        const updatedInfo = JSON.parse(groupInfo);
        this.pushNewGroup(updatedInfo);
      };
      const joinedGroupDeletedHandler = ({ groupInfo }) => {
        const updatedInfo = JSON.parse(groupInfo);
        this.updateGroupInfo({
          groupInfo: updatedInfo,
          isRemove: true,
        });
      };
      const groupInfoChangedHandler = ({ groupInfo }) => {
        const updatedInfo = JSON.parse(groupInfo);
        this.updateGroupInfo({
          groupInfo: updatedInfo,
        });
      };
      const groupMemberInfoChangedHandler = ({ groupMemberInfo }) => {
        const updatedInfo = JSON.parse(groupMemberInfo);
        this.updateCurrentMemberInGroup(updatedInfo);
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnJoinedGroupAdded,
        joinedGroupAddedHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnJoinedGroupDeleted,
        joinedGroupDeletedHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupInfoChanged,
        groupInfoChangedHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupMemberInfoChanged,
        groupMemberInfoChangedHandler
      );

      // application
      const friendApplicationNumHandler = ({ friendApplication }) => {
        const updatedApplication = JSON.parse(friendApplication);
        const isRecv = updatedApplication.toUserID === this.storeCurrentUserID;
        if (isRecv) {
          this.pushNewRecvFriendApplition(updatedApplication);
        } else {
          this.pushNewSentFriendApplition(updatedApplication);
        }
      };
      const friendApplicationAccessHandler = ({ friendApplication }) => {
        const updatedApplication = JSON.parse(friendApplication);
        const isRecv = updatedApplication.toUserID === this.storeCurrentUserID;
        if (isRecv) {
          this.updateRecvFriendApplition({
            application: updatedApplication,
          });
        } else {
          this.updateSentFriendApplition({
            application: updatedApplication,
          });
        }
      };
      const groupApplicationNumHandler = ({ groupApplication }) => {
        const updatedApplication = JSON.parse(groupApplication);
        const isRecv = updatedApplication.userID !== this.storeCurrentUserID;
        if (isRecv) {
          this.pushNewRecvGroupApplition(updatedApplication);
        } else {
          this.pushNewSentGroupApplition(updatedApplication);
        }
      };
      const groupApplicationAccessHandler = ({ groupApplication }) => {
        const updatedApplication = JSON.parse(groupApplication);
        const isRecv = updatedApplication.userID !== this.storeCurrentUserID;
        if (isRecv) {
          this.updateRecvGroupApplition({
            application: updatedApplication,
          });
        } else {
          this.updateSentGroupApplition({
            application: updatedApplication,
          });
        }
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendApplicationAdded,
        friendApplicationNumHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendApplicationAccepted,
        friendApplicationAccessHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendApplicationRejected,
        friendApplicationAccessHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationAdded,
        groupApplicationNumHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationAccepted,
        groupApplicationAccessHandler
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationRejected,
        groupApplicationAccessHandler
      );

      // conversation
      const totalUnreadCountChangedHandler = ({ totalUnreadCount }) => {
        this.$store.commit("conversation/SET_UNREAD_COUNT", totalUnreadCount);
      };
      const newConversationHandler = ({ conversationList }) => {
        const news = JSON.parse(conversationList);
        const result = [...news, ...this.storeConversationList];
        this.$store.commit(
          "conversation/SET_CONVERSATION_LIST",
          conversationSort(result)
        );
      };
      const conversationChangedHandler = ({ conversationList }) => {
        let filterArr = [];
        const changes = JSON.parse(conversationList);
        console.log(changes);
        const chids = changes.map((ch) => ch.conversationID);
        filterArr = this.storeConversationList.filter(
          (tc) => !chids.includes(tc.conversationID)
        );
        const idx = changes.findIndex(
          (c) =>
            c.conversationID === this.storeCurrentConversation.conversationID
        );
        if (idx !== -1)
          this.$store.commit(
            "conversation/SET_CURRENT_CONVERSATION",
            changes[idx]
          );
        const result = [...changes, ...filterArr];
        this.$store.commit(
          "conversation/SET_CONVERSATION_LIST",
          conversationSort(result)
        );
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnTotalUnreadMessageCountChanged,
        totalUnreadCountChangedHandler
      );
      IMSDK.subscribe(IMSDK.IMEvents.OnNewConversation, newConversationHandler);
      IMSDK.subscribe(
        IMSDK.IMEvents.OnConversationChanged,
        conversationChangedHandler
      );
    },

    handleNewMessage(newServerMsg) {
      if (this.inCurrentConversation(newServerMsg)) {
        if (newServerMsg.contentType !== MessageType.TYPINGMESSAGE) {
          if (newServerMsg.contentType === MessageType.ADVANCEREVOKEMESSAGE) {
          } else {
            this.pushNewMessage(newServerMsg);
            setTimeout(() =>
              uni.$emit(PageEvents.ScrollToBottom, newServerMsg.clientMsgID)
            );
          }
        }
      }
    },
    inCurrentConversation(newServerMsg) {
      switch (newServerMsg.sessionType) {
        case SessionType.Single:
          return (
            newServerMsg.sendID === this.storeCurrentConversation.userID ||
            (newServerMsg.sendID === this.storeCurrentUserID &&
              newServerMsg.recvID === this.storeCurrentConversation.userID)
          );
        case SessionType.Group:
        case SessionType.WorkingGroup:
          return newServerMsg.groupID === this.storeCurrentConversation.groupID;
        case SessionType.Notification:
          return newServerMsg.sendID === this.storeCurrentConversation.userID;
        default:
          return false;
      }
    },
    markConversationAsRead() {
      IMSDK.compatibleAPI(
        IMSDK.IMMethods.MarkMessageAsReadByConID,
        IMSDK.uuidv4(),
        this.storeCurrentConversation.conversationID,
        []
      );
    },
  },
  watch: {
    contactBadgeRely: {
      handler(newValue) {
        const { recvFriendApplications, recvGroupApplications, userKey } =
          newValue;
        if (!userKey) return;

		const unHandleFriendApplicationNum = recvFriendApplications.filter(application=>application.handleResult === 0).length
		const unHandleGroupApplicationNum = recvGroupApplications.filter(application=>application.handleResult === 0).length
		
        const total =
          unHandleFriendApplicationNum + unHandleGroupApplicationNum;
        if (total) {
          uni.setTabBarBadge({
            index: 1,
            text: total < 99 ? total + "" : "99+",
          });
        } else {
          uni.removeTabBarBadge({
            index: 1,
          });
        }
        this.$store.commit(
          "contact/SET_UNHANDLE_FRIEND_APPLICATION_NUM",
          unHandleFriendApplicationNum
        );
        this.$store.commit(
          "contact/SET_UNHANDLE_GROUP_APPLICATION_NUM",
          unHandleGroupApplicationNum
        );
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uview-ui/index.scss";
@import "@/styles/login.scss";
@import "@/styles/global.scss";

uni-page-body {
  height: 100vh;
  overflow: hidden;
}
</style>
