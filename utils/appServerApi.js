export const SECRET = "tuoyun"
const IMPORTFRIENDLIST = ["18349115126", "13918588195", "17396220460", "18666662412"]
const IMPORTGROUPID = "b6d1f6d16481547c26b744fa701c6f0f"

export const appServerLogin = (loginInfo) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://1.14.194.38:10000/auth/user_token",
			method: "POST",
			data: JSON.stringify(loginInfo),
			success(res) {
				resolve(res.data)
			},
			fail(err) {
				reject(err)
			}
		});
	})
}

export const appServerRegiester = (registerInfo) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://1.14.194.38:10000/auth/user_register",
			method: 'POST',
			data: JSON.stringify(registerInfo),
			success(res) {
				if (res.data.errCode) {
					reject(res.data)
				} else {
					resolve(res.data)
				}
			},
			fail(err) {
				reject(err)
			}
		})
	})
}

export const importFriend = (uid, token) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://1.14.194.38:10000/friend/import_friend",
			method: "POST",
			header: {
				"token":token
			},
			data: {
				uidList: IMPORTFRIENDLIST,
				ownerUid: uid,
				operationID: "import_friend_op",
			},
			success(res) {
				resolve(res.data)
			},
			fail(err) {
				reject(err)
			}
		});
	})
}

export const importGroup = (uid, token) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://1.14.194.38:10000/group/invite_user_to_group",
			method: "POST",
			header: {
				token
			},
			data: {
				groupID: IMPORTGROUPID,
				uidList: [uid],
				reason: "default op",
				operationID: "import_group_op",
			},
			success(res) {
				resolve(res.data)
			},
			fail(err) {
				reject(err)
			}
		});
	})
}

export const importRelationShip = (currentUid) => {
	const ADMINUID = "openIM123456"
	let adminInfo = {
		secret: SECRET,
		platform: 8,
		uid:ADMINUID,
	};
	return new Promise((reslove,reject)=>{
		appServerLogin(adminInfo).then(async res => {
			const adminToken = res.data.token
			await importFriend(currentUid,adminToken)
			await importGroup(currentUid,adminToken)
			reslove()
		}).catch(err => reject(err))
	})
	
}
