import CosAuth from './cos-auth.js'


// 请求用到的参数
// var prefix = 'https://cos.' + config.Region + '.myqcloud.com/' + config.Bucket + '/'; // 这个后缀式，签名也要指定 Pathname: '/' + config.Bucket + '/'
var prefix = 'https://echat-1302656840.cos.ap-chengdu.myqcloud.com/';
var that;

const tencentCloudStorageCredential = () => {
	let parameter = {
		operationID: that.vuex_user_info.uid + Date.now().toString(),
		token: "token"
	}
	return new Promise((resolve, reject) => {
		uni.request({
			method: "POST",
			url: "http://47.112.160.66:10000/third/tencent_cloud_storage_credential",
			data: parameter,
			success(res) {
				resolve(res)
			},
			fail(err) {
				console.log(err);
				reject(err)
			}
		})
	})
}

// 对更多字符编码的 url encode 格式
var camSafeUrlEncode = function (str) {
	return encodeURIComponent(str)
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/\*/g, '%2A');
};

// 获取临时密钥
var stsCache;
var getCredentials = async function () {
	if (stsCache && Date.now() / 1000 + 30 < stsCache.expiredTime) {
		return stsCache.credentials;
	}


	const result = await tencentCloudStorageCredential()

	var data = result.data.data;
	var credentials = data.Credentials;
	if (credentials) {
		stsCache = data
	}
	return stsCache && stsCache.Credentials





};

// 计算签名
var getAuthorization = function (options, callback) {
	getCredentials(function (credentials) {
		callback({
			XCosSecurityToken: credentials.Token,
			Authorization: CosAuth({
				SecretId: credentials.TmpSecretId,
				SecretKey: credentials.tmpSecretKey,
				Method: options.Method,
				Pathname: options.Pathname,
			})
		});
	});
};

// 上传文件
var uploadFile = function (filePath,_this) {
	that = _this
	return new Promise(async (resolve, reject) => {
		var Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
		const credentials = await getCredentials()
		const AuthData = {
			XCosSecurityToken: credentials.Token,
			Authorization: CosAuth({
				SecretId: credentials.TmpSecretId,
				SecretKey: credentials.TmpSecretKey,
				Method: 'POST',
				Pathname: '/',
			})
		}
		var imgUrl = uni.uploadFile({
			url: prefix,
			filePath: filePath,
			name: 'file',
			formData: {
				'key': Key,
				'success_action_status': 200,
				'Signature': AuthData.Authorization,
				'x-cos-security-token': AuthData.XCosSecurityToken,
				'Content-Type': '',
			},
			success: (uploadFileRes) => {
				var url = prefix + camSafeUrlEncode(Key).replace(/%2F/g, '/');
				resolve(url)
				// store.commit("getUpLoadImgUrl", url)
			},
			fail(err) {
				reject(err)
			}
		});
	})
};




module.exports = uploadFile;
