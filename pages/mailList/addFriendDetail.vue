<template>
	<view id="addFriendDetail">
		<uni-nav-bar left-icon="back" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<view class="infoCard">
				<image :src="searchFriendData.icon||iconUrl" mode="" class="headIcon"></image>
				<text class="name">{{ searchFriendData.name }}</text>
				<view class="uidCon">account number:<text class="uid">{{ searchFriendData.uid }}</text>
				</view>
				<button :loading="isLoading" type="primary" class="button" @click="addFriend">
					<image src="../../static/addFriend2.png" mode="" class="buttonIcon"></image>
					<text>{{ isFriend ? "Send Message" : "Add friend" }}</text>
				</button>
			</view>
			<text class="infoText" v-show="isSend&&!isFriend">Friend request sent</text>
		</view>
		<u-modal title="notice" v-model="show" @confirm="confirmAdd" show-cancel-button confirm-text="confirm"
			cancel-text="cancel">
			<view class="slot-content">
				<u-input placeholder="please input introduce" :custom-style="customStyle" v-model="addMsg" />
			</view>
		</u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				iconUrl: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png",
				searchFriendData: {},
				alreadyAdd: false,
				isSend: false,
				isFriend: false,
				addMsg: "",
				show: false,
				isLoading: false,
				customStyle: {
					padding: "0rpx 48rpx",
				},
			};
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			addFriend() {
				if (this.isFriend) {
					let conversation = JSON.parse(JSON.stringify(this.searchFriendData))
					conversation.userID = conversation.uid
					conversation.conversationID = 'single_'+conversation.uid
					this.$u.vuex('vuex_conversation', conversation)
					this.$u.vuex('vuex_conversation_user', this.searchFriendData.uid)
					uni.navigateTo({
						url: "/pages/conversation/chatWin",
					});
				} else {
					this.show = true;
				}
			},
			confirmAdd() {
				this.isLoading = true
				const reqData = {
					uid: this.searchFriendData.uid,
					reqMessage: this.addMsg,
				};
				this.$openSdk.addFriend(reqData, (data) => {
					let _this = this;
					if (data.msg === "") {
						uni.showToast({
							title: "send success",
							icon: "success",
							success() {
								_this.isSend = true;
							},
						});
					}
					this.isLoading = false
				});
			},
			checkShip(uid) {
				const reqData = [uid];
				this.$openSdk.checkFriend(JSON.stringify(reqData), (data) => {
					const shipArr = JSON.parse(data.msg);
					if (shipArr[0].flag === 1) {
						this.isFriend = true;
					} else {
						this.isFriend = false;
					}
				});
			},
			friendListener() {
				this.$globalEvent.addEventListener("onFriendListAdded", (data) => {
					console.log(data);
					this.checkShip(this.searchFriendData.uid);
				});
			},
		},
		onLoad: function(options) {
			const tmpArr = JSON.parse(options.userInfo);
			this.searchFriendData = tmpArr[0];
			this.friendListener()
			this.checkShip(this.searchFriendData.uid);
		},
	};
</script>

<style lang="scss" scoped>
	#addFriendDetail {
		.main {
			display: flex;
			flex-direction: column;
			align-items: center;

			.infoCard {
				width: 662rpx;
				height: 536rpx;
				background: #fafcff;
				box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.14);
				border-radius: 20rpx;
				margin-top: 80rpx;
				display: flex;
				flex-direction: column;
				align-items: center;

				.headIcon {
					width: 160rpx;
					height: 160rpx;
					border-radius: 160rpx;
					margin-top: 56rpx;
				}

				.name {
					font-size: 32rpx;
					font-weight: 600;
					color: #333333;
					margin-top: 32rpx;
				}

				.uidCon {
					font-size: 28rpx;
					font-weight: 400;
					color: #666666;
					margin-top: 8rpx;
					width: 80%;
					display: flex;

					.uid {
						word-wrap: break-word;
						flex: 1;
						width: 0;
					}
				}

				.button {
					height: 64rpx;
					font-size: 24rpx;
					font-weight: 500;
					margin-top: 56rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4rpx 8rpx;

					.buttonIcon {
						width: 28rpx;
						height: 28rpx;
						margin-right: 12rpx;
					}
				}
			}

			.infoText {
				font-size: 32rpx;
				font-weight: 400;
				color: #1b72ec;
				margin-top: 380rpx;
				text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
			}
		}
	}
</style>
