import IMSDK from '@/util/compatibleIM'
import {
	v4 as uuidv4
} from 'uuid';
import {
	MessageStatus,
	MessageType,
	UpdateMessageTypes
} from "@/constant"

const state = {
	historyMessageList: [],
	hasMoreMessage: true,
	quoteMessage: undefined,
}

const mutations = {
	SET_HISTORY_MESSAGE_LIST(state, list) {
		state.historyMessageList = [...list]
	},
	SET_HAS_MORE_MESSAGE(state, hasMore) {
		state.hasMoreMessage = hasMore
	},
	SET_QUOTE_MESSAGE(state, message) {
		state.quoteMessage = message
	}
}

const actions = {
	async getHistoryMesageList({
		commit,
		state
	}, params) {
		let emptyFlag = true
		let lastMinSeq = 0
		try {
			console.log('getHistoryMesageList:::');
			console.log(params);
			const {
				data
			} = await IMSDK.compatibleAPI(IMSDK.IMMethods.GetAdvancedHistoryMessageList, uuidv4(), params)
			const isFistPage = !params.startClientMsgID && !params.lastMinSeq;
			const messages = data.messageList ?? []
			emptyFlag = messages.length === 0
			lastMinSeq = data.lastMinSeq
			commit('SET_HISTORY_MESSAGE_LIST', [...messages, ...(isFistPage ? [] : state
				.historyMessageList)]);
			commit('SET_HAS_MORE_MESSAGE', !data.isEnd && messages.length === 20)
		} catch (e) {
			commit('SET_HISTORY_MESSAGE_LIST', [])
		}
		return {
			emptyFlag,
			lastMinSeq
		}
	},
	pushNewMessage({
		commit,
		state
	}, message) {
		commit('SET_HISTORY_MESSAGE_LIST', [...state.historyMessageList, message])
	},
	updateOneMessage({
		commit,
		state
	}, {
		message,
		type = UpdateMessageTypes.Overall,
		keyWords = [],
		isSuccess = false
	}) {
		const tmpList = state.historyMessageList
		const idx = tmpList.findIndex(
			(msg) => msg.clientMsgID === message.clientMsgID
		);
		if (idx !== -1) {
			if (type === UpdateMessageTypes.Overall) {
				tmpList[idx] = {
					...message
				};
			} else if (type === UpdateMessageTypes.KeyWords) {
				const updateFields = Array.isArray(keyWords) ? keyWords : [keyWords];
				updateFields.forEach(field => tmpList[idx][field.key] = field.value);
			}
			commit('SET_HISTORY_MESSAGE_LIST', tmpList)
		}
	},
	deleteMessages({
		commit,
		state
	}, messages) {
		const tmpList = [...state.historyMessageList]
		messages.map(message => {
			const idx = tmpList.findIndex(
				(msg) => msg.clientMsgID === message.clientMsgID
			);
			if (idx !== -1) {
				tmpList.splice(idx, 1);;
			}
		})
		commit('SET_HISTORY_MESSAGE_LIST', tmpList)
	},
	resetMessageState({
		commit
	}) {
		commit('SET_HISTORY_MESSAGE_LIST', [])
		commit('SET_HAS_MORE_MESSAGE', true)
		commit('SET_QUOTE_MESSAGE', undefined)
	}
}


export default {
	namespaced: true,
	state,
	mutations,
	actions,
};
