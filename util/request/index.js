// 引入配置
import config from "@/common/config";
// 初始化请求配置
uni.$u.http.setConfig((defaultConfig) => {
  /* defaultConfig 为默认全局配置 */
  defaultConfig.baseURL = config.getRegisterUrl(); /* 根域名 */
  return defaultConfig;
});

module.exports = (vm) => {
  require("./requestInterceptors")(vm);
  require("./responseInterceptors")(vm);
};
