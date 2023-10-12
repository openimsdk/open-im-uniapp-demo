// 在线状态
export const getOnlineStateFromSvr = (userID) =>
  uni.$u?.http.post(
    "/user/get_users_status",
    JSON.stringify({
      userID,
      userIDs: [userID],
    }),
    {
      custom: {
        isIMApi: true,
      },
      header: {
        token: uni.getStorageSync("IMToken"),
      },
    },
  );

export const subUserOnlineStatus = (userID, targetID) =>
  uni.$u?.http.post(
    "/user/subscribe_users_status",
    JSON.stringify({
      userID,
      userIDs: [targetID],
      genre: 1,
    }),
    {
      custom: {
        isIMApi: true,
      },
      header: {
        token: uni.getStorageSync("IMToken"),
      },
    },
  );

export const unSubUserOnlineStatus = (userID, targetID) =>
  uni.$u?.http.post(
    "/user/unsubscribe_users_status",
    JSON.stringify({
      userID,
      userIDs: [targetID],
      genre: 2,
    }),
    {
      custom: {
        isIMApi: true,
      },
      header: {
        token: uni.getStorageSync("IMToken"),
      },
    },
  );
