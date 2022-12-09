import store from '@/store'
import {
	CustomType,
	MessageType,
	GroupSessionTypes,
	AddFriendQrCodePrefix,
	AddGroupQrCodePrefix,
	SessionType,
	GroupAtType
} from '@/constant'
import {
	getOnlineStateFromSvr
} from "@/api/imApi";
import IMSDK from '@/util/compatibleIM'
import dayjs from 'dayjs'

import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/zh-cn";
import emojis from '../common/emojis';

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
		sameDay: "[今天] HH:mm", // The same day ( Today at 2:30 AM )
		nextDay: "[明天] HH:mm", // The next day ( Tomorrow at 2:30 AM )
		nextWeek: "dddd HH:mm", // The next week ( Sunday at 2:30 AM )
		lastDay: "[昨天] HH:mm", // The day before ( Yesterday at 2:30 AM )
		lastWeek: "YYYY-MM-DD", // Last week ( Last Monday at 2:30 AM )
		sameElse: "YYYY-MM-DD", // Everything else ( 17/10/2011 )
	},
});

const nomalTypes = [GroupAtType.AtAll, GroupAtType.AtAllAtMe, GroupAtType.AtMe];

export const conversationSort = (conversationList) => {
	const arr = [];
	const filterArr = conversationList.filter(
		(c) => !arr.includes(c.conversationID) && arr.push(c.conversationID)
	);
	filterArr.sort((a, b) => {
		if (a.isPinned === b.isPinned) {
			const aCompare =
				a.draftTextTime > a.latestMsgSendTime ?
				a.draftTextTime :
				a.latestMsgSendTime;
			const bCompare =
				b.draftTextTime > b.latestMsgSendTime ?
				b.draftTextTime :
				b.latestMsgSendTime;
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

export const parseAt = (atel) => {
	let mstr = atel.text;
	const pattern = /@\S+\s/g;
	const arr = mstr.match(pattern);
	const atUserList = atel.atUsersInfo ?? [];
	arr?.map((match) => {
		const member = atUserList.find(
			(user) => user.atUserID === match.slice(1, -1)
		);
		if (member) {
			mstr = mstr.replace(match, `@${member.groupNickname} `);
		}
	});
	return mstr;
};

export const parseEmoji = (msgStr) => {
	emojis.map(item => {
		if (msgStr.includes(item.context)) {
			let imgStr = `
			<img class="emoji_display" src="${item.src}"/>
			`
			imgStr = imgStr.replace('/static', 'static')
			msgStr = msgStr.replace(item.reg, imgStr)
		}
	})
	return msgStr
}

const switchCustomMsg = (cMsg) => {
	switch (cMsg.customType) {
		case CustomType.MassMsg:
			return "[通知]";
		case CustomType.Call:
			return "[音视频]";
		default:
			return "";
	}
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
		return user.userID === store.getters.storeCurrentUserID ?
			'你' :
			user.nickname;
	};
	switch (pmsg.contentType) {
		case MessageType.TEXTMESSAGE:
			return pmsg.content;
		case MessageType.ATTEXTMESSAGE:
			return parseAt(pmsg.atElem);
		case MessageType.PICTUREMESSAGE:
			return "[图片]"
		case MessageType.VIDEOMESSAGE:
			return "[视频]"
		case MessageType.VOICEMESSAGE:
			return "[语音]"
		case MessageType.LOCATIONMESSAGE:
			return "[位置]"
		case MessageType.CARDMESSAGE:
			return "[名片]"
		case MessageType.MERGERMESSAGE:
			return "[合并消息]"
		case MessageType.FILEMESSAGE:
			return `[文件]${pmsg.fileElem.fileName}`
		case MessageType.REVOKEMESSAGE:
			return `${isSelf(pmsg.sendID) ? "你" : pmsg.senderNickname}撤回了一条消息`
		case MessageType.ADVANCEREVOKEMESSAGE:
			const data = JSON.parse(pmsg.content);
			const revoker = isSelf(data.revokerID) ? "你" : data.revokerNickname;
			const sourcer = isSelf(data.sourceMessageSendID) ? "你" : data.sourceMessageSenderNickname;
			const isAdminRevoke = data.revokerID !== data.sourceMessageSendID;
			if (isAdminRevoke) {
				return `${revoker}撤回了一条${sourcer}的消息`
			}
			return `${revoker}撤回了一条消息`
		case MessageType.CUSTOMMESSAGE:
			const customEl = pmsg.customElem;
			const customData = JSON.parse(customEl.data);
			if (customData.customType) {
				return switchCustomMsg(customData);
			}
			return "[自定义消息]";
		case MessageType.QUOTEMESSAGE:
			return "[引用消息]"
		case MessageType.FACEMESSAGE:
			return "[表情]"
		case MessageType.FRIENDADDED:
			return "你们已经是好友了，开始聊天吧~"
		case MessageType.MEMBERENTER:
			const enterDetails = JSON.parse(pmsg.notificationElem.detail);
			const enterUser = enterDetails.entrantUser;
			return `${getName(enterUser)}进入了群聊`
		case MessageType.GROUPCREATED:
			const groupCreatedDetail = JSON.parse(pmsg.notificationElem.detail);
			const groupCreatedUser = groupCreatedDetail.opUser;
			return `${getName(groupCreatedUser)}创建了群聊`
		case MessageType.MEMBERINVITED:
			const inviteDetails = JSON.parse(pmsg.notificationElem.detail);
			const inviteOpUser = inviteDetails.opUser;
			const invitedUserList = inviteDetails.invitedUserList ?? [];
			let inviteStr = "";
			invitedUserList.find(
				(user, idx) =>
				(inviteStr += getName(user) + " ") && idx > 3
			);
			return `${getName(inviteOpUser)}邀请了${inviteStr}${invitedUserList.length > 3 ? "..." : ""}进入群聊`

		case MessageType.MEMBERKICKED:
			const kickDetails = JSON.parse(pmsg.notificationElem.detail);
			const kickOpUser = kickDetails.opUser;
			const kickdUserList = kickDetails.kickedUserList ?? [];
			let kickStr = "";
			kickdUserList.find(
				(user, idx) => (kickStr += getName(user) + " ") && idx > 3
			);
			return `${getName(kickOpUser)}踢出了${kickStr}${kickdUserList.length > 3 ? "..." : ""}`
		case MessageType.MEMBERQUIT:
			const quitDetails = JSON.parse(pmsg.notificationElem.detail);
			const quitUser = quitDetails.quitUser;
			return `${getName(quitUser)}退出了群聊`
		case MessageType.GROUPINFOUPDATED:
			const groupUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
			const groupUpdateUser = groupUpdateDetail.opUser;
			if (groupUpdateDetail.group.notification) {
				return `${getName(groupUpdateUser)}修改了群公告`
			}
			return `${getName(groupUpdateUser)}修改了群信息`
		case MessageType.GROUPOWNERTRANSFERRED:
			const transferDetails = JSON.parse(pmsg.notificationElem.detail);
			const transferOpUser = transferDetails.opUser;
			const newOwner = transferDetails.newGroupOwner;
			return `${getName(transferOpUser)}将群主转让给${getName(newOwner)}`
		case MessageType.GROUPDISMISSED:
			const dismissDetails = JSON.parse(pmsg.notificationElem.detail);
			const dismissUser = dismissDetails.opUser;
			return `${getName(dismissUser)}解散了群聊`
		case MessageType.GROUPMUTED:
			const GROUPMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
			const groupMuteOpUser = GROUPMUTEDDetails.opUser;
			return `${getName(groupMuteOpUser)}开启了全体禁言`
		case MessageType.GROUPCANCELMUTED:
			const GROUPCANCELMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
			const groupCancelMuteOpUser = GROUPCANCELMUTEDDetails.opUser;
			return `${getName(groupCancelMuteOpUser)}取消了全体禁言`
		case MessageType.GROUPMEMBERMUTED:
			const gmMutedDetails = JSON.parse(pmsg.notificationElem.detail);
			const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
			return `${getName(gmMutedDetails.opUser)}禁言了${getName(gmMutedDetails.mutedUser)} ${muteTime}`
		case MessageType.GROUPMEMBERCANCELMUTED:
			const gmcMutedDetails = JSON.parse(pmsg.notificationElem.detail);
			return `${getName(gmcMutedDetails.opUser)}取消了禁言${getName(gmcMutedDetails.mutedUser)}`
		case MessageType.NOTIFICATION:
			const customNoti = JSON.parse(pmsg.notificationElem.detail);
			return customNoti.text;
		case MessageType.BURNMESSAGECHANGE:
			const burnDetails = JSON.parse(pmsg.notificationElem.detail);
			return `阅后即焚已${burnDetails.isPrivate ? '开启' : '关闭'}`
		default:
			return pmsg.notificationElem.defaultTips;
	}
};


export const formatConversionTime = (timestemp) => {
	const fromNowStr = dayjs(timestemp).fromNow();

	if (fromNowStr.includes('秒')) {
		return "刚刚";
	}

	if (
		!fromNowStr.includes('秒') &&
		!fromNowStr.includes('分钟')
	) {
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
	if (msg.contentType === MessageType.ADVANCEREVOKEMESSAGE) {
		let revoker, sourcer, isAdminRevoke;
		const data = JSON.parse(msg.content);
		revoker = currentUserID === data.revokerID ? '你' : data.revokerNickname;
		isAdminRevoke = data.revokerID !== data.sourceMessageSendID;
		sourcer = data.sourceMessageSendID === currentUserID ? '你' : data.sourceMessageSenderNickname;

		if (isAdminRevoke) {
			return `${revoker}撤回了一条${sourcer}的消息`;
		}
		return `${revoker}撤回了一条消息`;
	}

	if (msg.contentType === MessageType.REVOKEMESSAGE) {
		const revoker = msg.sendID === currentUserID ? '你' : msg.senderNickname;
		return `${revoker}撤回了一条消息`;
	}

	const getName = (user) => {
		return user.userID === currentUserID ? "你" : user.nickname;
	};

	switch (msg.contentType) {
		case MessageType.FRIENDADDED:
			return `你们已经是好友了~`;
		case MessageType.GROUPCREATED:
			const groupCreatedDetail = JSON.parse(msg.notificationElem.detail);
			const groupCreatedUser = groupCreatedDetail.opUser;
			return `${getName(groupCreatedUser)}创建了群聊`;
		case MessageType.GROUPINFOUPDATED:
			const groupUpdateDetail = JSON.parse(msg.notificationElem.detail);
			const groupUpdateUser = groupUpdateDetail.opUser;
			if (groupUpdateDetail.group.notification) {
				return `${getName(groupUpdateUser)}修改了群公告`;
			}
			return `${getName(groupUpdateUser)}修改了群信息`;
		case MessageType.GROUPOWNERTRANSFERRED:
			const transferDetails = JSON.parse(msg.notificationElem.detail);
			const transferOpUser = transferDetails.opUser;
			const newOwner = transferDetails.newGroupOwner;
			return `${getName(transferOpUser)}转让群主给${getName(newOwner)}`;
		case MessageType.MEMBERQUIT:
			const quitDetails = JSON.parse(msg.notificationElem.detail);
			const quitUser = quitDetails.quitUser;
			return `${getName(quitUser)}退出了群组`;
		case MessageType.MEMBERINVITED:
			const inviteDetails = JSON.parse(msg.notificationElem.detail);
			const inviteOpUser = inviteDetails.opUser;
			const invitedUserList = inviteDetails.invitedUserList ?? [];
			let inviteStr = '';
			invitedUserList.find(
				(user, idx) => (inviteStr += getName(user) + ' ') && idx > 3,
			);
			return `${getName(inviteOpUser)}邀请了${inviteStr}${
        invitedUserList.length > 3 ? '...' : ''
      }加入群聊`;
		case MessageType.MEMBERKICKED:
			const kickDetails = JSON.parse(msg.notificationElem.detail);
			const kickOpUser = kickDetails.opUser;
			const kickdUserList = kickDetails.kickedUserList ?? [];
			let kickStr = '';
			kickdUserList.find((user, idx) => (kickStr += getName(user) + ' ') && idx > 3);
			return `${getName(kickOpUser)}踢出了${kickStr}${kickdUserList.length > 3 ? '...' : ''}`;
		case MessageType.MEMBERENTER:
			const enterDetails = JSON.parse(msg.notificationElem.detail);
			const enterUser = enterDetails.entrantUser;
			return `${getName(enterUser)}加入了群聊`;
		case MessageType.GROUPDISMISSED:
			const dismissDetails = JSON.parse(msg.notificationElem.detail);
			const dismissUser = dismissDetails.opUser;
			return `${getName(dismissUser)}解散了群聊`;
		case MessageType.GROUPMUTED:
			const groupMutedDetails = JSON.parse(msg.notificationElem.detail);
			const groupMuteOpUser = groupMutedDetails.opUser;
			return `${getName(groupMuteOpUser)}开启了全体禁言`;
		case MessageType.GROUPCANCELMUTED:
			const groupCancelMutedDetails = JSON.parse(msg.notificationElem.detail);
			const groupCancelMuteOpUser = groupCancelMutedDetails.opUser;
			return `${getName(groupCancelMuteOpUser)}关闭了全体禁言`;
		case MessageType.GROUPMEMBERMUTED:
			const gmMutedDetails = JSON.parse(msg.notificationElem.detail);
			const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
			return `${getName(gmMutedDetails.opUser)}禁言了${getName(gmMutedDetails.mutedUser)} ${muteTime}`;
		case MessageType.GROUPMEMBERCANCELMUTED:
			const gmcMutedDetails = JSON.parse(msg.notificationElem.detail);
			return `${getName(gmcMutedDetails.opUser)}取消了禁言${getName(gmcMutedDetails.mutedUser)}`;
		case MessageType.BURNMESSAGECHANGE:
			const burnDetails = JSON.parse(msg.notificationElem.detail);
			return `阅后即焚已${burnDetails.isPrivate ? '开启' : '关闭'}`;
		case MessageType.NOTIFICATION:
			const customNoti = JSON.parse(msg.notificationElem.detail);
			return customNoti.text;
		default:
			return msg.notificationElem.defaultTips;
	}
}

export const getDesignatedUserOnlineState = (userID) => {
	return new Promise(async (resolve, reject) => {
		let statusObj = {}
		try {
			const data = await getOnlineStateFromSvr(userID);
			statusObj = data[0];
		} catch (e) {
			reject(e)
		}
		const onlineStr = switchOnline(
			statusObj.status,
			statusObj.detailPlatformStatus
		);
		resolve(onlineStr)
	})

}

function switchOnline(oType, details) {
	switch (oType) {
		case "offline":
			return '离线';
		case "online":
			let str = "";
			details?.map((detail) => {
				if (detail.status === "online") {
					str += `${detail.platform}/`;
				}
			});
			return `${str.slice(0, -1)} 在线`;
		default:
			return "";
	}
}

export const markConversationAsRead = (conversation, fromChating = false) => {
	if (conversation.unreadCount !== 0) {
		IMSDK.compatibleAPI(IMSDK.IMMethods.MarkMessageAsReadByConID, IMSDK.uuidv4(), conversation.conversationID,
			[]);
	}
	const isNomalAtType = nomalTypes.includes(conversation.groupAtType)
	if ((isNomalAtType && !fromChating) || (fromChating && conversation.groupAtType === GroupAtType
			.AtGroupNotice)) {
		IMSDK.compatibleAPI(IMSDK.IMMethods.ResetConversationGroupAtType, IMSDK.uuidv4(), conversation
			.conversationID);
	}
}

export const prepareConversationState = (conversation, back2Tab = false) => {
	markConversationAsRead(conversation);

	if (GroupSessionTypes.includes(conversation.conversationType)) {
		store.dispatch('conversation/getCurrentGroup', conversation.groupID)
		store.dispatch('conversation/getCurrentMemberInGroup', conversation.groupID)
	}

	store.commit('conversation/SET_CURRENT_CONVERSATION', conversation)

	let url = `/pages/conversation/chating/index?back2Tab=${back2Tab}`
	if (conversation.conversationType === SessionType.Notification) {
		url = '/pages/conversation/notifyMessageList/index'
	}
	uni.navigateTo({
		url
	})
}

export const navigateToDesignatedConversation = (sourceID, sessionType, back2Tab = false) => {
	return new Promise(async (resolve, reject) => {
		try {
			const {
				data
			} = await IMSDK.compatibleAPI(IMSDK.IMMethods.GetOneConversation, IMSDK.uuidv4(),
				sessionType, sourceID)
			prepareConversationState(data, back2Tab)
			resolve()
		} catch (e) {
			reject(e)
		}

	})
}

export const scanQrCodeResult = (result) => {
	if (result.includes(AddFriendQrCodePrefix)) {
		const userID = result.replace(AddFriendQrCodePrefix, '')
		uni.navigateTo({
			url: `/pages/common/userCard/index?sourceID=${userID}&isScan=true`
		})
	} else if (result.includes(AddGroupQrCodePrefix)) {
		const groupID = result.replace(AddGroupQrCodePrefix, '')
		uni.navigateTo({
			url: `/pages/common/groupCard/index?sourceID=${groupID}&isScan=true`
		})
	} else {
		uni.$u.toast('未识别到有效内容')
	}
}
