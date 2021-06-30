// var CosAuth = require('./cos-auth.js');
import CosAuth from './cos-auth.js'
// import {
// 	tencent_cloud_storage_credential
// } from '../api/index.js'
import store from '../store/index.js'


// 请求用到的参数
// var prefix = 'https://cos.' + config.Region + '.myqcloud.com/' + config.Bucket + '/'; // 这个后缀式，签名也要指定 Pathname: '/' + config.Bucket + '/'
var prefix = 'https://echat-1302656840.cos.ap-chengdu.myqcloud.com/';

const tencentCloudStorageCredential = () => {
	let parameter = {
		operationID: store.state.userInfo[0].uid + Date.now().toString(),
		token: store.state.token
	}
	return new Promise((resolve, reject) => {
		uni.request({
			method: "POST",
			url: "http://47.112.160.66:10000/third/tencent_cloud_storage_credential",
			data: parameter,
			success(res) {
				console.log(res);
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
	console.log(result, "result");
	var data = result.data.data;
	console.log(data, "data");
	var credentials = data.Credentials;
	if (credentials) {
		console.log("成功")
		stsCache = data
	} else {
		console.log("失败")
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
var uploadFile = function (filePath) {
	return new Promise(async (resolve, reject) => {
		var Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
		console.log(Key, "KeyKeyKeyKey");
		const credentials = await getCredentials()
		console.log(credentials, "credentials");
		const AuthData = {
			XCosSecurityToken: credentials.Token,
			Authorization: CosAuth({
				SecretId: credentials.TmpSecretId,
				SecretKey: credentials.TmpSecretKey,
				Method: 'POST',
				Pathname: '/',
			})
		}
		console.log(AuthData, "AuthData");
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
				store.commit("getUpLoadImgUrl", url)
			},
			fail(err) {
				reject(err)
			}
		});
	})
};




module.exports = uploadFile;
