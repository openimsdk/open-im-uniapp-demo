import store from "@/store";
import {
  CustomType,
  AddFriendQrCodePrefix,
  AddGroupQrCodePrefix,
} from "@/constant";
import { subUserOnlineStatus } from "@/api/imApi";
import IMSDK, {
  GroupAtType,
  MessageType,
  SessionType,
} from "openim-uniapp-polyfill";
import dayjs from "dayjs";
import { isThisYear } from "date-fns";

import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/zh-cn";

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.locale("zh-cn");

dayjs.updateLocale("en", {
  calendar: {
    sameElse: "YYYY-MM-DD",
  },
});
dayjs.updateLocale("zh-cn", {
  calendar: {
    sameDay: "HH:mm:ss",
    nextDay: "[明天]",
    nextWeek: "dddd",
    lastDay: "[昨天] HH:mm",
    lastWeek: "dddd HH:mm",
    sameElse: "YYYY年M月D日 HH:mm",
  },
});

export const formatMessageTime = (timestemp, keepSameYear = false) => {
  if (!timestemp) return "";

  const isRecent = dayjs().diff(timestemp, "day") < 7;
  const keepYear = keepSameYear || !isThisYear(timestemp);

  if (!isRecent && !keepYear) {
    return dayjs(timestemp).format("M月D日 HH:mm");
  }

  return dayjs(timestemp).calendar();
};

export const formatHyperlink = (nickname, currentUserID) => {
  return `<a href="${currentUserID}" style="color:#0089FF; text-decoration:none;">${nickname}</a>`;
};

const regex = /\b(http[s]?:\/\/[^\s]+)\b/g;
export const parseLink = (content) =>
  content.replace(regex, (match) => formatHyperlink(match, match));

const nomalTypes = [GroupAtType.AtAll, GroupAtType.AtAllAtMe, GroupAtType.AtMe];

export const conversationSort = (conversationList) => {
  const arr = [];
  const filterArr = conversationList.filter(
    (c) => !arr.includes(c.conversationID) && arr.push(c.conversationID),
  );
  filterArr.sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      const aCompare =
        a.draftTextTime > a.latestMsgSendTime
          ? a.draftTextTime
          : a.latestMsgSendTime;
      const bCompare =
        b.draftTextTime > b.latestMsgSendTime
          ? b.draftTextTime
          : b.latestMsgSendTime;
      if (aCompare > bCompare) {
        return -1;
      } else if (aCompare < bCompare) {
        return 1;
      } else {
        return 0;
      }
    } else if (a.isPinned && !b.isPinned) {
      return -1;
    } else {
      return 1;
    }
  });
  return filterArr;
};

export const parseAt = (atel, isParse = false) => {
  let mstr = atel.text;
  const pattern = /@\S+\s/g;
  const arr = mstr.match(pattern);
  const atUserList = atel.atUsersInfo ?? [];
  arr?.map((match) => {
    const member = atUserList.find(
      (user) => user.atUserID === match.slice(1, -1),
    );
    if (member && !isParse) {
      mstr = mstr.replace(
        match,
        formatHyperlink(`@${member.groupNickname} `, member.atUserID),
      );
    } else {
      mstr = mstr.replace(match, `@${member.groupNickname} `);
    }
  });
  return mstr;
};


export const sec2Time = (seconds) => {
  var theTime1 = 0; // min
  var theTime2 = 0; // hour
  var theTime3 = 0; // day
  if (seconds > 60) {
    theTime1 = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
      if (theTime2 > 24) {
        theTime3 = parseInt(theTime2 / 24);
        theTime2 = parseInt(theTime2 % 24);
      }
    }
  }
  var result = "";
  if (seconds > 0) {
    result = "" + parseInt(seconds) + "秒";
  }
  if (theTime1 > 0) {
    result = "" + parseInt(theTime1) + "分钟" + result;
  }
  if (theTime2 > 0) {
    result = "" + parseInt(theTime2) + "小时" + result;
  }
  if (theTime3 > 0) {
    result = "" + parseInt(theTime3) + "天" + result;
  }
  return result;
};

