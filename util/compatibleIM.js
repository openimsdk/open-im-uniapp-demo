const IMApi = uni.requireNativePlugin("Tuoyun-OpenIMSDK");
const globalEvent = uni.requireNativePlugin("globalEvent");
import {
	v4 as uuidv4
} from 'uuid';

const compatibleAPI = (key, ...args) => {
	return new Promise((resolve, reject) => {
		console.info(
			`SDK => [OperationID:${
		          args[0]
		        }] (invoked by app) run ${key} with args ${JSON.stringify(args)}`
		);
		if (key === IMMethods.Logout) {
			uni.removeStorage({
				key: 'IMToken'
			})
			uni.removeStorage({
				key: 'BusinessToken'
			})
		}
		IMApi[key](...args, (res) => {
			if (res.errCode === 0) {
				try {
					res.data = JSON.parse(res.data)
				} catch (e) {

				}
				resolve(res)
			} else {
				reject(res)
			}
		})
	})
}

const subscribe = (evnetName, handler) => {
	console.log('subscribe:::', evnetName);
	globalEvent.addEventListener(evnetName, handler)
}

const unsubscribe = (evnetName, handler) => {
	console.log('unsubscribe:::', evnetName);
	globalEvent.removeEventListener(evnetName, handler)
}

const IMMethods = {
	InitSDK: "initSDK",
	Login: "login",
	Logout: "logout",
	GetLoginStatus: "getLoginStatus",
	GetLoginUser: "getLoginUser",
	InviteUserToGroup: "inviteUserToGroup",
	KickGroupMember: "kickGroupMember",
	GetGroupMembersInfo: "getGroupMembersInfo",
	GetGroupMemberList: "getGroupMemberList",
	GetGroupMemberListByJoinTimeFilter: "getGroupMemberListByJoinTimeFilter",
	GetJoinedGroupList: "getJoinedGroupList",
	CreateGroup: "createGroup",
	SetGroupInfo: "setGroupInfo",
	GetGroupsInfo: "getGroupsInfo",
	JoinGroup: "joinGroup",
	QuitGroup: "quitGroup",
	TransferGroupOwner: "transferGroupOwner",
	SetGroupLookMemberInfo: "setGroupLookMemberInfo",
	SetGroupApplyMemberFriend: "setGroupApplyMemberFriend",
	GetRecvGroupApplicationList: "getRecvGroupApplicationList",
	GetSendGroupApplicationList: "getSendGroupApplicationList",
	AcceptGroupApplication: "acceptGroupApplication",
	RefuseGroupApplication: "refuseGroupApplication",
	DismissGroup: "dismissGroup",
	ChangeGroupMute: "changeGroupMute",
	ChangeGroupMemberMute: "changeGroupMemberMute",
	SetGroupMemberNickname: "setGroupMemberNickname",
	SearchGroups: "searchGroups",
	SetGroupMemberRoleLevel: "setGroupMemberRoleLevel",
	SetGroupVerification: "setGroupVerification",
	AddFriend: "addFriend",
	GetRecvFriendApplicationList: "getRecvFriendApplicationList",
	GetSendFriendApplicationList: "getSendFriendApplicationList",
	AcceptFriendApplication: "acceptFriendApplication",
	RefuseFriendApplication: "refuseFriendApplication",
	GetFriendList: "getFriendList",
	GetDesignatedFriendsInfo: "getDesignatedFriendsInfo",
	SetFriendRemark: "setFriendRemark",
	CheckFriend: "checkFriend",
	GetBlackList: "getBlackList",
	AddBlack: "addBlack",
	RemoveBlack: "removeBlack",
	DeleteFriend: "deleteFriend",
	AearchFriends: "searchFriends",
	GetUsersInfo: "getUsersInfo",
	GetSelfUserInfo: "getSelfUserInfo",
	SetSelfInfo: "setSelfInfo",
	UploadFile: "uploadFile",
	GetHistoryMessageList: "getHistoryMessageList",
	GetAdvancedHistoryMessageList: "getAdvancedHistoryMessageList",
	RevokeMessage: "revokeMessage",
	NewRevokeMessage: "newRevokeMessage",
	DeleteMessageFromLocalAndSvr: "deleteMessageFromLocalAndSvr",
	DeleteMessageFromLocalStorage: "deleteMessageFromLocalStorage",
	InsertSingleMessageToLocalStorage: "insertSingleMessageToLocalStorage",
	InsertGroupMessageToLocalStorage: "insertGroupMessageToLocalStorage",
	MarkC2CMessageAsRead: "markC2CMessageAsRead",
	MarkGroupMessageAsRead: "markGroupMessageAsRead",
	MarkMessageAsReadByConID: "markMessageAsReadByConID",
	TypingStatusUpdate: "typingStatusUpdate",
	CreateTextMessage: "createTextMessage",
	CreateTextAtMessage: "createTextAtMessage",
	CreateImageMessageByURL: "createImageMessageByURL",
	CreateImageMessageFromFullPath: "createImageMessageFromFullPath",
	CreateSoundMessageByURL: "createSoundMessageByURL",
	CreateSoundMessageFromFullPath: "createSoundMessageFromFullPath",
	CreateVideoMessageByURL: "createVideoMessageByURL",
	CreateVideoMessageFromFullPath: "createVideoMessageFromFullPath",
	CreateFileMessageByURL: "createFileMessageByURL",
	CreateFileMessageFromFullPath: "createFileMessageFromFullPath",
	CreateMergerMessage: "createMergerMessage",
	CreateForwardMessage: "createForwardMessage",
	CreateLocationMessage: "createLocationMessage",
	CreateCustomMessage: "createCustomMessage",
	CreateQuoteMessage: "createQuoteMessage",
	CreateCardMessage: "createCardMessage",
	CreateFaceMessage: "createFaceMessage",
	SendMessage: "sendMessage",
	SendMessageNotOss: "sendMessageNotOss",
	ClearC2CHistoryMessage: "clearC2CHistoryMessage",
	ClearC2CHistoryMessageFromLocalAndSvr: "clearC2CHistoryMessageFromLocalAndSvr",
	ClearGroupHistoryMessage: "clearGroupHistoryMessage",
	ClearGroupHistoryMessageFromLocalAndSvr: "clearGroupHistoryMessageFromLocalAndSvr",
	SearchLocalMessages: "searchLocalMessages",
	DeleteAllMsgFromLocal: "deleteAllMsgFromLocal",
	DeleteAllMsgFromLocalAndSvr: "deleteAllMsgFromLocalAndSvr",
	GetHistoryMessageListReverse: "getHistoryMessageListReverse",
	GetAllConversationList: "getAllConversationList",
	GetConversationListSplit: "getConversationListSplit",
	GetOneConversation: "getOneConversation",
	GetMultipleConversation: "getMultipleConversation",
	DeleteConversation: "deleteConversation",
	SetConversationDraft: "setConversationDraft",
	PinConversation: "pinConversation",
	MarkGroupMessageHasRead: "markGroupMessageHasRead",
	MarkNotifyMessageHasRead: "markNotifyMessageHasRead",
	GetTotalUnreadMsgCount: "getTotalUnreadMsgCount",
	SetConversationRecvMessageOpt: "setConversationRecvMessageOpt",
	GetConversationRecvMessageOpt: "getConversationRecvMessageOpt",
	SetOneConversationPrivateChat: "setOneConversationPrivateChat",
	DeleteConversation: "deleteConversation",
	DeleteConversationFromLocalAndSvr: "deleteConversationFromLocalAndSvr",
	DeleteAllConversationFromLocal: "deleteAllConversationFromLocal",
	ResetConversationGroupAtType: "resetConversationGroupAtType",
	SetGlobalRecvMessageOpt: "setGlobalRecvMessageOpt",
	SignalingInvite: "signalingInvite",
	SignalingInviteInGroup: "signalingInviteInGroup",
	SignalingAccept: "signalingAccept",
	SignalingReject: "signalingReject",
	SignalingCancel: "signalingCancel",
	SignalingHungUp: "signalingHungUp",
	SearchGroupMembers: "searchGroupMembers",
};

