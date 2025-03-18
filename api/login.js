// 登录
export const businessLogin = (params) =>
  uni.$u?.http.post("/account/login", JSON.stringify(params));
export const businessSendSms = (params) =>
  uni.$u?.http.post("/account/code/send", JSON.stringify(params));
export const businessVerifyCode = (params) =>
  uni.$u?.http.post("/account/code/verify", JSON.stringify(params));
export const businessRegister = (params) =>
  uni.$u?.http.post("/account/register", JSON.stringify(params));
export const businessReset = (params) =>
  uni.$u?.http.post("/account/password/reset", JSON.stringify(params));

export const businessModify = (params) =>
  uni.$u?.http.post(
    "/account/password/change",
    JSON.stringify({
      ...params,
    }),
    {
      header: {
        token: uni.getStorageSync("BusinessToken"),
      },
    }
  );

// 用户信息
export const businessInfoUpdate = (params) =>
  uni.$u?.http.post(
    "/user/update",
    JSON.stringify({
      ...params,
    }),
    {
      header: {
        token: uni.getStorageSync("BusinessToken"),
      },
    }
  );
export const businessGetUserInfo = (userID) =>
  uni.$u?.http.post(
    "/user/find/full",
    JSON.stringify({
      userIDs: [userID],
    }),
    {
      header: {
        token: uni.getStorageSync("BusinessToken"),
      },
    }
  );

export const businessSearchUserInfo = (keyword) =>
  uni.$u?.http.post(
    "/user/search/full",
    JSON.stringify({
      keyword,
      pagination: {
        pageNumber: 1,
        showNumber: 10,
      },
    }),
    {
      header: {
        token: uni.getStorageSync("BusinessToken"),
      },
    }
  );

export const businessSearchUser = (keyword) =>
  uni.$u?.http.post(
    "/friend/search",
    JSON.stringify({
      keyword,
      pagination: {
        pageNumber: 1,
        showNumber: 99,
      },
    }),
    {
      header: {
        token: uni.getStorageSync("BusinessToken"),
      },
    }
  );
