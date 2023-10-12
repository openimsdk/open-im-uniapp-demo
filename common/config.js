// https+域名形式   nginx配置可参考(https://doc.rentsoft.cn/#/v2/server_deploy/easy_deploy_new?id=%e4%ba%94%e3%80%81nginx%e9%85%8d%e7%bd%ae%e5%8f%82%e8%80%83)
const registerUrl = 'https://web.rentsoft.cn/chat'
const configUrl = 'https://web.rentsoft.cn/complete_admin'
const apiUrl = 'https://web.rentsoft.cn/api'
const wsUrl = 'wss://web.rentsoft.cn/msg_gateway'

const version = 'IM-Uniapp-demo'

// 图片、视频等资源文件存储方式  支持minio cos oss  推荐minio、cos
const objectStorage = "minio";
// 高德地图web api key  用于根据经纬度生成快照  当前key已绑定安卓包名  需要自行申请替换
const AmapWebKey = "";

const getRegisterUrl = () => uni.getStorageSync("IMRegisteUrl") || registerUrl;
const getConfigUrl = () => uni.getStorageSync("IMConfigUrl") || configUrl;
const getApiUrl = () => uni.getStorageSync("IMApiUrl") || apiUrl;
const getWsUrl = () => uni.getStorageSync("IMWsUrl") || wsUrl;
const getStorage = () => uni.getStorageSync("IMStorage") || objectStorage;

module.exports = {
  version,
  AmapWebKey,
  getRegisterUrl,
  getConfigUrl,
  getApiUrl,
  getWsUrl,
  getStorage,
};
