export const SessionType = {
	Single: 1,
	Group: 2,
	WorkingGroup: 3,
	Notification: 4
}

export const GroupJoinSource = {
	Invitation: 2,
	Search: 3,
	QrCode: 4,
}

export const GroupType = {
	NomalGroup: 0,
	SuperGroup: 1,
	WorkingGroup: 2,
}

export const MessageStatus = {
	Sending: 1,
	Succeed: 2,
	Failed: 3
}

export const GroupVerificationTypes = {
	ApplyNeedInviteNot: 0,
	AllNeed: 1,
	AllNot: 2,
}

export const GroupStatus = {
	Nomal: 0,
	Baned: 1,
	Dismissed: 2,
	Muted: 3,
}

export const GroupAllowTypes = {
	Allowed: 0,
	NotAllowed: 1,
}

export const GroupMemberRole = {
	Nomal: 1,
	Owner: 2,
	Admin: 3,
}

export const OptType = {
	Nomal: 0,
	Mute: 1,
	WithoutNotify: 2
}

export const GroupAtType = {
	AtNormal: 0,
	AtMe: 1,
	AtAll: 2,
	AtAllAtMe: 3,
	AtGroupNotice: 4
}

export const CustomType = {
	VideoCall: "c100",
	VoiceCall: "c101",
	Call: 901,
	MassMsg: 903,
}

export const MessageType = {
	TEXTMESSAGE: 101,
	PICTUREMESSAGE: 102,
	VOICEMESSAGE: 103,
	VIDEOMESSAGE: 104,
	FILEMESSAGE: 105,
	ATTEXTMESSAGE: 106,
	MERGERMESSAGE: 107,
	CARDMESSAGE: 108,
	LOCATIONMESSAGE: 109,
	CUSTOMMESSAGE: 110,
	REVOKEMESSAGE: 111,
	HASREADRECEIPTMESSAGE: 112,
	TYPINGMESSAGE: 113,
	QUOTEMESSAGE: 114,
	FACEMESSAGE: 115,
	ADVANCETEXTMESSAGE: 117,
	ADVANCEREVOKEMESSAGE: 118,
	CUSTOMMSGNOTTRIGGERCONVERSATION: 119,
	CUSTOMMSGONLINEONLY: 120,
	FRIENDAPPLICATIONAPPROVED: 1201,
	FRIENDAPPLICATIONREJECTED: 1202,
	FRIENDAPPLICATIONADDED: 1203,
	FRIENDADDED: 1204,
	FRIENDDELETED: 1205,
	FRIENDREMARKSET: 1206,
	BLACKADDED: 1207,
	BLACKDELETED: 1208,
	SELFINFOUPDATED: 1303,
	NOTIFICATION: 1400,
	GROUPCREATED: 1501,
	GROUPINFOUPDATED: 1502,
	JOINGROUPAPPLICATIONADDED: 1503,
	MEMBERQUIT: 1504,
	GROUPAPPLICATIONACCEPTED: 1505,
	GROUPAPPLICATIONREJECTED: 1506,
	GROUPOWNERTRANSFERRED: 1507,
	MEMBERKICKED: 1508,
	MEMBERINVITED: 1509,
	MEMBERENTER: 1510,
	GROUPDISMISSED: 1511,
	GROUPMEMBERMUTED: 1512,
	GROUPMEMBERCANCELMUTED: 1513,
	GROUPMUTED: 1514,
	GROUPCANCELMUTED: 1515,
	GROUPMEMBERINFOUPDATED: 1516,
	BURNMESSAGECHANGE: 1701
}

export const noticeMessageTypes = [
	MessageType.REVOKEMESSAGE,
	MessageType.ADVANCEREVOKEMESSAGE,
	MessageType.FRIENDAPPLICATIONAPPROVED,
	MessageType.FRIENDAPPLICATIONREJECTED,
	MessageType.FRIENDAPPLICATIONADDED,
	MessageType.FRIENDADDED,
	MessageType.FRIENDDELETED,
	MessageType.FRIENDREMARKSET,
	MessageType.BLACKADDED,
	MessageType.BLACKDELETED,
	MessageType.SELFINFOUPDATED,
	MessageType.GROUPCREATED,
	MessageType.GROUPINFOUPDATED,
	MessageType.JOINGROUPAPPLICATIONADDED,
	MessageType.MEMBERQUIT,
	MessageType.GROUPAPPLICATIONACCEPTED,
	MessageType.GROUPAPPLICATIONREJECTED,
	MessageType.GROUPOWNERTRANSFERRED,
	MessageType.MEMBERKICKED,
	MessageType.MEMBERINVITED,
	MessageType.MEMBERENTER,
	MessageType.GROUPDISMISSED,
	MessageType.GROUPMEMBERMUTED,
	MessageType.GROUPMEMBERCANCELMUTED,
	MessageType.GROUPMUTED,
	MessageType.GROUPCANCELMUTED,
	MessageType.BURNMESSAGECHANGE,
	MessageType.GROUPMEMBERINFOUPDATED
];


export const GroupSessionTypes = [
	SessionType.Group,
	SessionType.WorkingGroup
]
