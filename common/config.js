// const wsUrl = 'wss://xxx.com/msg_gateway'
// const apiUrl = 'https://xxx.com/api'
// const registerUrl = 'https://xxx.com/chat'

const wsUrl = 'ws://your-server-ip:10001'
const apiUrl = 'http://your-server-ip:10002'
const registerUrl = 'http://your-server-ip:10008'

const version = 'OpenCorp-Uni-Demo 3.8.2'

// 高德地图web api key  用于根据经纬度生成快照  当前key已绑定安卓包名  需要自行申请替换
const AmapWebKey = "";

const getRegisterUrl = () => uni.getStorageSync("IMRegisteUrl") || registerUrl;
const getApiUrl = () => uni.getStorageSync("IMApiUrl") || apiUrl;
const getWsUrl = () => uni.getStorageSync("IMWsUrl") || wsUrl;

const getConfigUrl = () => '';

module.exports = {
  version,
  AmapWebKey,
  getRegisterUrl,
  getConfigUrl,
  getApiUrl,
  getWsUrl,
};