export const parseMessageByType = (pmsg, isNotify = false) => {
  const isSelf = (id) => id === store.getters.storeCurrentUserID;
  const getName = (user) => {
    return user.userID === store.getters.storeCurrentUserID
      ? "你"
      : user.nickname;
  };
  switch (pmsg.contentType) {
    case MessageType.TextMessage:
      return `${pmsg.senderNickname}：${pmsg.textElem.content}`;
    case MessageType.AtTextMessage:
      return `${pmsg.senderNickname}：${parseAt(pmsg.atTextElem, true)}`;
    case MessageType.PictureMessage:
      return `${pmsg.senderNickname}：[图片]`;
    case MessageType.VideoMessage:
      return `${pmsg.senderNickname}：[视频]`;
      return `${pmsg.senderNickname}：[表情]`;
    case MessageType.FriendAdded:
      return "你们已经是好友了，开始聊天吧~";
    case MessageType.MemberEnter:
      const enterDetails = JSON.parse(pmsg.notificationElem.detail);
      const enterUser = enterDetails.entrantUser;
      return `${getName(enterUser)}进入了群聊`;
    case MessageType.GroupCreated:
      const groupCreatedDetail = JSON.parse(pmsg.notificationElem.detail);
      const groupCreatedUser = groupCreatedDetail.opUser;
      return `${getName(groupCreatedUser)}创建了群聊`;
    case MessageType.MemberInvited:
      const inviteDetails = JSON.parse(pmsg.notificationElem.detail);
      const inviteOpUser = inviteDetails.opUser;
      const invitedUserList = inviteDetails.invitedUserList ?? [];
      let inviteStr = "";
      invitedUserList.find(
        (user, idx) => (inviteStr += getName(user) + "、") && idx > 3,
      );
      inviteStr = inviteStr.slice(0, -1);
      return `${getName(inviteOpUser)}邀请了${inviteStr}${
        invitedUserList.length > 3 ? "..." : ""
      }进入群聊`;

    case MessageType.MemberKicked:
      const kickDetails = JSON.parse(pmsg.notificationElem.detail);
      const kickOpUser = kickDetails.opUser;
      const kickdUserList = kickDetails.kickedUserList ?? [];
      let kickStr = "";
      kickdUserList.find(
        (user, idx) => (kickStr += getName(user) + "、") && idx > 3,
      );
      kickStr = kickStr.slice(0, -1);
      return `${getName(kickOpUser)}踢出了${kickStr}${
        kickdUserList.length > 3 ? "..." : ""
      }`;
    case MessageType.MemberQuit:
      const quitDetails = JSON.parse(pmsg.notificationElem.detail);
      const quitUser = quitDetails.quitUser;
      return `${getName(quitUser)}退出了群聊`;
    case MessageType.GroupInfoUpdated:
      const groupUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
      const groupUpdateUser = groupUpdateDetail.opUser;
      let updateFiled = "群设置";
      if (groupUpdateDetail.group.groupName) {
        updateFiled = `群名称为 ${groupUpdateDetail.group.groupName}`;
      }
      if (groupUpdateDetail.group.faceURL) {
        updateFiled = "群头像";
      }
      if (groupUpdateDetail.group.introduction) {
        updateFiled = "群介绍";
      }
      return `${getName(groupUpdateUser)}修改了${updateFiled}`;
    case MessageType.GroupOwnerTransferred:
      const transferDetails = JSON.parse(pmsg.notificationElem.detail);
      const transferOpUser = transferDetails.opUser;
      const newOwner = transferDetails.newGroupOwner;
      return `${getName(transferOpUser)}将群主转让给${getName(newOwner)}`;
    case MessageType.GroupDismissed:
      const dismissDetails = JSON.parse(pmsg.notificationElem.detail);
      const dismissUser = dismissDetails.opUser;
      return `${getName(dismissUser)}解散了群聊`;
    case MessageType.GroupNameUpdated:
      const groupNameUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
      const groupNameUpdateUser = groupNameUpdateDetail.opUser;
      return `${getName(groupNameUpdateUser)}修改了群名称为${
        groupNameUpdateDetail.group.groupName
      }`;
    case MessageType.OANotification:
      const customNoti = JSON.parse(pmsg.notificationElem.detail);
      return customNoti.text;
    default:
      return "";
  }
};

