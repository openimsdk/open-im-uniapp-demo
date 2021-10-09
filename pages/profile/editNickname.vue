<template>
	<view id="edit-nickname">
		<uni-nav-bar left-icon="back" :title="title" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<input type="text" v-model="nickname" class="input" />
			<button :type=" nickname.length==0? 'defailt':'primary' "
				:style="nickname.length==0? 'color=#333333':'color=#000000'" class="saveButton"
				@click="submit">保存</button>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				nickname: "",
				title: "",
				fromMy: true,
				where: "",
				friendInfo:{}
			}
		},
		onShow() {

		},
		methods: {
			goBack() {
				uni.navigateBack()
				// uni.switchTab({
				// 	url: '/pages/profile/my'
				// });
			},
			submit() {
				if (this.where == "my") {
					let reqData = {}
					reqData.name = this.nickname
					let _this = this
					this.$openSdk.setSelfInfo(reqData, data => {
						console.log(data);
						if (data.err) {
							_this.$u.toast('change failed')
						} else {
							const reqData = [_this.vuex_user_info.uid]
							_this.$openSdk.getUsersInfo(reqData, async data => {
								let userInfoRes = JSON.parse(data.msg)
								console.log(userInfoRes);
								_this.$u.vuex('vuex_user_info',userInfoRes[0])
								uni.switchTab({
									url: '/pages/profile/my'
								});
							})
						}
					})
				} else if (this.where == "setFriend") {
					let reqData = {}
					reqData.uid = this.friendInfo.uid
					reqData.comment = this.nickname
					this.$openSdk.setFriendInfo(reqData, data => {
						if (data.err) {
							_this.$u.toast('change fail：' + data.err)
						} else {
							uni.navigateBack()
						}
					})
				}
			}
		},
		onLoad: function(options) {
			console.log(options);
			this.where = options.where
			if (options.where == "my") {
				this.title = "修改昵称"
				this.nickname = this.vuex_user_info.name
			} else if (options.where == "setFriend") {
				this.title = "设置备注"
				this.friendInfo = JSON.parse(options.friendData)
				this.nickname=this.friendInfo.comment||""
				console.log(this.nickname);
			}
		}
	}
</script>

<style lang="scss" scoped>
	#edit-nickname {
		.main {
			display: flex;
			align-items: center;
			margin: 88rpx 44rpx;
			border-bottom: 1px solid #999999;

			.input {
				font-size: 40rpx;
				font-weight: 500;
				color: #333333;
				padding-left: 20rpx;
				padding-bottom: 12rpx;
				width: 510rpx;
			}

			.saveButton {
				padding: 0;
				width: 200rpx;
				height: 56rpx;
				line-height: 52rpx;
				font-size: 28rpx;
				font-weight: 500;
			}
		}

	}
</style>
