import { v4 as uuidv4 } from "uuid";
import IMSDK from "openim-uniapp-polyfill";

const state = {
  friendList: [],
  blackList: [],
  groupList: [],
  recvFriendApplications: [],
  sentFriendApplications: [],
  recvGroupApplications: [],
  sentGroupApplications: [],
  unHandleFriendApplicationNum: 0,
  unHandleGroupApplicationNum: 0,
};

const mutations = {
  SET_FRIEND_LIST(state, list) {
    state.friendList = [...list];
  },
  SET_BLACK_LIST(state, list) {
    state.blackList = [...list];
  },
  SET_GROUP_LIST(state, list) {
    state.groupList = [...list];
  },
  SET_RECV_FRIEND_APPLICATIONS(state, list) {
    state.recvFriendApplications = [...list];
  },
  SET_SENT_FRIEND_APPLICATIONS(state, list) {
    state.sentFriendApplications = [...list];
  },
  SET_RECV_GROUP_APPLICATIONS(state, list) {
    state.recvGroupApplications = [...list];
  },
  SET_SENT_GROUP_APPLICATIONS(state, list) {
    state.sentGroupApplications = [...list];
  },
};

const actions = {
  async getFriendList({ commit }) {
    let offset = 0;
    let friendInfoList = [];
    let initialFetch = true;
    while (true) {
      try {
        const count = initialFetch ? 10000 : 1000;
        const { data } = await IMSDK.asyncApi("getFriendListPage", uuidv4(), {
          offset,
          count,
        });
        friendInfoList = [
          ...friendInfoList,
          ...data,
        ];
        offset += count;
        if (data.length < count) break;
        initialFetch = false;
      } catch (error) {
        console.error("getFriendListPage error");
      }
    }
    commit("SET_FRIEND_LIST", friendInfoList);
  },
  async getGrouplist({ commit }) {
    let offset = 0;
    let groupList = [];
    while (true) {
      try {
        const { data } = await IMSDK.asyncApi(
          "getJoinedGroupListPage",
          uuidv4(),
          {
            offset,
            count: 1000,
          }
        );
        groupList = [...groupList, ...data];
        offset += 1000;
        if (data.length < 1000) break;
      } catch (error) {
        console.error("getGrouplist error");
      }
    }
    commit("SET_GROUP_LIST", groupList);
  },
  getBlacklist({ commit }) {
    IMSDK.asyncApi(IMSDK.IMMethods.GetBlackList, uuidv4()).then(({ data }) => {
      commit("SET_BLACK_LIST", data);
    });
  },
  getRecvFriendApplications({ commit }) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.GetFriendApplicationListAsRecipient,
      uuidv4(),
    ).then(({ data }) => {
      commit("SET_RECV_FRIEND_APPLICATIONS", data);
    });
  },
  getSentFriendApplications({ commit }) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.GetFriendApplicationListAsApplicant,
      uuidv4(),
    ).then(({ data }) => {
      commit("SET_SENT_FRIEND_APPLICATIONS", data);
    });
  },
  getRecvGroupApplications({ commit }) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.GetGroupApplicationListAsRecipient,
      uuidv4(),
    ).then(({ data }) => {
      commit("SET_RECV_GROUP_APPLICATIONS", data);
    });
  },
  getSentGroupApplications({ commit }) {
    IMSDK.asyncApi(
      IMSDK.IMMethods.GetGroupApplicationListAsApplicant,
      uuidv4(),
    ).then(({ data }) => {
      commit("SET_SENT_GROUP_APPLICATIONS", data);
    });
  },
  pushNewFriend({ commit, state }, friendInfo) {
    const tmpList = [...state.friendList];
    const idx = tmpList.findIndex((item) => item.userID === friendInfo.userID);
    if (idx === -1) {
      commit("SET_FRIEND_LIST", [...tmpList, friendInfo]);
    }
  },
  updateFriendInfo({ commit, state }, { friendInfo, isRemove = false }) {
    const tmpList = [...state.friendList];
    const idx = tmpList.findIndex((item) => item.userID === friendInfo.userID);

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...friendInfo,
        };
      }
      commit("SET_FRIEND_LIST", tmpList);
    }
  },
  pushNewBlack({ commit, state }, blackInfo) {
    const tmpList = [...state.blackList];
    const idx = tmpList.findIndex((item) => item.userID === blackInfo.userID);
    if (idx === -1) {
      commit("SET_BLACK_LIST", [...tmpList, blackInfo]);
    }
  },
  updateBlackInfo({ commit, state }, { blackInfo, isRemove = false }) {
    const tmpList = [...state.blackList];
    const idx = tmpList.findIndex((item) => item.userID === blackInfo.userID);

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...blackInfo,
        };
      }
      commit("SET_BLACK_LIST", tmpList);
    }
  },
  pushNewGroup({ commit, state }, groupInfo) {
    const tmpList = [...state.groupList];
    const idx = tmpList.findIndex((item) => item.groupID === groupInfo.groupID);
    if (idx === -1) {
      commit("SET_GROUP_LIST", [...tmpList, groupInfo]);
    }
  },
  updateGroupInfo(
    { commit, state, rootState },
    { groupInfo, isRemove = false },
  ) {
    const tmpList = [...state.groupList];
    const idx = tmpList.findIndex((item) => item.groupID === groupInfo.groupID);

    if (rootState.conversation.currentGroup.groupID === groupInfo.groupID) {
      commit("conversation/SET_CURRENT_GROUP", groupInfo, { root: true });
    }

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...groupInfo,
        };
      }
      commit("SET_GROUP_LIST", tmpList);
    }
  },
  pushNewRecvFriendApplition({ commit, state }, application) {
    const tmpList = [...state.recvFriendApplications];
    const idx = tmpList.findIndex(
      (item) => item.fromUserID === application.fromUserID,
    );
    if (idx !== -1) {
      tmpList.splice(idx, 1);
    }
    commit("SET_RECV_FRIEND_APPLICATIONS", [...tmpList, application]);
  },
  updateRecvFriendApplition(
    { commit, state, rootState },
    { application, isRemove = false },
  ) {
    const tmpList = [...state.recvFriendApplications];
    const idx = tmpList.findIndex(
      (item) => item.fromUserID === application.fromUserID,
    );

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...application,
        };
      }
      commit("SET_RECV_FRIEND_APPLICATIONS", tmpList);
    }
  },
  pushNewSentFriendApplition({ commit, state }, application) {
    const tmpList = [...state.sentFriendApplications];
    const idx = tmpList.findIndex(
      (item) => item.toUserID === application.toUserID,
    );
    if (idx !== -1) {
      tmpList.splice(idx, 1);
    }
    commit("SET_SENT_FRIEND_APPLICATIONS", [...tmpList, application]);
  },
  updateSentFriendApplition(
    { commit, state, rootState },
    { application, isRemove = false },
  ) {
    const tmpList = [...state.sentFriendApplications];
    const idx = tmpList.findIndex(
      (item) => item.toUserID === application.toUserID,
    );

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...application,
        };
      }
      commit("SET_SENT_FRIEND_APPLICATIONS", tmpList);
    }
  },
  pushNewRecvGroupApplition({ commit, state }, application) {
    const tmpList = [...state.recvGroupApplications];
    const idx = tmpList.findIndex((item) => item.userID === application.userID);
    if (idx !== -1) {
      tmpList.splice(idx, 1);
    }
    commit("SET_RECV_GROUP_APPLICATIONS", [...tmpList, application]);
  },
  updateRecvGroupApplition(
    { commit, state, rootState },
    { application, isRemove = false },
  ) {
    const tmpList = [...state.recvGroupApplications];
    const idx = tmpList.findIndex((item) => item.userID === application.userID);

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...application,
        };
      }
      commit("SET_RECV_GROUP_APPLICATIONS", tmpList);
    }
  },
  pushNewSentGroupApplition({ commit, state }, application) {
    const tmpList = [...state.sentGroupApplications];
    const idx = tmpList.findIndex(
      (item) => item.groupID === application.groupID,
    );
    if (idx !== -1) {
      tmpList.splice(idx, 1);
    }
    commit("SET_SENT_GROUP_APPLICATIONS", [...tmpList, application]);
  },
  updateSentGroupApplition(
    { commit, state, rootState },
    { application, isRemove = false },
  ) {
    const tmpList = [...state.sentGroupApplications];
    const idx = tmpList.findIndex(
      (item) => item.groupID === application.groupID,
    );

    if (idx !== -1) {
      if (isRemove) {
        tmpList.splice(idx, 1);
      } else {
        tmpList[idx] = {
          ...application,
        };
      }
      commit("SET_SENT_GROUP_APPLICATIONS", tmpList);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
