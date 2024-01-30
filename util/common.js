import PinYin from "./pinyin";
import store from "@/store";
import IMSDK from "openim-uniapp-polyfill";
import { initiateFormData, completeFormData } from "@/api/file";

export const getFileSize = (path) => {
  return new Promise(async (resolve, reject) => {
    uni.getFileInfo({
      filePath: path,
      success: function (res) {
        resolve(res.size);
      },
      fail: function (error) {
        reject(error);
      }
    });
  })
};

export const uploadForm = (file) => {
  return new Promise(async (resolve, reject) => {
    const data = await initiateFormData({
      name: `${store.getters.storeSelfInfo.userID}/${new Date().getTime()}.${getFileType(file.path)}`,
      size: file.size,
      contentType: getFileType(file.path),
      group: ""
    })
    const imageID = data.id
    uni.uploadFile({
      url: data.url,
      filePath: file.path,
      name: 'file',
      formData: {
        ...data.formData
      },
      header: {
        token: uni.getStorageSync("IMToken"),
        operationID: IMSDK.uuid(),
      },
      success: async () => {
        const { url } = await completeFormData({
          id: imageID
        })
        resolve(url);
      },
      fail: (err) => {
        reject(err);
      },
    });
  })
}


export const html2Text = (html) => {
  if (!html) {
    return "";
  }
  return html
    .replace(/<\/p><p>/g, "\n")
    .replace(/\&nbsp;/g, " ")
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "")
    .replace(/<br>/g, "")
    .trim();
};

export const parseBr = (content) => {
  if (!content) {
    return "";
  }
  return content.replace(/\n/g, "\\n").trim();
};

export const formatInputHtml = (html) => {
  let atUserList = [];
  let text = html2Text(html);
  const imgReg = new RegExp("(i?)(<img)([^>]+>)", "gmi");
  const customDataReg = /data-custom=".+"/;
  text = text.replace(imgReg, (img) => {
    if (img.includes('class="at_el"')) {
      const atInfoArr = img
        .match(customDataReg)[0]
        .slice(13, -1)
        .split("&amp;");
      atUserList.push({
        atUserID: atInfoArr[0].slice(7),
        groupNickname: atInfoArr[1].slice(15),
      });
      return `@${atInfoArr[0].slice(7)} `;
    }
    if (img.includes('class="emoji_el"')) {
      return img.match(customDataReg)[0].slice(23, -1);
    }
    return "";
  });
  return {
    text,
    atUserList,
  };
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
        "user",
        {
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
      initial: arrlist[i],
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
  const indexList = newFilterData.map((item) => item.initial);
  const dataList = newFilterData.map((item) => item.data);
  return {
    indexList,
    dataList,
  };
};

export const getPurePath = (path) => {
  const prefix = "file://";
  const relativeRrefix = "_doc/";
  if (path.includes(prefix)) {
    path = path.replace(prefix, "");
  }
  if (path.includes(relativeRrefix)) {
    path = plus.io.convertLocalFileSystemURL(path);
  }
  return path;
};

export const getPicInfo = (file) => {
  return new Promise((resolve, reject) => {
    let _URL;
    if (window) {
      _URL = window.URL || window.webkitURL;
    } else {
      uni.getImageInfo({
        src: file.path,
        success: function (image) {
          resolve({ width: image.width, height: image.height });
        },
      });
      return;
    }
    const img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.src = _URL.createObjectURL(file);
  });
};

export const getFileType = (name) => {
  const idx = name.lastIndexOf(".");
  return name.slice(idx + 1);
};

export const base64toFile = (base64Str) => {
  var arr = base64Str.split(","),
    fileType = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], `screenshot${Date.now()}.png`, {
    type: fileType,
  });
};

