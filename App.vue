<script>
import { mapGetters, mapActions } from "vuex";
import IMSDK, {
  IMMethods,
  MessageReceiveOptType,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import config from "./common/config";
import { getDbDir, Igexin, toastWithCallback } from "@/util/common.js";
import { conversationSort, parseMessageByType, prepareConversationState } from "@/util/imCommon";
import { PageEvents, UpdateMessageTypes } from "@/constant";
import { checkUpdateFormPgyer } from "@/api/checkUpdate";
import NotificationUtil from "./util/notification";
import newMessage from "@/static/audio/newMessage.wav";

let cacheConversationList = [];
let updateDownloadTask = null;
let notificationIntance = null;
let pausing = false;
let innerAudioContext;
let notification

export default {
  onLaunch: function () {
    console.log("App Launch");
    // #ifdef APP-PLUS
    // Igexin.turnOnPush();
    // #endif
    innerAudioContext = uni.createInnerAudioContext();
    innerAudioContext.autoplay = false;
    innerAudioContext.src = newMessage;
    notification = uni.requireNativePlugin('Tuoyun-OpenIMSDK-Notification');
    this.launchCheck();
    this.setGlobalIMlistener();
    this.setPageListener();
    this.tryLogin();
    // this.checkVersion();
    // #ifdef H5 
    console.error(`暂时不支持运行到 Web，如果需要移动端的 Web 项目，参考 [H5 demo](https://github.com/openimsdk/openim-h5-demo)`);
    // #endif
    // MP-WEIXIN
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
      "storeGroupList"
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
    ...mapActions("message", [
      "pushNewMessage",
      "updateOneMessage",
      "updateQuoteMessageRevoke",
      "updateMessageNicknameAndFaceUrl",
    ]),
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
          // #ifdef APP-PLUS
          // Igexin.unbindAlias(this.storeCurrentUserID)
          // #endif
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
      }
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
        this.updateMessageNicknameAndFaceUrl({
          sendID: data.userID,
          senderNickname: data.nickname,
          senderFaceUrl: data.faceURL,
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
      const c2cReadReceiptHandler = ({ data: receiptList }) => {
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
      const groupReadReceiptHandler = ({ data: receiptList }) => {
        if (receiptList[0].groupID !== this.storeCurrentConversation.groupID) {
          return;
        }

        receiptList.forEach((item) => {
          item.msgIDList.forEach((msgID) => {
            const inlineMessage = this.storeHistoryMessageList.find(
              (message) => message.clientMsgID === msgID,
            );
            if (inlineMessage) {
              inlineMessage.attachedInfoElem.groupHasReadInfo.hasReadUserIDList =
                [
                  ...(inlineMessage.attachedInfoElem.groupHasReadInfo
                    .hasReadUserIDList ?? []),
                  item.userID,
                ];
              // Members who join later in the workgroup will also send read receipts. Need filter.
              if (
                inlineMessage.attachedInfoElem.groupHasReadInfo
                  .groupMemberCount -
                  inlineMessage.attachedInfoElem.groupHasReadInfo.hasReadCount >
                1
              ) {
                inlineMessage.attachedInfoElem.groupHasReadInfo.hasReadCount += 1;
              }

              console.log({
                ...inlineMessage,
              });
              this.updateOneMessage({
                message: {
                  ...inlineMessage,
                },
              });
            }
          });
        });
      };
      const newRecvMessageRevokedHandler = ({ data: revokedMessage }) => {
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
              value: MessageType.RevokeMessage,
            },
            {
              key: "notificationElem",
              value: {
                detail: JSON.stringify(revokedMessage),
              },
            },
          ],
        });
        this.updateQuoteMessageRevoke({
          clientMsgID: revokedMessage.clientMsgID
        })
      };
      const inputStatusChanged = ({ data }) => {
        if (data.userID === this.storeCurrentConversation.userID && data.conversationID === this.storeCurrentConversation.conversationID) {
          if (data.platformIDs.length > 0) {
            uni.$emit(PageEvents.TypingUpdate);
          }
        }
      }

      IMSDK.subscribe(IMSDK.IMEvents.OnRecvNewMessages, newMessagesHandler);
      IMSDK.subscribe('onInputStatusChanged', inputStatusChanged);
      IMSDK.subscribe(
        IMSDK.IMEvents.OnRecvC2CReadReceipt,
        c2cReadReceiptHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnRecvGroupReadReceipt,
        groupReadReceiptHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnNewRecvMessageRevoked,
        newRecvMessageRevokedHandler,
      );

      // friend
      const friendInfoChangeHandler = ({ data }) => {
        uni.$emit(IMSDK.IMEvents.OnFriendInfoChanged, { data })
        if (data.userID === this.storeCurrentConversation?.userID) {
          this.updateMessageNicknameAndFaceUrl({
            sendID: data.userID,
            senderNickname: data.nickname,
            senderFaceUrl: data.faceURL,
          });
          this.$store.commit(
            "conversation/SET_CURRENT_CONVERSATION",
            {...this.storeCurrentConversation, showName: data.nickname},
          );
        }
        console.log(this.storeConversationList)
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
        friendInfoChangeHandler,
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
        uni.$emit(IMSDK.IMEvents.OnGroupMemberInfoChanged, { data })
        if (data.groupID === this.storeCurrentConversation?.groupID) {
          this.updateMessageNicknameAndFaceUrl({
            sendID: data.userID,
            senderNickname: data.nickname,
            senderFaceUrl: data.faceURL,
          });
          this.updateCurrentMemberInGroup(data);
        }
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnJoinedGroupAdded,
        joinedGroupAddedHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnJoinedGroupDeleted,
        joinedGroupDeletedHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupInfoChanged,
        groupInfoChangedHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupMemberInfoChanged,
        groupMemberInfoChangedHandler,
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
        friendApplicationNumHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendApplicationAccepted,
        friendApplicationAccessHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnFriendApplicationRejected,
        friendApplicationAccessHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationAdded,
        groupApplicationNumHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationAccepted,
        groupApplicationAccessHandler,
      );
      IMSDK.subscribe(
        IMSDK.IMEvents.OnGroupApplicationRejected,
        groupApplicationAccessHandler,
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
          conversationSort(result),
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
          (tc) => !chids.includes(tc.conversationID),
        );
        const idx = data.findIndex(
          (c) =>
            c.conversationID === this.storeCurrentConversation.conversationID,
        );
        if (idx !== -1)
          this.$store.commit(
            "conversation/SET_CURRENT_CONVERSATION",
            data[idx],
          );
        const result = [...data, ...filterArr];
        this.$store.commit(
          "conversation/SET_CONVERSATION_LIST",
          conversationSort(result),
        );
      };

      IMSDK.subscribe(
        IMSDK.IMEvents.OnTotalUnreadMessageCountChanged,
        totalUnreadCountChangedHandler,
      );
      IMSDK.subscribe(IMSDK.IMEvents.OnNewConversation, newConversationHandler);
      IMSDK.subscribe(
        IMSDK.IMEvents.OnConversationChanged,
        conversationChangedHandler,
      );
    },

    setPageListener() {
      uni.$on(PageEvents.CheckForUpdate, this.checkVersion);
    },
    tryLogin() {
      const initStore = () => {
        this.$store.dispatch("user/getSelfInfo");
        this.$store.dispatch("conversation/getConversationList");
        this.$store.dispatch("conversation/getUnReadCount");
        // this.$store.dispatch("contact/getFriendList");
        // this.$store.dispatch("contact/getGrouplist");
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
            systemType: 'uni-app',
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
            IMSDK.uuid(),
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

    launchCheck() {
      plus.globalEvent.addEventListener("newintent", (e) => {
        console.log(plus.runtime.arguments);
        let launchData = {};
        try {
          launchData = JSON.parse(plus.runtime.arguments);
        } catch (e) {}
        switch (launchData.type) {
          case "updateDownloadFinish":
            break;
          case "updateProgress":
            if (pausing) return;

            if (updateDownloadTask?.state === 5) {
              updateDownloadTask?.resume();
            } else {
              updateDownloadTask?.pause();
              this.updateNotification("暂停中");
              pausing = true;
            }
            break;
          default:
            break;
        }
      });
    },
    checkVersion(initiative = false) {
      if (uni.$u.os() === "ios") {
        return;
      }
      plus.runtime.getProperty(plus.runtime.appid, ({ version }) => {
        checkUpdateFormPgyer(version)
          .then(
            async ({
              buildHaveNewVersion,
              needForceUpdate,
              downloadURL,
              buildUpdateDescription,
              buildVersion,
            }) => {
              if (buildHaveNewVersion) {
                const hasDownloadedPath =
                  await this.checkDownloadedPkg(buildVersion);
                uni.showModal({
                  title: "检测到新版本",
                  content: hasDownloadedPath
                    ? "新版本已下载完毕，是否立即更新？"
                    : buildUpdateDescription || "",
                  showCancel: !needForceUpdate,
                  confirmText: hasDownloadedPath ? "立即更新" : "立即升级",
                  cancelText: "下次再说",
                  success: (res) => {
                    if (res.confirm) {
                      if (hasDownloadedPath) {
                        plus.runtime.install(hasDownloadedPath);
                      } else {
                        this.downloadApk(downloadURL, buildVersion);
                      }
                    } else {
                      if (needForceUpdate) {
                        plus.runtime.quit();
                      }
                    }
                  },
                });
              }

              if (initiative && !buildHaveNewVersion) {
                uni.$u.toast("当前已是最新版本！");
              }
            },
          )
          .catch((err) => {
            console.log(err);
            if (initiative) {
              uni.$u.toast("获取版本信息失败！");
            }
          })
          .finally(
            () => initiative && uni.$emit(PageEvents.CheckForUpdateResp),
          );
      });
    },
    async checkDownloadedPkg(buildVersion) {
      const versionMap = uni.getStorageSync("IMVersionMap") || {};
      const filePath = versionMap[buildVersion];
      const [err] = await uni.getSavedFileInfo({
        filePath,
      });
      return err ? "" : filePath;
    },
    downloadApk(downloadURL, buildVersion) {
      notificationIntance = new NotificationUtil();
      updateDownloadTask = plus.downloader.createDownload(downloadURL);

      updateDownloadTask.addEventListener("statechanged", (task, status) => {
        if (task.state === 3) {
          uni.$u.throttle(() => this.updateNotification("正在下载..."), 1000);
        }

        if (task.state === 5) {
          this.updateNotification("已暂停", true);
          pausing = false;
        }

        if (task.state === 4) {
          if (status === 200) {
            this.updateNotification("正在下载...");
            setTimeout(() => this.downloadFinish(buildVersion), 200);
          }
        }
      });
      updateDownloadTask.start();
    },
    updateNotification(content, isPause = false) {
      const progress = parseInt(
        (updateDownloadTask.downloadedSize / updateDownloadTask.totalSize) *
          100,
      );
      const config = {
        progress,
        isPause,
        title: "OpenIM",
        content: `${content}${progress}%`,
        intentList: [["type", "updateProgress"]],
      };
      notificationIntance.createProgress(config);
    },
    downloadFinish(buildVersion) {
      notificationIntance.clearNotification(1000);
      notificationIntance.compProgressNotification({
        title: "OpenIM",
        content: "下载完成",
        notifyId: 1001,
      });
      uni.showModal({
        title: "准备更新",
        content: "安装包已下载完毕，是否立即更新？",
        showCancel: false,
        confirmText: "立即更新",
        success: (res) => {
          const pkgPath = plus.io.convertLocalFileSystemURL(
            updateDownloadTask.filename,
          );
          if (res.confirm) {
            plus.runtime.install(pkgPath);
          } else {
            const versionMap = uni.getStorageSync("IMVersionMap") || {};
            versionMap[buildVersion] = pkgPath;
            uni.setStorage({
              key: "IMVersionMap",
              data: versionMap,
            });
          }
        },
      });
    },

    async newMessageNotify(newServerMsg) {
      if (this.storeIsSyncing) {
        return;
      }

      const disableNotify = uni.getStorageSync(
        `${this.storeCurrentUserID}_DisableNotify`,
      );
      if (
        disableNotify ||
        this.storeSelfInfo.globalRecvMsgOpt !== MessageReceiveOptType.Nomal
      ) {
        return;
      }

      let cveItem = [
        ...this.storeConversationList,
        ...cacheConversationList,
      ].find((conversation) => {
        if (newServerMsg.sessionType === SessionType.WorkingGroup) {
          return newServerMsg.groupID === conversation.groupID;
        }
        return newServerMsg.sendID === conversation.userID;
      });

      if (!cveItem) {
        try {
          const { data } = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetOneConversation,
            IMSDK.uuid(),
            {
              sourceID: newServerMsg.groupID || newServerMsg.sendID,
              sessionType: newServerMsg.sessionType,
            },
          );
          cveItem = data;
          cacheConversationList = [...cacheConversationList, data];
        } catch (e) {
          return;
        }
      }

      if (cveItem.recvMsgOpt !== MessageReceiveOptType.Nomal) {
        return;
      }

      // uni.createPushMessage({
      // 	content: `${newServerMsg.senderNickname}: ${parseMessageByType(newServerMsg)}`,
      // 	payload: {
      // 		sessionType: newServerMsg.sessionType,
      // 		sourceID: newServerMsg.groupID || newServerMsg.sendID,
      // 	}
      // })
      const notificationFun = () => {
        const isSelf = newServerMsg.sendID === this.$store.getters.storeCurrentUserID;
        if (isSelf) return;

        const isSingle = newServerMsg.groupID ? false : true;

        console.log(this.storeGroupList, newServerMsg)

        const group = this.storeGroupList.filter(
          (group) => group.groupID === newServerMsg.groupID
        );

        const title = isSingle ? newServerMsg.senderNickname : group[0].groupName;
        const desc = parseMessageByType(newServerMsg)

        console.log('notification', title, desc)
        notification.showNotice(0, title, desc, () => {
			    prepareConversationState(cveItem)
		    })
      }
      notificationFun()


      const platform = uni.getSystemInfoSync().platform;
      if (platform == "ios") {
        if (this.storeSelfInfo.allowVibration === 1) {
          plus.device.vibrate();
        }

        if (this.storeSelfInfo.allowBeep === 1) {
          innerAudioContext.play();
          // plus.device.beep();
        }
      } else if (platform == "android") {
        if (this.storeSelfInfo.allowVibration === 1) {
          plus.device.vibrate(500);
        }
        if (this.storeSelfInfo.allowBeep === 1) {
          let main = plus.android.runtimeMainActivity();
          let RingtoneManager = plus.android.importClass(
            "android.media.RingtoneManager",
          );
          let uri = RingtoneManager.getActualDefaultRingtoneUri(
            main,
            RingtoneManager.TYPE_NOTIFICATION,
          );
          let MediaPlayer = plus.android.importClass(
            "android.media.MediaPlayer",
          );
          let player = MediaPlayer.create(main, uri);
          player.setLooping(false);
          player.prepare();
          player.start();
        }
      }
    },
    handleNewMessage(newServerMsg) {
      if (this.inCurrentConversation(newServerMsg)) {
        const isSingleMessage = newServerMsg.sessionType === SessionType.Single;

        if (isSingleMessage) {
          uni.$u.throttle(() => uni.$emit(PageEvents.OnlineStateCheck), 2000);
        }

        if (newServerMsg.contentType === MessageType.TypingMessage) {
          if (isSingleMessage) {
            uni.$emit(PageEvents.TypingUpdate);
          }
        } else {
          if (newServerMsg.contentType === MessageType.RevokeMessage) {
          } else {
            newServerMsg.isAppend = true;
            this.pushNewMessage(newServerMsg);
            setTimeout(() => uni.$emit(PageEvents.ScrollToBottom, true));
          }
          uni.$u.debounce(this.markConversationAsRead, 2000);
        }
      } else {
        if (newServerMsg.contentType !== MessageType.TypingMessage) {
          uni.$u.throttle(() => this.newMessageNotify(newServerMsg), 1000);
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
        this.storeCurrentConversation.conversationID,
      );
    },
  },
  watch: {
    storeCurrentUserID(newVal) {
      if (newVal) {
        cacheConversationList = [];
      }
    },
    contactBadgeRely: {
      handler(newValue) {
        const { recvFriendApplications, recvGroupApplications, userKey } =
          newValue;
        if (!userKey) return;
        const accessedFriendApplications =
          uni.getStorageSync(`${userKey}_accessedFriendApplications`) || [];
        let unHandleFriendApplicationNum = recvFriendApplications.filter(
          (application) =>
            application.handleResult === 0 &&
            !accessedFriendApplications.includes(
              `${application.fromUserID}_${application.createTime}`,
            ),
        ).length;
        const accessedGroupApplications =
          uni.getStorageSync(`${userKey}_accessedGroupApplications`) || [];
        let unHandleGroupApplicationNum = recvGroupApplications.filter(
          (application) =>
            application.handleResult === 0 &&
            !accessedGroupApplications.includes(
              `${application.userID}_${application.createTime}`,
            ),
        ).length;
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
          unHandleFriendApplicationNum,
        );
        this.$store.commit(
          "contact/SET_UNHANDLE_GROUP_APPLICATION_NUM",
          unHandleGroupApplicationNum,
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

.uni-tabbar .uni-tabbar__icon {
  width: 28px !important;
  height: 28px !important;
}
</style>
