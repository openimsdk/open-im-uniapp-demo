import { v4 as uuidv4 } from "uuid";
import IMSDK from "openim-uniapp-polyfill";
import { businessGetUserInfo } from "@/api/login";
import { filterEmptyValue } from "@/util/common";

const state = {
  selfInfo: {},
  authData: {},
  isSyncing: false,
  rootFontSize: uni.getStorageSync("RootFontSize") || "14px",
};

const mutations = {
  SET_SELF_INFO(state, info) {
    state.selfInfo = {
      ...info,
    };
  },
  SET_AUTH_DATA(state, data) {
    state.authData = {
      ...data,
    };
  },
  SET_IS_SYNCING(state, data) {
    state.isSyncing = data;
  },
  SET_ROOT_FONT_SIZE(state, data) {
    state.rootFontSize = data;
  },
};

const actions = {
  async getSelfInfo({ commit }) {
    try {
      const { data } = await IMSDK.asyncApi(
        IMSDK.IMMethods.GetSelfUserInfo,
        uuidv4(),
      );
      const { users } = await businessGetUserInfo(data.userID);
      const businessData = users[0] ?? {};
      filterEmptyValue(businessData);
      commit("SET_SELF_INFO", {
        ...data,
        ...businessData,
      });
    } catch (e) {
      console.log(e);
      uni.$u.toast("获取个人信息失败");
    }
  },
  async updateBusinessInfo({ commit, state }) {
    try {
      const { users } = await businessGetUserInfo(state.selfInfo.userID);
      const businessData = users[0] ?? {};
      filterEmptyValue(businessData);
      commit("SET_SELF_INFO", {
        ...state.selfInfo,
        ...businessData,
      });
    } catch (e) {
      console.log(e);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
