export const setMnemonic = (mnemonic) =>{
	uni.setStorage({
		key: "lastMnemonic",
		data:mnemonic
	})
}

export const getMnemonic = () =>{
	return uni.getStorageSync("lastMnemonic")
}

export const setUserInfo = (info) =>{
	info = JSON.stringify(info)
	uni.setStorage({
		key: "userInfo",
		data:info
	})
}

export const getUserInfo = () =>{
	const info = uni.getStorageSync("userInfo")
	return info?JSON.parse(info):{}
}

export const setToken = (token) =>{
	uni.setStorage({
		key: "Token",
		data:token
	})
}

export const getToken = () =>{
	return uni.getStorageSync("Token")
}

export const setConversationUser = (userID) =>{
	uni.setStorage({
		key: "conversationUser",
		data:userID
	})
}

export const getConversationUser = () =>{
	return uni.getStorageSync("conversationUser")
}