import Vue from 'vue'
import Vuex from 'vuex'

import {setConversationUser,getConversationUser,setToken,getToken,setUserInfo,getUserInfo} from "../utils/storage.js"


Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		registerInfo: {},
		userInfo: getUserInfo() || {},
		token: getToken() || "",
		conversationUser: getConversationUser() || "",
	},
	mutations: {
		getRegisterInfo(state, data) {
			state.registerInfo = data
		},
		SET_USERINFO(state, data) {
			state.userInfo = data
		},
		SET_TOKEN(state, data) {
			state.token = data
		},
		SET_CONVERSATION_USER(state, data) {
			state.conversationUser = data
		}
	},
	actions: {
		UserInfoValue({commit},userInfo){
			setUserInfo(userInfo)
			commit("SET_USERINFO",userInfo)
		},
		getToken({commit},token){
			setToken(token)
			commit("SET_TOKEN",token)
		},
		setConversationUser({commit},userID){
			setConversationUser(userID)
			commit("SET_CONVERSATION_USER",userID)
		}
	}

})
export default store
