<script>
	export default {
		data(){
			return {
				groupApplication: 0,
				application: 0
			}
		},
		methods:{
			//设置监听
			setOpenIMSDKListener() {
				//黑名单相关
				this.$globalEvent.addEventListener("onBlackListAdd", (params) => {
					console.log(params);
					this.getBlackList()
				});
				this.$globalEvent.addEventListener("onBlackListDeleted", (params) => {
					console.log(params);
					this.getBlackList()
				});
				this.$globalEvent.addEventListener(
					"onFriendApplicationListDeleted",
					(params) => {
						console.log(params);
						this.getBlackList()
					}
				);
			
				//群组相关
				this.$globalEvent.addEventListener("onGroupInfoChanged", (params) => {
					console.log('onGroupInfoChanged-------------------');
					const tmpData = JSON.parse(params.msg)
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onApplicationProcessed", (params) => {
					console.log('onApplicationProcessed----------');
					console.log(params);
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onReceiveJoinApplication", (params) => {
					console.log('onReceiveJoinApplication----------');
					console.log(params);
					this.getGroupApplicationList()
				});
				this.$globalEvent.addEventListener("onMemberEnter", (params) => {
					console.log('onMemberEnter----------');
					console.log(params);
					// this.getGroupList()
				});
				this.$globalEvent.addEventListener("onGroupCreated", (params) => {
					console.log('onGroupCreated----------');
					console.log(params);
					this.getGroupList()
				});
				this.$globalEvent.addEventListener("onMemberKicked", (params) => {
					console.log('onMemberKicked----------');
					console.log(params);
					// this.getGroupList()
				});
				uni.$on('quitGroup', () => {
					this.getGroupList()
				})
			
				//会话相关
				this.$globalEvent.addEventListener("onNewConversation", (params) => {
					let res = JSON.parse(params.msg);
					res.forEach((r) => (r.latestMsg = JSON.parse(r.latestMsg)));
					this.$u.vuex('vuex_conversation_list', res.concat(this.vuex_conversation_list));
				});
				this.$globalEvent.addEventListener("onConversationChanged", (params) => {
					let res = JSON.parse(params.msg);
					// console.log(res);
					if (res) {
						res.forEach((r) => {
							if (r.latestMsg !== "") {
								r.latestMsg = JSON.parse(r.latestMsg)
							}
						});
						this.$u.vuex('vuex_conversation_list', res)
					}
				});
				this.$globalEvent.addEventListener(
					"onTotalUnreadMessageCountChanged",
					(params) => {
						this.getTotalUnreadMsgCount();
					}
				);
				this.$globalEvent.addEventListener("onSyncServerStart", (params) => {
					console.log(params.msg);
				});
				this.$globalEvent.addEventListener("onSyncServerFailed", (params) => {
					console.log(params.msg);
				});
				this.$globalEvent.addEventListener("onSyncServerFinish", (params) => {
					console.log(params.msg);
				});
			
				//好友相关
				this.$globalEvent.addEventListener(
					"onFriendApplicationListAdded",
					(params) => {
						this.getFriendApplicationList()
					}
				);
				this.$globalEvent.addEventListener(
					"onFriendInfoChanged",
					(params) => {
						console.log('onFriendInfoChanged```````````````');
						this.getMailList()
					}
				);
				this.$globalEvent.addEventListener("onFriendListAdded", (params) => {
					console.log(params);
					this.getMailList()
				});
				this.$globalEvent.addEventListener("onFriendListDeleted", (params) => {
					console.log(params);
					this.getMailList()
				});
				this.$globalEvent.addEventListener(
					"onFriendApplicationListAccept",
					(params) => {
						this.getFriendApplicationList()
					}
				);
				this.$globalEvent.addEventListener(
					"onFriendApplicationListReject",
					(params) => {
						this.getFriendApplicationList()
					}
				);
			},
			getGroupList() {
				this.$openSdk.getJoinedGroupList(data => {
					const originalList = JSON.parse(data.msg)
					this.$u.vuex('vuex_group_list', originalList)
				})
			},
			getBlackList() {
				this.$openSdk.getBlackList((data) => {
					const blackList = JSON.parse(data.msg)
					this.$u.vuex('vuex_black_list', blackList)
				})
			},
			getTotalUnreadMsgCount() {
				this.$openSdk.getTotalUnreadMsgCount((data) => {
					if (data.msg) {
						if (Number(data.msg) > 0) {
							uni.setTabBarBadge({
								index: 0,
								text: data.msg > 99 ? "99+" : data.msg,
							});
						} else {
							uni.removeTabBarBadge({
								index: 0,
							});
						}
					}
				});
			},
			getFriendApplicationList() {
				this.$openSdk.getFriendApplicationList((data) => {
					const applicationList = JSON.parse(data.msg)
					this.$u.vuex('vuex_friend_application_list', applicationList)
					const tmpArr = applicationList.filter(a => a.flag === 0)
					this.application = tmpArr.length
					this.$u.vuex('vuex_friend_application_num', this.application)
					const totalNum = this.groupApplication + this.application
					if (totalNum === 0) {
						uni.removeTabBarBadge({
							index: 1,
						});
					} else {
						uni.setTabBarBadge({
							index: 1,
							text: totalNum > 99 ? "99+" : totalNum + "",
						});
					}
				})
			},
			getGroupApplicationList() {
				this.$openSdk.getGroupApplicationList((data) => {
					const tmpInfo = JSON.parse(data.msg)
					const groupApplicationList = tmpInfo.user;
					this.$u.vuex('vuex_group_application_list', groupApplicationList)
					const tmpArr = groupApplicationList.filter(a => a.flag === 0)
					this.groupApplication = tmpArr.length;
					this.$u.vuex('vuex_group_application_num', this.groupApplication)
					const totalNum = this.groupApplication + this.application
					if (totalNum === 0) {
						uni.removeTabBarBadge({
							index: 1,
						});
					} else {
						uni.setTabBarBadge({
							index: 1,
							text: totalNum > 99 ? "99+" : totalNum + "",
						});
					}
				})
			},
			getMailList() {
				this.$openSdk.getFriendList((data) => {
					const originalList = JSON.parse(data.msg)
					console.log(originalList);
					this.$u.vuex('vuex_original_mail_list', originalList)
					const friendList = [{
						letter: "#",
						data: originalList
					}]
					this.$u.vuex('vuex_mail_list', friendList)
				})
			},
		},
		onLoad() {
			this.setOpenIMSDKListener();
			this.getGroupList();
			this.getMailList();
			this.getBlackList();
			this.getFriendApplicationList();
			this.getGroupApplicationList();
			this.getTotalUnreadMsgCount();
		}
	}
</script>

<style scoped>

</style>