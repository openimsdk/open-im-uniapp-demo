<template>
	<view id="edit-nickname">
		<uni-nav-bar left-icon="back" :title="title" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<input type="text" v-model="nickname" class="input" />
			<button :type=" nickname.length==0? 'defailt':'primary' "
				:style="nickname.length==0? 'color=#333333':'color=#000000'" class="saveButton"
				@click="submit">preservation</button>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				nickname: "xxx",
				title: "",
				fromMy: true,
				where: ""
			}
		},
		onShow() {

		},
		methods: {
			goBack() {
				uni.switchTab({
					url: '/pages/profile/my'
				});
			},
			submit() {
				if (this.where == "my") {
					let parameter = {}
					parameter.name = this.nickname
					let _this = this
					this.$openSdk.setSelfInfo(parameter, data => {
						if (data.err) {
							_this.$u.toast('change fail：' + data.err)
						} else {
							const reqData = [_this.$store.state.userInfo[0].uid]
							_this.$openSdk.getUsersInfo(JSON.stringify(reqData), async data => {
								let userInfoRes = JSON.parse(data.msg)
								await _this.$store.commit("UserInfoValue", userInfoRes);
								uni.switchTab({
									url: '/pages/profile/my'
								});
							})

						}


					})
				} else if (this.where == "setFriend") {
					let parameter = {}
					parameter.uid = this.$store.state.setFriendData.uid
					parameter.comment = this.nickname
					this.$openSdk.setFriendInfo(parameter, data => {
						if (data.err) {
							_this.$u.toast('change fail：' + data.err)
						} else {
							let transfer = this.$store.state.setFriendData
							transfer.name = this.nickname
							this.$store.commit('getSetFriendData', transfer)
							uni.navigateBack()
						}
					})

				}

			}
		},
		onLoad: function(options) {
			this.where = options.where
			if (options.where == "my") {
				this.title = "Change nickname"
				this.nickname = this.$store.state.userInfo[0].name
			} else if (options.where == "setFriend") {
				this.title = "Set notes"
				if (!this.$store.state.setFriendData.comment) {
					this.nickname = ""
				} else {
					this.nickname = this.$store.state.setFriendData.comment

				}

			}
		}
	}
</script>

<style lang="scss" scoped>
	#edit-nickname {
		.main {
			display: flex;
			align-items: center;
			padding: 0 44rpx;
			margin-top: 88rpx;

			.input {
				font-size: 40rpx;
				font-weight: 500;
				color: #333333;
				border-bottom: 1px solid #999999;
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
