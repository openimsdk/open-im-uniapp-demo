import appConfig from "@/common/config";
import { v4 as uuidV4 } from "uuid";
/**
 * 请求拦截
 * @param {Object} http
 */
module.exports = (vm) => {
  uni.$u.http.interceptors.request.use(
    (config) => {
      // 可使用async await 做异步操作
      // 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
      config.data = config.data || {};
      if (config.custom.isIMApi) {
        config.baseURL = appConfig.getApiUrl();
      }
      if (config.custom.isPgyerApi) {
        config.baseURL = "https://www.pgyer.com";
      }
      config.header = {
        ...config.header,
        operationID: uuidV4(),
      };
      // 可以在此通过vm引用vuex中的变量，具体值在vm.$store.state中
      return config;
    },
    (
      config, // 可使用async await 做异步操作
    ) => Promise.reject(config),
  );
};