export const formatConversionTime = (timestemp) => {
  const fromNowStr = dayjs(timestemp).fromNow();

  if (fromNowStr.includes("秒")) {
    return "刚刚";
  }

  if (!fromNowStr.includes("秒") && !fromNowStr.includes("分钟")) {
    return dayjs(timestemp).calendar();
  }

  return fromNowStr;
};

export const secFormat = (sec) => {
  let h;
  let s;
  h = Math.floor(sec / 60);
  s = sec % 60;
  h += "";
  s += "";
  h = h.length === 1 ? "0" + h : h;
  s = s.length === 1 ? "0" + s : s;
  return h + ":" + s;
};

export const bytesToSize = (bytes) => {
  if (bytes === 0) return "0 B";
  var k = 1024,
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toPrecision(3) + " " + sizes[i];
};

export const tipMessaggeFormat = (msg, currentUserID) => {
  const getName = (user) =>
    user.userID === currentUserID ? "你" : user.nickname;

  const getUserID = (user) => user.userID;

  const parseInfo = (user) => formatHyperlink(getName(user), getUserID(user));

  switch (msg.contentType) {
    case MessageType.FriendAdded:
      return `你们已经是好友了~`;
    case MessageType.GroupCreated:
      const groupCreatedDetail = JSON.parse(msg.notificationElem.detail);
      const groupCreatedUser = groupCreatedDetail.opUser;
      return `${parseInfo(groupCreatedUser)}创建了群聊`;
    case MessageType.GroupInfoUpdated:
      const groupUpdateDetail = JSON.parse(msg.notificationElem.detail);
      const groupUpdateUser = groupUpdateDetail.opUser;
      let updateFiled = "群设置";
      if (groupUpdateDetail.group.groupName) {
        updateFiled = `群名称为 ${groupUpdateDetail.group.groupName}`;
      }
      if (groupUpdateDetail.group.faceURL) {
        updateFiled = "群头像";
      }
      if (groupUpdateDetail.group.introduction) {
        updateFiled = "群介绍";
      }
      return `${parseInfo(groupUpdateUser)}修改了${updateFiled}`;
    case MessageType.GroupOwnerTransferred:
      const transferDetails = JSON.parse(msg.notificationElem.detail);
      const transferOpUser = transferDetails.opUser;
      const newOwner = transferDetails.newGroupOwner;
      return `${parseInfo(transferOpUser)}转让群主给${parseInfo(newOwner)}`;
    case MessageType.MemberQuit:
      const quitDetails = JSON.parse(msg.notificationElem.detail);
      const quitUser = quitDetails.quitUser;
      return `${parseInfo(quitUser)}退出了群组`;
    case MessageType.MemberInvited:
      const inviteDetails = JSON.parse(msg.notificationElem.detail);
      const inviteOpUser = inviteDetails.opUser;
      const invitedUserList = inviteDetails.invitedUserList ?? [];
      let inviteStr = "";
      invitedUserList.find(
        (user, idx) => (inviteStr += parseInfo(user) + "、") && idx > 3,
      );
      inviteStr = inviteStr.slice(0, -1);
      return `${parseInfo(inviteOpUser)} 邀请了${inviteStr}${
        invitedUserList.length > 3 ? "..." : ""
      }加入群聊`;
    case MessageType.MemberKicked:
      const kickDetails = JSON.parse(msg.notificationElem.detail);
      const kickOpUser = kickDetails.opUser;
      const kickdUserList = kickDetails.kickedUserList ?? [];
      let kickStr = "";
      kickdUserList.find(
        (user, idx) => (kickStr += parseInfo(user) + "、") && idx > 3,
      );
      kickStr = kickStr.slice(0, -1);
      return `${parseInfo(kickOpUser)} 踢出了${kickStr}${
        kickdUserList.length > 3 ? "..." : ""
      }`;
    case MessageType.MemberEnter:
      const enterDetails = JSON.parse(msg.notificationElem.detail);
      const enterUser = enterDetails.entrantUser;
      return `${parseInfo(enterUser)}加入了群聊`;
    case MessageType.GroupDismissed:
      const dismissDetails = JSON.parse(msg.notificationElem.detail);
      const dismissUser = dismissDetails.opUser;
      return `${parseInfo(dismissUser)}解散了群聊`;
    case MessageType.GroupNameUpdated:
      const groupNameUpdateDetail = JSON.parse(msg.notificationElem.detail);
      const groupNameUpdateUser = groupNameUpdateDetail.opUser;
      return `${parseInfo(groupNameUpdateUser)}修改了群名称为${
        groupNameUpdateDetail.group.groupName
      }`;
    case MessageType.OANotification:
      const customNoti = JSON.parse(msg.notificationElem.detail);
      return customNoti.text;
    default:
      return "";
  }
};