const IMEvents = {
	OnConnectFailed: 'onConnectFailed',
	OnConnectSuccess: 'onConnectSuccess',
	OnConnecting: 'onConnecting',
	OnKickedOffline: 'onKickedOffline',
	OnSelfInfoUpdated: 'onSelfInfoUpdated',
	OnUserTokenExpired: 'onUserTokenExpired',
	SendMessageFailed: 'sendMessageFailed',
	SendMessageProgress: 'sendMessageProgress',
	SendMessageSuccess: 'sendMessageSuccess',
	UploadFileFailed: 'uploadFileFailed',
	UploadFileProgress: 'uploadFileProgress',
	UploadFileSuccess: 'uploadFileSuccess',
	OnRecvNewMessage: 'onRecvNewMessage',
	OnRecvNewMessages: 'onRecvNewMessages',
	OnRecvMessageRevoked: 'onRecvMessageRevoked',
	OnRecvC2CReadReceipt: 'onRecvC2CReadReceipt',
	OnRecvGroupReadReceipt: 'onRecvGroupReadReceipt',
	OnConversationChanged: 'onConversationChanged',
	OnNewConversation: 'onNewConversation',
	OnSyncServerFailed: 'onSyncServerFailed',
	OnSyncServerFinish: 'onSyncServerFinish',
	OnSyncServerStart: 'onSyncServerStart',
	OnTotalUnreadMessageCountChanged: 'onTotalUnreadMessageCountChanged',
	OnBlackAdded: 'onBlackAdded',
	OnBlackDeleted: 'onBlackDeleted',
	OnFriendApplicationAccepted: 'onFriendApplicationAccepted',
	OnFriendApplicationAdded: 'onFriendApplicationAdded',
	OnFriendApplicationDeleted: 'onFriendApplicationDeleted',
	OnFriendApplicationRejected: 'onFriendApplicationRejected',
	OnFriendInfoChanged: 'onFriendInfoChanged',
	OnFriendAdded: 'onFriendAdded',
	OnFriendDeleted: 'onFriendDeleted',
	OnJoinedGroupAdded: 'onJoinedGroupAdded',
	OnJoinedGroupDeleted: 'onJoinedGroupDeleted',
	OnGroupMemberAdded: 'onGroupMemberAdded',
	OnGroupMemberDeleted: 'onGroupMemberDeleted',
	OnGroupApplicationAdded: 'onGroupApplicationAdded',
	OnGroupApplicationDeleted: 'onGroupApplicationDeleted',
	OnGroupInfoChanged: 'onGroupInfoChanged',
	OnGroupMemberInfoChanged: 'onGroupMemberInfoChanged',
	OnGroupApplicationAccepted: 'onGroupApplicationAccepted',
	OnGroupApplicationRejected: 'onGroupApplicationRejected',
	OnReceiveNewInvitation: 'onReceiveNewInvitation',
	OnInviteeAccepted: 'onInviteeAccepted',
	OnInviteeRejected: 'onInviteeRejected',
	OnInvitationCancelled: 'onInvitationCancelled',
	OnHangUp: 'onHangUp',
	OnInvitationTimeout: 'onInvitationTimeout',
	OnInviteeAcceptedByOtherDevice: 'onInviteeAcceptedByOtherDevice',
	OnInviteeRejectedByOtherDevice: 'onInviteeRejectedByOtherDevice',
	OnNewRecvMessageRevoked: 'onNewRecvMessageRevoked',
}

const offlinePushInfo = {
	title: "you have a new message",
	desc: "",
	ex: "",
	iOSPushSound: "",
	iOSBadgeCount: true
}

export default {
	IMApi,
	compatibleAPI,
	subscribe,
	unsubscribe,
	uuidv4,
	IMMethods,
	IMEvents,
	offlinePushInfo
}
