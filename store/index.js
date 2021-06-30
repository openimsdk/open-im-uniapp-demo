import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		registerInfo: {
			//address,mnemonic,publicKey
		},
		userInfo: {
			//address,mnemonic,publicKey
		},
		token: "",
		upLoadImgUrl: "",
		conversationUser: "",
	},
	mutations: {
		getRegisterInfo(state, data) {
			state.registerInfo = data
		},
		UserInfoValue(state, data) {
			state.userInfo = data
		},
		getToken(state, data) {
			state.token = data
		},
		getUpLoadImgUrl(state, data) {
			state.upLoadImgUrl = data
		},
		setConversationUser(state, data) {
			state.conversationUser = data
		}
	},
	actions: {

	}

})
export default store
