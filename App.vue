<script>
import { mapGetters, mapActions } from "vuex";
import IMSDK, {
  IMMethods,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import config from "./common/config";
import { getDbDir, toastWithCallback } from "@/util/common.js";
import { conversationSort } from "@/util/imCommon";
import { PageEvents, UpdateMessageTypes } from "@/constant";

export default {
  onLaunch: function () {
    console.log("App Launch");
    this.setGlobalIMlistener();
    this.tryLogin();
    // #ifdef H5
    console.error(
      `暂时不支持运行到 Web，如果需要移动端的 Web 项目，参考 [H5 demo](https://github.com/openimsdk/openim-h5-demo)`
    );
    // #endif
    // #ifdef MP-WEIXIN
    console.error(`暂时不支持运行到小程序端`);
    // #endif
  },
  onShow: function () {
    console.log("App Show");
    IMSDK.asyncApi(IMSDK.IMMethods.SetAppBackgroundStatus, IMSDK.uuid(), false);
  },
  onHide: function () {
    console.log("App Hide");
    IMSDK.asyncApi(IMSDK.IMMethods.SetAppBackgroundStatus, IMSDK.uuid(), true);
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
      "storeIsSyncing",
      "storeGroupList",
    ]),
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
      console.log("setGlobalIMlistener");
      // init
      const kickHander = (message) => {
        toastWithCallback(message, () => {
          uni.removeStorage({
            key: "IMToken",
          });
          uni.removeStorage({
            key: "BusinessToken",
          });
          uni.$u.route("/pages/login/index");
        });
      };
      IMSDK.subscribe(IMSDK.IMEvents.OnKickedOffline, (data) => {
        kickHander("您的账号在其他设备登录，请重新登陆！");
      });
      IMSDK.subscribe(IMSDK.IMEvents.OnUserTokenExpired, (data) => {
        kickHander("您的登录已过期，请重新登陆！");
      });
      IMSDK.subscribe(IMSDK.IMEvents.OnUserTokenInvalid, (data) => {
        kickHander("您的登录已无效，请重新登陆！");
      });

      // sync
      const syncStartHandler = ({ data }) => {
        this.$store.commit("user/SET_IS_SYNCING", true);
        this.$store.commit("user/SET_REINSTALL", data);
      };
      const syncProgressHandler = ({ data }) => {
        this.$store.commit("user/SET_PROGRESS", data);
      };
      const syncFinishHandler = () => {
        uni.hideLoading();
        this.$store.dispatch("conversation/getConversationList");
        this.$store.dispatch("contact/getFriendList");
        this.$store.dispatch("contact/getGrouplist");
        this.$store.dispatch("conversation/getUnReadCount");
        this.$store.commit("user/SET_IS_SYNCING", false);
      };
      const syncFailedHandler = () => {
        uni.hideLoading();
        uni.$u.toast("同步消息失败");
        this.$store.dispatch("conversation/getConversationList");
        this.$store.dispatch("conversation/getUnReadCount");
        this.$store.commit("user/SET_IS_SYNCING", false);
      };
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerStart, syncStartHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFinish, syncFinishHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFailed, syncFailedHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerProgress, syncProgressHandler);

      // self
      const selfInfoUpdateHandler = ({ data }) => {
        this.$store.commit("user/SET_SELF_INFO", {
          ...this.storeSelfInfo,
          ...data,
        });
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnSelfInfoUpdated, selfInfoUpdateHandler);

      // message
      const newMessagesHandler = ({ data }) => {
        if (this.storeIsSyncing) {
          return;
        }
        data.forEach(this.handleNewMessage);
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnRecvNewMessages, newMessagesHandler);

      // friend
      const friendInfoChangeHandler = ({ data }) => {
        uni.$emit(IMSDK.IMEvents.OnFriendInfoChanged, { data });
        this.updateFriendInfo({
          friendInfo: data,
        });
      };
      const friendAddedHandler = ({ data }) => {
        this.pushNewFriend(data);
      };
      const friendDeletedHander = ({ data }) => {
        this.updateFriendInfo({
          friendInfo: data,
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
      const blackAddedHandler = ({ data }) => {
        this.pushNewBlack(data);
      };
      const blackDeletedHandler = ({ data }) => {
        this.updateBlackInfo({
          blackInfo: data,
          isRemove: true,
        });
      };

      IMSDK.subscribe(IMSDK.IMEvents.OnBlackAdded, blackAddedHandler);
      IMSDK.subscribe(IMSDK.IMEvents.OnBlackDeleted, blackDeletedHandler);

      // group
      const joinedGroupAddedHandler = ({ data }) => {
        this.pushNewGroup(data);
      };
      const joinedGroupDeletedHandler = ({ data }) => {
        this.updateGroupInfo({
          groupInfo: data,
          isRemove: true,
        });
      };
      const groupInfoChangedHandler = ({ data }) => {
        this.updateGroupInfo({
          groupInfo: data,
        });
      };
      const groupMemberInfoChangedHandler = ({ data }) => {
        uni.$emit(IMSDK.IMEvents.OnGroupMemberInfoChanged, { data });
        if (data.groupID === this.storeCurrentConversation?.groupID) {
          this.updateCurrentMemberInGroup(data);
        }
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
      const friendApplicationNumHandler = ({ data }) => {
        const isRecv = data.toUserID === this.storeCurrentUserID;
        if (isRecv) {
          this.pushNewRecvFriendApplition(data);
        } else {
          this.pushNewSentFriendApplition(data);
        }
      };
      const friendApplicationAccessHandler = ({ data }) => {
        const isRecv = data.toUserID === this.storeCurrentUserID;
        if (isRecv) {
          this.updateRecvFriendApplition({
            application: data,
          });
        } else {
          this.updateSentFriendApplition({
            application: data,
          });
        }
      };
      const groupApplicationNumHandler = ({ data }) => {
        const isRecv = data.userID !== this.storeCurrentUserID;
        if (isRecv) {
          this.pushNewRecvGroupApplition(data);
        } else {
          this.pushNewSentGroupApplition(data);
        }
      };
      const groupApplicationAccessHandler = ({ data }) => {
        const isRecv = data.userID !== this.storeCurrentUserID;
        if (isRecv) {
          this.updateRecvGroupApplition({
            application: data,
          });
        } else {
          this.updateSentGroupApplition({
            application: data,
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
      const totalUnreadCountChangedHandler = ({ data }) => {
        if (this.storeIsSyncing) {
          return;
        }
        this.$store.commit("conversation/SET_UNREAD_COUNT", data);
      };
      const newConversationHandler = ({ data }) => {
        if (this.storeIsSyncing) {
          return;
        }
        const result = [...data, ...this.storeConversationList];
        this.$store.commit(
          "conversation/SET_CONVERSATION_LIST",
          conversationSort(result)
        );
      };
      const conversationChangedHandler = ({ data }) => {
        if (this.storeIsSyncing) {
          return;
        }
        let filterArr = [];
        console.log(data);
        const chids = data.map((ch) => ch.conversationID);
        filterArr = this.storeConversationList.filter(
          (tc) => !chids.includes(tc.conversationID)
        );
        const idx = data.findIndex(
          (c) =>
            c.conversationID === this.storeCurrentConversation.conversationID
        );
        if (idx !== -1)
          this.$store.commit(
            "conversation/SET_CURRENT_CONVERSATION",
            data[idx]
          );
        const result = [...data, ...filterArr];
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

    tryLogin() {
      const initStore = () => {
        this.$store.dispatch("user/getSelfInfo");
        this.$store.dispatch("conversation/getConversationList");
        this.$store.dispatch("conversation/getUnReadCount");
        this.$store.dispatch("contact/getBlacklist");
        this.$store.dispatch("contact/getRecvFriendApplications");
        this.$store.dispatch("contact/getSentFriendApplications");
        this.$store.dispatch("contact/getRecvGroupApplications");
        this.$store.dispatch("contact/getSentGroupApplications");
        uni.switchTab({
          url: "/pages/conversation/conversationList/index?isRedirect=true",
        });
      };
      getDbDir()
        .then(async (path) => {
          const flag = await IMSDK.asyncApi(IMMethods.InitSDK, IMSDK.uuid(), {
            systemType: "uni-app",
            apiAddr: config.getApiUrl(), // SDK的API接口地址。如：http://xxx:10002
            wsAddr: config.getWsUrl(), // SDK的websocket地址。如： ws://xxx:10001
            dataDir: path, // 数据存储路径
            logLevel: 6,
            logFilePath: path,
            isLogStandardOutput: true,
            isExternalExtensions: false,
          });
          if (!flag) {
            plus.navigator.closeSplashscreen();
            uni.$u.toast("初始化IMSDK失败！");
            return;
          }
          const status = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetLoginStatus,
            IMSDK.uuid()
          );
          if (status === 3) {
            initStore();
            return;
          }

          const IMToken = uni.getStorageSync("IMToken");
          const IMUserID = uni.getStorageSync("IMUserID");
          if (IMToken && IMUserID) {
            IMSDK.asyncApi(IMSDK.IMMethods.Login, IMSDK.uuid(), {
              userID: IMUserID,
              token: IMToken,
            })
              .then(initStore)
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
        .catch((err) => {
          console.log("get dir failed");
          console.log(err);
          plus.navigator.closeSplashscreen();
        });
    },
    handleNewMessage(newServerMsg) {
      if (this.inCurrentConversation(newServerMsg)) {
        if (
          newServerMsg.contentType !== MessageType.TypingMessage &&
          newServerMsg.contentType !== MessageType.RevokeMessage
        ) {
          newServerMsg.isAppend = true;
          this.pushNewMessage(newServerMsg);
          setTimeout(() => uni.$emit(PageEvents.ScrollToBottom, true));
          uni.$u.debounce(this.markConversationAsRead, 2000);
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
        case SessionType.WorkingGroup:
          return newServerMsg.groupID === this.storeCurrentConversation.groupID;
        case SessionType.Notification:
          return newServerMsg.sendID === this.storeCurrentConversation.userID;
        default:
          return false;
      }
    },
    markConversationAsRead() {
      IMSDK.asyncApi(
        IMSDK.IMMethods.MarkConversationMessageAsRead,
        IMSDK.uuid(),
        this.storeCurrentConversation.conversationID
      );
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

.uni-tabbar .uni-tabbar__icon {
  width: 28px !important;
  height: 28px !important;
}
</style>
