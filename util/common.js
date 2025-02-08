import PinYin from "./pinyin";

import excel from "static/images/file_message/file_excel.png";
import ppt from "static/images/file_message/file_ppt.png";
import word from "static/images/file_message/file_word.png";
import zip from "static/images/file_message/file_zip.png";
import pdf from "static/images/file_message/file_pdf.png";
import unknown from "static/images/file_message/file_unknown.png";

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
  let atUsersInfo = [];
  let text = html2Text(html);
  const imgReg = new RegExp("(i?)(<img)([^>]+>)", "gmi");
  const customDataReg = /data-custom=".+"/;
  text = text.replace(imgReg, (img) => {
    if (img.includes('class="at_el"')) {
      const atInfoArr = img
        .match(customDataReg)[0]
        .slice(13, -1)
        .split("&amp;");
      atUsersInfo.push({
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
    atUsersInfo,
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
        },
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
      return "账号已注册";
    case 20005:
      return "操作过于频繁，请稍后再试";
    case 20006:
      return "验证码错误";
    case 20007:
      return "验证码过期";
    case 20008:
      return "验证码错误次数超过限制，请稍后再试";
    case 20009:
      return "验证码已被使用";
    case 20010:
      return "邀请码已被使用";
    case 20011:
      return "邀请码不存在";
    case 20012:
      return "操作限制";
    case 20014:
      return "账号已注册";
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
export const Igexin = new IgexinTool();
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
                  (err) => reject(err),
                );
              },
              (err) => reject(err),
            );
          },
          (err) => reject(err),
        );
      },
      (err) => reject(err),
    );
  });
};

export const getFileType = (name) => {
  const idx = name.lastIndexOf(".");
  return name.slice(idx + 1);
};

export const getFileIcon = (fileName) => {
  const fileType = getFileType(fileName);

  const wordType = ["doc", "docx", "docm", "dot"];

  const pdfType = ["pdf"];

  const pptType = ["pptx", "pptm", "ppt"];

  const excelType = ["xlsx", "xlsm", "xlsb", "xltx"];

  const zipType = ["zip", "rar", "tar", "gz"];

  if (wordType.includes(fileType)) {
    return word;
  }
  if (pdfType.includes(fileType)) {
    return pdf;
  }
  if (pptType.includes(fileType)) {
    return ppt;
  }
  if (excelType.includes(fileType)) {
    return excel;
  }
  if (zipType.includes(fileType)) {
    return zip;
  }

  return unknown;
};