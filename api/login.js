// 登录
export const businessLogin = (params) => uni.$u?.http.post('/account/login', JSON.stringify(params))
export const businessSendSms = (params) => uni.$u?.http.post('/account/code', JSON.stringify(params))
export const businessVerifyCode = (params) => uni.$u?.http.post('/account/verify', JSON.stringify(params))
export const businessRegister = (params) => uni.$u?.http.post('/account/password', JSON.stringify(params))
export const businessReset = (params) => uni.$u?.http.post('/account/reset_password', JSON.stringify(params))
export const businessModify = (params) => uni.$u?.http.post('/account/change_password', JSON.stringify(params))




// 用户信息
export const businessInfoUpdate = (params) => uni.$u?.http.post('/user/update_user_info', JSON.stringify({
	...params,
	operationID: Date.now() + ""
}), {
	header: {
		token: uni.getStorageSync('BusinessToken')
	}
})
export const businessGetUserInfo = (userID) => uni.$u?.http.post('/user/get_users_full_info', JSON.stringify({
	userIDList: [userID],
	operationID: Date.now() + ""
}), {
	header: {
		token: uni.getStorageSync('BusinessToken')
	}
})

export const businessSearchUserInfo = (content) => uni.$u?.http.post('/user/search_users_full_info', JSON.stringify({
	content,
	pageNumber: 0,
	showNumber: 20,
	operationID: Date.now() + ""
}), {
	header: {
		token: uni.getStorageSync('BusinessToken')
	}
})