export const getVideoSnshot = (item) => {
  return new Promise((reslove, reject) => {
    var video = document.createElement("VIDEO");
    video.setAttribute("autoplay", "autoplay");
    video.setAttribute("muted", "muted");
    video.innerHTML = "<source src=" + item + ' type="audio/mp4">';
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    video.addEventListener("canplay", function () {
      var anw = document.createAttribute("width");
      //@ts-ignore
      anw.nodeValue = video.videoWidth;
      var anh = document.createAttribute("height");
      //@ts-ignore
      anh.nodeValue = video.videoHeight;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      //@ts-ignore
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      var base64 = canvas.toDataURL("image/png");
      //@ts-ignore
      video.pause();
      const file = base64toFile(base64);
      reslove(file);
    });
  });
};

export const filterEmptyValue = (obj) => {
  for (let key in obj) {
    if (obj[key] === "") {
      delete obj[key];
    }
  }
};

export const toastWithCallback = (message, callBack, duration = 1000) => {
  uni.$u.toast(message);
  setTimeout(callBack, duration);
};

export const checkLoginError = (error) => {
  if (!error?.errCode) {
    return "操作失败";
  }
  switch (error.errCode) {
    case 20001:
      return "密码错误";
    case 20002:
      return "账号不存在";
    case 20003:
      return "手机号已经注册";
    case 20004:
      return "账号已经注册";
    case 20005:
      return "频繁获取验证码";
    case 20006:
      return "验证码错误";
    case 20007:
      return "验证码过期";
    case 20008:
      return "验证码失败次数过多";
    case 20009:
      return "验证码已经使用";
    case 20010:
      return "邀请码已经使用";
    case 20011:
      return "邀请码不存在";
    case 20012:
      return "限制登录注册";
    case 20013:
      return "拒绝添加好友";
    default:
      return "操作失败";
  }
};

export class IgexinTool {
  isAndorid = plus.os.name == "Android";
  PushManager;
  context;
  Instance;
  GeTuiSdk;

  constructor() {
    if (this.isAndorid) {
      this.PushManager = plus.android.importClass("com.igexin.sdk.PushManager");
      this.context = plus.android.runtimeMainActivity().getContext();
      this.Instance = this.PushManager.getInstance();
    } else {
      this.GeTuiSdk = plus.ios.importClass("GeTuiSdk");
    }
  }

  bindAlias(alias) {
    console.log("bindAlias::", alias);
    if (this.isAndorid) {
      this.Instance.bindAlias(this.context, alias);
    } else {
      this.GeTuiSdk.bindAliasandSequenceNum(alias, alias);
    }
  }

  unbindAlias(alias) {
    console.log("unbindAlias:::", alias);
    if (this.isAndorid) {
      this.Instance.unBindAlias(this.context, alias, true);
    } else {
      this.GeTuiSdk.unbindAliasandSequenceNumandIsSelf(alias, alias, true);
    }
  }

  getVersion() {
    if (this.isAndorid) {
      return this.Instance.getVersion(this.context);
    } else {
      return this.GeTuiSdk.version;
    }
  }

  turnOnPush() {
    console.log("turnOnPush:::");
    if (this.isAndorid) {
      this.Instance.turnOnPush(this.context);
    } else {
      this.GeTuiSdk.setPushModeForOff(false);
    }
    plus.push.setAutoNotification(true);
    setTimeout(() => plus.push.getClientInfo(), 2000);
  }

  turnOffPush() {
    if (this.isAndorid) {
      this.Instance.turnOffPush(this.context);
    } else {
      this.GeTuiSdk.setPushModeForOff(true);
    }
  }
}

// #ifdef APP-PLUS
// export const Igexin = new IgexinTool();
// #endif

export const copyFileToDoc = (from, to = "background") => {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      from,
      (entry) => {
        plus.io.requestFileSystem(
          plus.io.PRIVATE_DOC,
          (fs) => {
            fs.root.getDirectory(
              to,
              {
                create: true,
                exclusive: false,
              },
              (dirEntry) => {
                entry.copyTo(
                  dirEntry,
                  null,
                  (movedEntry) => {
                    resolve(movedEntry.fullPath);
                  },
                  (err) => reject(err)
                );
              },
              (err) => reject(err)
            );
          },
          (err) => reject(err)
        );
      },
      (err) => reject(err)
    );
  });
};
