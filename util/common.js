import PinYin from './pinyin'

export const html2Text = (html) => {
	if (!html) {
		return ''
	}
	return html
		.replace(/\&nbsp;/g, " ")
		.replace(/<br>/g, "\n")
		.replace(/<p>/g, "")
		.replace(/<\/p>/g, "")
		.trim();
};

export const formatInputHtml = (html) => {
	let text = html2Text(html);
	const imgReg = new RegExp("(i?)(<img)([^>]+>)", "gmi");
	const customDataReg = /data-custom=".+"/;
	text = text.replace(imgReg, (img) => {
		if (img.includes('class="emoji_el"')) {
			return img.match(customDataReg)[0].slice(23, -1);
		}
		return "";
	});
	return text;
};

export const getEl = (el) => {
	return new Promise((resolve) => {
		const query = uni.createSelectorQuery().in(this);
		query
			.select(el)
			.boundingClientRect((data) => {
				// 存在data，且存在宽和高，视为渲染完毕
				resolve(data);
			})
			.exec();
	});
};

export const getDbDir = () => {
	return new Promise((resolve, reject) => {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			fs.root.getDirectory(
				"user", {
					create: true,
				},
				(entry) => {
					resolve(entry.fullPath);
				},
				(error) => {
					reject(error);
				}
			);
		});
	});
};

export const formatChooseData = (data, key = "nickname") => {
	const ucfirst = (l1) => {
		if (l1.length > 0) {
			var first = l1.substr(0, 1).toUpperCase();
			var spare = l1.substr(1, l1.length);
			return first + spare;
		}
	};

	const arraySearch = (l1, l2) => {
		for (var name in PinYin) {
			if (PinYin[name].indexOf(l1) != -1) {
				return ucfirst(name);
				break;
			}
		}
		return false;
	};

	const codefans = (l1) => {
		l1 = l1 ?? "unkown";
		var l2 = l1.length;
		var I1 = "";
		var reg = new RegExp("[a-zA-Z0-9- ]");
		for (var i = 0; i < l2; i++) {
			var val = l1.substr(i, 1);
			var name = arraySearch(val, PinYin);
			if (reg.test(val)) {
				I1 += val;
			} else if (name !== false) {
				I1 += name;
			}
		}
		I1 = I1.replace(/ /g, "-");
		while (I1.indexOf("--") > 0) {
			I1 = I1.replace("--", "-");
		}
		return I1;
	};

	var arr = [],
		firstName;

	for (var i = 0; i < data.length; i++) {
		firstName = data[i].initial = codefans(data[i][key]).substr(0, 1);
		arr.push(firstName.toUpperCase());
	}

	var arrlist = [];
	for (i = 0; i < arr.length; i++) {
		if (arrlist.indexOf(arr[i]) == -1) {
			arrlist.push(arr[i]);
		}
	}

	var dataSort = [];
	for (var i = 0; i < arrlist.length; i++) {
		dataSort[i] = {
			initial: arrlist[i]
		};
		dataSort[i].data = [];
		for (var j = 0; j < data.length; j++) {
			if (data[j].initial.toUpperCase() == dataSort[i].initial) {
				dataSort[i].data.push(data[j]);
			}
		}
	}
	for (var i = 0; i < dataSort.length - 1; i++) {
		for (var j = 1; j < dataSort.length - i; j++) {
			if (dataSort[j - 1].initial > dataSort[j].initial) {
				var a = dataSort[j];
				dataSort[j] = dataSort[j - 1];
				dataSort[j - 1] = a;
			}
		}
	}
	const NomalInitial = "QWERTYUIOPLKJHGFDSAZXCVBNM".split("");
	const special = {
		initial: "#",
		data: [],
	};
	const newFilterData = dataSort.filter((d) => {
		if (!NomalInitial.includes(d.initial)) {
			special.data = [...special.data, ...d.data];
		} else {
			return d;
		}
	});
	if (special.data.length > 0) {
		newFilterData.push(special);
	}
	const indexList = newFilterData.map(item => item.initial)
	const dataList = newFilterData.map(item => item.data)
	return {
		indexList,
		dataList
	};
};


export const getPurePath = (path) => {
	const prefix = 'file://'
	const relativeRrefix = '_doc/'
	if (path.includes(prefix)) {
		path = path.replace(prefix, '')
	}
	if (path.includes(relativeRrefix)) {
		path = plus.io.convertLocalFileSystemURL(path)
	}
	return path
}

export const filterEmptyValue = (obj) => {
	for (let key in obj) {
		if (obj[key] === "") {
			delete obj[key];
		}
	}
};

export const toastWithCallback = (message, callBack, duration = 1000) => {
	uni.$u.toast(message)
	setTimeout(callBack, duration)
}

export const checkLoginError = (error) => {
	if (!error?.errCode) {
		return '操作失败'
	}
	switch (error.errCode) {
		case 10003:
			return '验证码发送失败'
		case 20001:
			return '账号已注册'
		case 20002:
			return '验证码的发送频率太快了！'
		case 20003:
			return '邀请码错误'
		case 20004:
		case 40003:
		case 40004:
			return 'IP已被限制'
		case 30001:
			return '验证码错误'
		case 30002:
			return '验证码已过期'
		case 30003:
			return '邀请码已被使用'
		case 30004:
			return '邀请码不存在'
		case 40001:
			return '账号未注册'
		case 40002:
			return '密码错误'
		case 40005:
			return '账号已被封禁'
		case 50001:
			return 'token已过期'
		case 50002:
			return 'token格式错误'
		case 50003:
			return 'token不存在'
		case 50004:
			return '未知token错误'
		case 50005:
			return 'token创建失败'
		default:
			return '操作失败'
	}
}
