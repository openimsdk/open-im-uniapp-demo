// const BASE_HOST = 'your-server-ip'
// const CHAT_URL = `http://${BASE_HOST}:10008`
// const API_URL = `http://${BASE_HOST}:10002`
// const WS_URL = `ws://${BASE_HOST}:10001`

const BASE_DOMAIN = 'web.rentsoft.cn'
const CHAT_URL = `https://${BASE_DOMAIN}/chat`
const API_URL = `https://${BASE_DOMAIN}/api`
const WS_URL = `wss://${BASE_DOMAIN}/msg_gateway`

const version = 'Uniapp-Demo'

const getRegisterUrl = () => uni.getStorageSync("IMRegisteUrl") || CHAT_URL;
const getApiUrl = () => uni.getStorageSync("IMApiUrl") || API_URL;
const getWsUrl = () => uni.getStorageSync("IMWsUrl") || WS_URL;

module.exports = {
  version,
  getRegisterUrl,
  getApiUrl,
  getWsUrl,
};
