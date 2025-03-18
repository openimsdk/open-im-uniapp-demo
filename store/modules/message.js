import IMSDK, { MessageStatus, MessageType } from "openim-uniapp-polyfill";
import { v4 as uuidv4 } from "uuid";
import { UpdateMessageTypes } from "@/constant";

const state = {
  historyMessageList: [],
  hasMoreMessage: true,
};

const mutations = {
  SET_HISTORY_MESSAGE_LIST(state, list) {
    state.historyMessageList = [...list];
  },
  SET_HAS_MORE_MESSAGE(state, hasMore) {
    state.hasMoreMessage = hasMore;
  },
};

const actions = {
  async getHistoryMesageList({ commit, state }, params) {
    let emptyFlag = true;
    try {
      console.log("getHistoryMesageList:::");
      console.log(params);
      const { data } = await IMSDK.asyncApi(
        IMSDK.IMMethods.GetAdvancedHistoryMessageList,
        uuidv4(),
        params,
      );
      console.log(data);
      const isFistPage = !params.startClientMsgID
      const messages = data.messageList ?? [];
      emptyFlag = messages.length === 0;
      commit("SET_HISTORY_MESSAGE_LIST", [
        ...messages,
        ...(isFistPage ? [] : state.historyMessageList),
      ]);
      commit("SET_HAS_MORE_MESSAGE", !data.isEnd && messages.length === 20);
    } catch (e) {
      commit("SET_HISTORY_MESSAGE_LIST", []);
    }
    return {
      emptyFlag,
    };
  },
  pushNewMessage({ commit, state }, message) {
    commit("SET_HISTORY_MESSAGE_LIST", [...state.historyMessageList, message]);
  },
  updateOneMessage(
    { commit, state },
    {
      message,
      type = UpdateMessageTypes.Overall,
      keyWords = [],
      isSuccess = false,
    },
  ) {
    const tmpList = state.historyMessageList;
    const idx = tmpList.findIndex(
      (msg) => msg.clientMsgID === message.clientMsgID,
    );
    if (idx !== -1) {
      if (type === UpdateMessageTypes.Overall) {
        tmpList[idx] = {
          ...message,
        };
      } else if (type === UpdateMessageTypes.KeyWords) {
        const updateFields = Array.isArray(keyWords) ? keyWords : [keyWords];
        updateFields.forEach(
          (field) => (tmpList[idx][field.key] = field.value),
        );
      }
      commit("SET_HISTORY_MESSAGE_LIST", tmpList);
    }
  },
  resetMessageState({ commit }) {
    commit("SET_HISTORY_MESSAGE_LIST", []);
    commit("SET_HAS_MORE_MESSAGE", true);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
