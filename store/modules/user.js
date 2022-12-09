import {
	v4 as uuidv4
} from 'uuid';
import IMSDK from '@/util/compatibleIM'
import {
	businessGetUserInfo,
	getAppConfigFromSvr
} from '@/api/login';
import {
	filterEmptyValue
} from '@/util/common';

const state = {
	selfInfo: {},
	authData: {},
}

const mutations = {
	SET_SELF_INFO(state, info) {
		state.selfInfo = {
			...info
		}
	},
	SET_AUTH_DATA(state, data) {
		state.authData = {
			...data
		}
	},
}

const actions = {
	async getSelfInfo({
		commit
	}) {
		try {
			const {
				data
			} = await IMSDK.compatibleAPI(IMSDK.IMMethods.GetSelfUserInfo, uuidv4())
			const {
				userFullInfoList
			} = await businessGetUserInfo(data.userID)
			const businessData = userFullInfoList[0] ?? {}
			filterEmptyValue(businessData)
			commit('SET_SELF_INFO', {
				...data,
				...businessData
			})
		} catch (e) {
			uni.$u.toast('获取个人信息失败')
		}
	},
	async updateBusinessInfo({
		commit,
		state
	}) {
		try {
			const {
				userFullInfoList
			} = await businessGetUserInfo(state.selfInfo.userID)
			const businessData = userFullInfoList[0] ?? {}
			filterEmptyValue(businessData)
			commit('SET_SELF_INFO', {
				...state.selfInfo,
				...businessData
			})
		} catch (e) {
			console.log(e);
		}
	},
}


export default {
	namespaced: true,
	state,
	mutations,
	actions,
};
