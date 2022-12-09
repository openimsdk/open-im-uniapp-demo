import {
	v4 as uuidv4
} from "uuid";
import IMSDK from '@/util/compatibleIM'

const state = {
	conversationList: [],
	currentConversation: {},
	unReadCount: 0,
	currentGroup: {},
	currentMemberInGroup: {},
};

const mutations = {
	SET_CONVERSATION_LIST(state, list) {
		state.conversationList = [...list];
	},
	SET_CURRENT_CONVERSATION(state, conversation) {
		state.currentConversation = {
			...conversation
		};
	},
	SET_UNREAD_COUNT(state, count) {
		if (count) {
			uni.setTabBarBadge({
				index: 0,
				text: (count < 99 ? count + '' : '99+')
			})
		} else {
			uni.removeTabBarBadge({
				index: 0
			})
		}
		state.unReadCount = count;
	},
	SET_CURRENT_GROUP(state, group) {
		state.currentGroup = {
			...group
		};
	},
	SET_CURRENT_MEMBER_IN_GROUP(state, member) {
		state.currentMemberInGroup = {
			...member
		};
	},
};

const actions = {
	async getConversationList({
		commit
	}) {
		try {
			const {
				data
			} = await IMSDK.compatibleAPI(IMSDK.IMMethods.GetAllConversationList, uuidv4())
			commit('SET_CONVERSATION_LIST', data)
		} catch (e) {
			commit('SET_CONVERSATION_LIST', [])
		}
	},
	delConversationByCID({
		state,
		commit
	}, conversationID) {
		const tmpList = [...state.conversationList];
		const idx = tmpList.findIndex(
			(conversation) => conversation.conversationID === conversationID
		);
		if (idx > -1) {
			tmpList.splice(idx, 1);
			commit("SET_CONVERSATION_LIST", tmpList);
		}
	},
	getCurrentGroup({
		commit
	}, groupID) {
		IMSDK
			.compatibleAPI(IMSDK.IMMethods.GetGroupsInfo, uuidv4(), [groupID])
			.then(({
				data
			}) => {
				commit('SET_CURRENT_GROUP', data[0] ?? {})
			});
	},
	getCurrentMemberInGroup({
		commit,
		rootState
	}, groupID) {
		IMSDK
			.compatibleAPI(IMSDK.IMMethods.GetGroupMembersInfo, uuidv4(), groupID, [rootState.user.selfInfo.userID])
			.then(({
				data
			}) => {
				commit('SET_CURRENT_MEMBER_IN_GROUP', data[0] ?? {})
			});
	},
	getUnReadCount({
		commit
	}, ) {
		IMSDK
			.compatibleAPI(IMSDK.IMMethods.GetTotalUnreadMsgCount, uuidv4())
			.then((res) => {
				console.log(res);
				commit("SET_UNREAD_COUNT", res.data)
			});
	},
	updateCurrentMemberInGroup({
		commit,
		state
	}, memberInfo) {
		if (memberInfo.groupID === state.currentMemberInGroup.groupID && memberInfo.userID === state
			.currentMemberInGroup.userID) {
			commit("SET_CURRENT_MEMBER_IN_GROUP", memberInfo)
		}
	},
	resetConversationState({
		commit
	}) {
		commit('SET_CURRENT_MEMBER_IN_GROUP', {})
		commit('SET_CURRENT_GROUP', {})
		commit('SET_CURRENT_CONVERSATION', {})
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
};
