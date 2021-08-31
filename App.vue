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
				const obj = {
					platform: 1, //平台类型
					ipApi: "https://open-im.rentsoft.cn", //api域名地址
					ipWs: "wss://open-im.rentsoft.cn/wss", //websocket地址
					dbDir, //SDK数据存放目录
				};
				this.flag = this.$openSdk.initSDK(JSON.stringify(obj));
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
		onShow() {
			if (this.hideState) {
				this.$openSdk.forceReConn()
				this.hideState = false
			}
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

	.uni-navbar,
	.u-navbar {
		box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
	}
</style>
