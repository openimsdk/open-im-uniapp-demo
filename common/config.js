// const registerUrl = 'https://xxx.com/chat'
// const apiUrl = 'https://xxx.com/api'
// const wsUrl = 'wss://xxx.com/msg_gateway'

const registerUrl = 'http://your-server-ip:10008'
const configUrl = 'http://your-server-ip:10009'
const apiUrl = 'http://your-server-ip:10002'

let wsUrl = ''

// #ifdef APP-PLUS
wsUrl = 'ws://your-server-ip:10001'
// #endif

// #ifdef H5 || MP-WEIXIN
wsUrl = 'ws://your-server-ip:10003'
// #endif

const version = 'OpenIM-Uni-Demo'

// 高德地图web api key  用于根据经纬度生成快照  当前key已绑定安卓包名  需要自行申请替换
const AmapWebKey = "";

const getRegisterUrl = () => uni.getStorageSync("IMRegisteUrl") || registerUrl;
const getConfigUrl = () => uni.getStorageSync("IMConfigUrl") || configUrl;
const getApiUrl = () => uni.getStorageSync("IMApiUrl") || apiUrl;
const getWsUrl = () => uni.getStorageSync("IMWsUrl") || wsUrl;

module.exports = {
  version,
  AmapWebKey,
  getRegisterUrl,
  getConfigUrl,
  getApiUrl,
  getWsUrl,
};
