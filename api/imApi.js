import {
	v4 as uuidv4
} from 'uuid';

// 在线状态
export const getOnlineStateFromSvr = (userID) => uni.$u?.http.post('/user/get_users_online_status', JSON.stringify({
	operationID: uuidv4(),
	userIDList: [userID]
}), {
	custom: {
		isIMApi: true
	},
	header: {
		token: uni.getStorageSync('IMToken')
	}
})
