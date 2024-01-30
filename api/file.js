// mp-weixin upload
export const initiateFormData = (params) =>
  uni.$u?.http.post(
    "/object/initiate_form_data",
    JSON.stringify({
      ...params,
    }),
    {
      custom: {
        isIMApi: true,
      },
      header: {
        token: uni.getStorageSync("IMToken"),
      },
    }
  );

export const completeFormData = (params) =>
  uni.$u?.http.post(
    "/object/complete_form_data",
    JSON.stringify({
      ...params,
    }),
    {
      custom: {
        isIMApi: true,
      },
      header: {
        token: uni.getStorageSync("IMToken"),
      },
    }
  );