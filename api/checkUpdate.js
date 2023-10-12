export const checkUpdateFormPgyer = (buildVersion) =>
  uni.$u?.http.post(
    "/apiv2/app/check",
    {
      _api_key: "",
      appKey: "",
      buildVersion,
    },
    {
      custom: {
        isPgyerApi: true,
      },
      dataType: "x-www-form-urlencoded",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
