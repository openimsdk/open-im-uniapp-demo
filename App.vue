<script>
	import store from "store/index.js";
	export default {
		data() {
			return {
				flag: false,
				dbDir: "",
				hideState: false,
			};
		},
		methods: {
			//初始化目录
			fileInfo() {
				let _this = this;
				plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
					fs.root.getDirectory(
						"user", {
							create: true,
						},
						(entry) => {
							_this.initOpenIMSDK(entry.fullPath);
						},
						(error) => {
							console.log(error);
						}
					);
				});
			},
			//初始化sdk
			initOpenIMSDK(dbDir) {
				const platformID = uni.getSystemInfoSync().platform == 'ios'?1:2
				const obj = {
					platform: platformID, //平台类型
					ipApi: "http://47.112.160.66:10000", //api域名地址
					ipWs: "ws://47.112.160.66:17778", //websocket地址
					dbDir, //SDK数据存放目录
				};
				this.flag = this.$openSdk.initSDK(obj);
				if(this.flag&&this.vuex_last_user&&this.vuex_token) this.login()
			},
			
			login(){
				this.$openSdk.login(this.vuex_last_user, this.vuex_token, async val => {
					if (val.err==undefined) {
						const reqData = [this.vuex_last_user]
						this.$openSdk.getUsersInfo(reqData, data => {
							let userInfoRes = JSON.parse(data.msg)
							this.$u.vuex('vuex_user_info',userInfoRes[0])
						})
						uni.switchTab({
							url: '/pages/conversation/home'
						})
					} else {
						this.$u.toast('登录失效，请重新登录!')
						uni.navigateTo({
							url:"pages/login/login"
						})
					}
				});
			},
			//初始化监听
			initOpenIMSDKListener() {
				// 会话监听
				this.$openSdk.setConversationListener();
				// 消息状态监听
				this.$openSdk.addAdvancedMsgListener();
				// 群组监听
				this.$openSdk.setGroupListener()
				// 好友监听
				this.$openSdk.setFriendListener();
			},
			
		},
		onHide() {
			this.hideState = true
		},
		onLaunch: function() {
			this.initOpenIMSDKListener();
			this.fileInfo();
		},
	};
</script>

<style lang="scss">
	@import "uview-ui/index.scss";

	page {
		height: 100% !important;
	}

	// .uni-navbar,
	// .u-navbar {
	// 	box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
	// }
</style>
