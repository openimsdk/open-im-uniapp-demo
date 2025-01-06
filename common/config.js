const BASE_HOST = 'your-server-ip'
const CHAT_URL = `http://${BASE_HOST}:10008`
const API_URL = `http://${BASE_HOST}:10002`
const WS_URL = `ws://${BASE_HOST}:10001`

// const BASE_DOMAIN = 'your-server-domain'
// const CHAT_URL = `http://${BASE_DOMAIN}/chat`
// const API_URL = `http://${BASE_DOMAIN}/api`
// const WS_URL = `ws://${BASE_DOMAIN}/msg_gateway`

const version = 'Uniapp-Demo'

// 高德地图web api key  用于根据经纬度生成快照  当前key已绑定安卓包名  需要自行申请替换
const AmapWebKey = "";

const getRegisterUrl = () => uni.getStorageSync("IMRegisteUrl") || CHAT_URL;
const getApiUrl = () => uni.getStorageSync("IMApiUrl") || API_URL;
const getWsUrl = () => uni.getStorageSync("IMWsUrl") || WS_URL;

module.exports = {
  version,
  AmapWebKey,
  getRegisterUrl,
  getApiUrl,
  getWsUrl,
};
