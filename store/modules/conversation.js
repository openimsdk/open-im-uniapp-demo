import { v4 as uuidv4 } from "uuid";
import IMSDK from "openim-uniapp-polyfill";

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
      ...conversation,
    };
  },
  SET_UNREAD_COUNT(state, count) {
    if (count) {
      uni.setTabBarBadge({
        index: 0,
        text: count < 99 ? count + "" : "99+",
      });
    } else {
      uni.removeTabBarBadge({
        index: 0,
      });
    }
    state.unReadCount = count;
  },
  SET_CURRENT_GROUP(state, group) {
    state.currentGroup = {
      ...group,
    };
  },
  SET_CURRENT_MEMBER_IN_GROUP(state, member) {
    state.currentMemberInGroup = {
      ...member,
    };
  },
};

const actions = {
  async getConversationList({ state, commit }, isFirstPage = true) {
    try {
      const { data } = await IMSDK.asyncApi(
        IMSDK.IMMethods.GetConversationListSplit,
        uuidv4(),
        {
          offset: isFirstPage ? 0 : state.conversationList.length,
          count: 500,
        },
      );
      commit("SET_CONVERSATION_LIST", [
        ...(isFirstPage ? [] : state.conversationList),
        ...data,
      ]);
      return [...data];
    } catch (e) {
      console.log(e);
      commit("SET_CONVERSATION_LIST", []);
      return [];
    }
  },
  getCurrentGroup({ commit }, groupID) {
    IMSDK.asyncApi(IMSDK.IMMethods.GetSpecifiedGroupsInfo, uuidv4(), [
      groupID,
    ]).then(({ data }) => {
      commit("SET_CURRENT_GROUP", data[0] ?? {});
    });
  },
  getCurrentMemberInGroup({ commit, rootState }, groupID) {
    IMSDK.asyncApi(IMSDK.IMMethods.GetSpecifiedGroupMembersInfo, uuidv4(), {
      groupID,
      userIDList: [rootState.user.selfInfo.userID],
    }).then(({ data }) => {
      commit("SET_CURRENT_MEMBER_IN_GROUP", data[0] ?? {});
    });
  },
  getUnReadCount({ commit }) {
    IMSDK.asyncApi(IMSDK.IMMethods.GetTotalUnreadMsgCount, uuidv4()).then(
      (res) => {
        console.log(res);
        commit("SET_UNREAD_COUNT", res.data);
      },
    );
  },
  updateCurrentMemberInGroup({ commit, state }, memberInfo) {
    console.log(memberInfo);
    if (
      memberInfo.groupID === state.currentMemberInGroup.groupID &&
      memberInfo.userID === state.currentMemberInGroup.userID
    ) {
      commit("SET_CURRENT_MEMBER_IN_GROUP", memberInfo);
    }
  },
  resetConversationState({ commit }) {
    commit("SET_CURRENT_MEMBER_IN_GROUP", {});
    commit("SET_CURRENT_GROUP", {});
    commit("SET_CURRENT_CONVERSATION", {});
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
