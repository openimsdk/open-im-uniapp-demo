export const SECRET = "tuoyun"
const IMPORTFRIENDLIST = ["18349115126", "13918588195", "17396220460", "18666662412"]
const IMPORTGROUPID = "082cad15fd27a2b6b875370e053ccd79"

export const appServerLogin = (loginInfo) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://47.112.160.66:42233/auth/login",
			method: "POST",
			data: JSON.stringify(loginInfo),
			success(res) {
				if(res.data.errCode===0){
					resolve(res.data.data)
				}else{
					reject(res.data)
				}
			},
			fail(err) {
				reject(err.data)
			}
		});
	})
}

export const appServerSendMsg = (phoneNumber) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://47.112.160.66:42233/auth/code",
			method: 'POST',
			data: JSON.stringify({phoneNumber}),
			success(res) {
				if(res.data.errCode===0&&res.data.data.SendCode!==0){
					resolve(res.data.data)
				}else{
					reject(res.data)
				}
			},
			fail(err) {
				reject(err.data)
			}
		})
	})
}

export const appServerVerifyCode = (phoneNumber,verificationCode) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://47.112.160.66:42233/auth/verify",
			method: 'POST',
			data: JSON.stringify({phoneNumber,verificationCode}),
			success(res) {
				if(res.data.errCode===0){
					resolve(res.data.data)
				}else{
					reject(res.data)
				}
			},
			fail(err) {
				reject(err.data)
			}
		})
	})
}

export const appServerSetPwd = (phoneNumber,password,verificationCode) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://47.112.160.66:42233/auth/password",
			method: 'POST',
			data: JSON.stringify({phoneNumber,password,verificationCode}),
			success(res) {
				if(res.data.errCode===0){
					resolve(res.data.data)
				}else{
					reject(res.data)
				}
			},
			fail(err) {
				reject(err.data)
			}
		})
	})
}

export const importFriend = (uid, token) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "http://47.112.160.66:10000/friend/import_friend",
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
			url: "http://47.112.160.66:10000/group/invite_user_to_group",
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
				console.log(res);
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
			// await importFriend(currentUid,adminToken)
			await importGroup(currentUid,adminToken)
			reslove()
		}).catch(err => reject(err))
	})
	
}