export const getDesignatedUserOnlineState = (userID, targetID) => {
  return new Promise(async (resolve, reject) => {
    let status = 0;
    try {
      const data = await subUserOnlineStatus(userID, targetID);
      status = data.statusList[0].status;
    } catch (e) {
      reject(e);
    }
    const onlineStr = status ? "在线" : "离线";
    resolve(onlineStr);
  });
};

export const markConversationAsRead = (conversation, fromChating = false) => {
  if (conversation.unreadCount !== 0) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.MarkConversationMessageAsRead,
      IMSDK.uuid(),
      conversation.conversationID,
    );
  }
  const isNomalAtType = nomalTypes.includes(conversation.groupAtType);
  if (
    (isNomalAtType && !fromChating) ||
    (fromChating && conversation.groupAtType === GroupAtType.AtGroupNotice)
  ) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.ResetConversationGroupAtType,
      IMSDK.uuid(),
      conversation.conversationID,
    );
  }
};

export const prepareConversationState = (conversation, back2Tab = false) => {
  markConversationAsRead(conversation);

  if (conversation.conversationType === SessionType.WorkingGroup) {
    store.dispatch("conversation/getCurrentGroup", conversation.groupID);
    store.dispatch(
      "conversation/getCurrentMemberInGroup",
      conversation.groupID,
    );
  }
  store.dispatch("message/resetMessageState");
  store.commit("conversation/SET_CURRENT_CONVERSATION", conversation);

  let url = `/pages/conversation/chating/index?back2Tab=${back2Tab}`;
  if (conversation.conversationType === SessionType.Notification) {
    url = "/pages/conversation/notifyMessageList/index";
  }
  uni.navigateTo({
    url,
  });
};

export const navigateToDesignatedConversation = (
  sourceID,
  sessionType,
  back2Tab = false,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await IMSDK.asyncApi(
        IMSDK.IMMethods.GetOneConversation,
        IMSDK.uuid(),
        {
          sessionType,
          sourceID,
        },
      );
      prepareConversationState(data, back2Tab);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

export const scanQrCodeResult = (result) => {
  if (result?.includes(AddFriendQrCodePrefix)) {
    const userID = result.replace(AddFriendQrCodePrefix, "");
    uni.navigateTo({
      url: `/pages/common/userCard/index?sourceID=${userID}&isScan=true`,
    });
  } else if (result?.includes(AddGroupQrCodePrefix)) {
    const groupID = result.replace(AddGroupQrCodePrefix, "");
    uni.navigateTo({
      url: `/pages/common/groupCard/index?sourceID=${groupID}&isScan=true`,
    });
  } else {
    uni.$u.toast("未识别到有效内容");
  }
};

export const offlinePushInfo = {
  title: "you have a new message",
  desc: "you have a new message",
  ex: "",
  iOSPushSound: "",
  iOSBadgeCount: true,
};
