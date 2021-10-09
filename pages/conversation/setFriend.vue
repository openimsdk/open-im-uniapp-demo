<template>
	<view id="setFriend">
		<uni-nav-bar left-icon="back" title="好友设置" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<view class="mainHead">
				<view class="imageCon">
					<image
						src="https://echat-1302656840.cos.ap-chengdu.myqcloud.com/1632447310193.png"
						mode="" class="headIcon"></image>
				</view>
				<text>{{ friendData.comment||friendData.name || friendData.uid }}</text>
			</view>
			<view class="operationSet">
				<view class="operationSetItem" @click="goEditNickname">
					<text>设置备注</text>
					<image src="../../static/arrow.png" mode="" class="arrow"></image>
				</view>
				<view class="operationSetItem">
					<text>置顶联系人</text>
					<u-switch @change="topContact" v-model="topCheck" />
				</view>
				<view class="operationSetItem">
					<text>加入黑名单</text>
					<u-switch @change="changeBlackStatus" v-model="friendData.blackStatus" :active-value="1"
						:inactive-value="0" />
				</view>
				<view class="operationSetItem" @click="deleteRecord">
					<text>清空聊天记录</text>
					<image src="../../static/arrow.png" mode="" class="arrow"></image>
				</view>
			</view>
		</view>

		<view class="deleteBtn" @click="deleteFriend"> 删除好友 </view>

		<uni-popup ref="deleteConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">确定要删除 "{{ friendData.name }}"?</text>
				</view>
				<view class="footerArea">
					<view type="primary" @click="confirmCancel" class="confirmCancel">取消</view>
					<view type="primary" @click="deleteConfirm" class="deleteConfirm">删除</view>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="blockConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">确定要加入黑名单 "{{ friendData.name }}"?</text>
				</view>
				<view class="footerArea">
					<view type="primary" @click="addBlackCancel" class="confirmCancel">取消</view>
					<view type="primary" @click="addBlackConfirm" class="deleteConfirm">确定</view>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="deleteRecordConfirm">
			<view class="confirm">
				<view class="titleArea">
					<text class="titleInfo">确定要清空与 "{{
              friendData.name
            }}"的聊天记录吗?</text>
				</view>

				<view class="footerArea">
					<view type="primary" @click="deleteRecordCancel" class="confirmCancel">取消</view>
					<view type="primary" @click="deleteRecordConfir" class="deleteConfirm">清空</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				friendData: {},
				topCheck: false,
			};
		},
		methods: {
			goEditNickname() {
				uni.navigateTo({
					url: "/pages/profile/editNickname?where=setFriend&friendData="+JSON.stringify(this.friendData),
				});
			},
			topContact(state) {
				this.$openSdk.pinConversation(this.vuex_conversation.conversationID, state, (data) => {
					console.log(data);
				});
				// this.$u.toast("developing")
			},

			//blackList
			changeBlackStatus(val) {
				if (val === 1) {
					this.$refs.blockConfirm.open();
				} else {
					this.$openSdk.deleteFromBlackList(this.friendData.uid, () => {});
				}
			},
			addBlackConfirm() {
				this.$openSdk.addToBlackList(this.friendData.uid, (data) => {
					console.log(data);
					if (data.msg === "") {
						this.$u.toast("add black list success！");
						this.$refs.blockConfirm.close();
					}else{
						this.$u.toast("add black list failed！");
						this.$refs.blockConfirm.close();
					}
				});
			},
			addBlackCancel() {
				this.friendData.blackStatus = false;
				this.$refs.blockConfirm.close();
			},

			//record
			deleteRecord() {
				this.$refs.deleteRecordConfirm.open();
			},
			deleteRecordConfir() {
				this.$u.toast("developing")
			},
			deleteRecordCancel() {
				this.$refs.deleteRecordConfirm.close();
			},

			//friend
			deleteFriend() {
				this.$refs.deleteConfirm.open();
			},
			deleteConfirm() {
				this.$openSdk.deleteFromFriendList(this.friendData.uid, (data) => {
					console.log(data);
					if (data.msg === "") {
						this.$u.toast("delete success！");
						this.$refs.deleteConfirm.close();
						uni.switchTab({
							url:"/pages/conversation/home"
						})
					}
				});
			},
			confirmCancel() {
				this.$refs.deleteConfirm.close();
			},

			goBack() {
				uni.navigateBack();
			},
			initData() {
				const reqData = [this.vuex_conversation_user]
				this.$openSdk.getFriendsInfo(reqData, (data) => {
					if (data.msg) {
						const tmpArr = JSON.parse(data.msg)
						this.friendData = tmpArr[0]
					}
				})
			}
		},
		beforeMount() {
			this.initData()
			this.topCheck=this.vuex_conversation.isPinned===0?false:true
		},
		onShow() {
			this.initData()
		}
	};
</script>

<style lang="scss" scoped>
	#setFriend {
		.confirm {
			width: 500rpx;
			background: #ffffff;
			border-radius: 12rpx;
			text-align: center;

			.titleArea {
				padding: 28rpx 50rpx;

				.titleInfo {
					height: 140rpx;
				}
			}

			.footerArea {
				height: 92rpx;
				display: flex;
				line-height: 92rpx;
				font-size: 32rpx;
				font-weight: 400;
				border-top: 1px solid rgba(151, 151, 151, 0.5);

				.confirmCancel {
					width: 50%;
					color: #333333;
					border-right: 1px solid rgba(151, 151, 151, 0.5);
				}

				.deleteConfirm {
					width: 50%;
					color: #1b72ec;
					background-color: #e8f2ff;
					border-bottom-right-radius: 12rpx;
				}
			}
		}

		.main {
			.mainHead {
				height: 324rpx;
				background-color: #fff;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border-bottom: 2rpx solid rgba(153, 153, 153, 0.4);

				.imageCon {
					width: 160rpx;
					height: 160rpx;
					border-radius: 160rpx;
					border: 6rpx solid #c0dcff;

					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 10rpx;
					font-size: 36px;
					font-weight: 500;
					color: #333333;

					.headIcon {
						width: 114rpx;
						height: 114rpx;
						border-radius: 114rpx;
					}
				}
			}

			.operationSet {
				.operationSetItem {
					height: 88rpx;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 0 44rpx;
					background-color: #fff;
					border-bottom: 2rpx solid rgba(153, 153, 153, 0.4);
					font-size: 32rpx;
					font-weight: 400;
					color: #333333;

					.arrow {
						width: 20rpx;
						height: 34rpx;
					}
				}
			}
		}

		.deleteBtn {
			margin-top: 310rpx;
			font-size: 32rpx;
			font-weight: 500;
			color: #ffffff;
			width: 100%;
			height: 90rpx;
			background: #1b72ec;
			text-align: center;
			line-height: 90rpx;
		}

		.deleteBtn:active {
			background: #1b72ec;
			color: #ffffff;
		}
	}
</style>
