<template>
	<uni-swipe-action>
		<uni-swipe-action-item autoClose v-for="item in sessionList" :key="item.conversationID">
			<template>
				<view @click="clickConversation(item)" :style="{'backgroundColor':item.isPinned===0?'#fff':'#f0f5ff'}"
					class="chatItem">
					<image
						:src="item.faceUrl||'https://echat-1302656840.cos.ap-chengdu.myqcloud.com/1632447310193.png'"
						mode="" class="portrait"></image>
					<view class="chatItemMain">
						<view class="mainHead">
							<text class="nickName">
								{{item.showName||item.userID}}
							</text>
						</view>
						<view class="mainBottom">
							<text class="latestContent">{{ item | msgFilter }}</text>
						</view>
					</view>
					<view class="right-tools">
						<text class="latestTime">
							{{item.latestMsg.sendTime | dateFilter}}
						</text>
						<view class="msgNumber" v-if="item.unreadCount > 0">
							{{ item.unreadCount > 99 ? "99+" : item.unreadCount }}
						</view>
					</view>
				</view>
			</template>
			<template v-slot:right>
				<view class="action-item action-item-top" @click="pinConversation(item.conversationID, item.isPinned)">
					<text>
						{{
		  item.isPinned === 0 ? "置顶" : "取消置顶"
		}}</text>
				</view>
				<view class="action-item action-item-del" @click="deleteConversation(item.conversationID)">
					<text>移除</text>
				</view>
				<view v-show="item.unreadCount !== 0" class="action-item action-item-mark"
					@click="markAsRead(item)">
					<text>Mark read</text>
				</view>
			</template>
		</uni-swipe-action-item>
	</uni-swipe-action>
</template>

<script>
	import {
		calculateDiffTime,
		formatDate
	} from "@/utils/tools.js";
	let that;
	export default {
		data() {
			return {

			}
		},
		props: {
			sessionList: Array
		},
		filters: {
			msgFilter(value) {
				if (value.draftText !== "") {
					return value.draftText.length > 24 ? "draft:" + value.draftText.slice(0, 24) + "..." : "draft:" + value
						.draftText
				}

				if (value.latestMsg === "") return ""

				switch (value.latestMsg.contentType) {
					case 101:
						return value.latestMsg.content;
						break;
					case 102:
						return "[图片]";
						break;
					case 103:
						return "[语音]";
						break;
					case 104:
						return "[视频]";
						break;
					case 106:
						return JSON.parse(value.latestMsg.content).text;
						break;
					case 111:
						return value.latestMsg.sendID==that.vuex_user_info.uid?"你撤回了一条消息":value.latestMsg.senderNickName+" 撤回了一条消息"
					default:
						const tmpMsg = JSON.parse(value.latestMsg.content)
						return tmpMsg.isDisplay === 1 ? tmpMsg.defaultTips : "系统消息"
				}
			},
			dateFilter(val) {
				if (!val) return ""
				// const fromDay = calculateDiffTime(val);
				const sendTimeArr = formatDate(val/1000000);
				const currentTimeArr = formatDate(new Date().getTime());
				if (sendTimeArr[0] < currentTimeArr[0] || sendTimeArr[1] < currentTimeArr[1] || sendTimeArr[2] <
					currentTimeArr[2]) {
					if (sendTimeArr[0] === currentTimeArr[0] && sendTimeArr[1] === currentTimeArr[1] && sendTimeArr[0] <
						currentTimeArr[0]) {
						return "last day";
					} else {
						return sendTimeArr[3]
					}
				} else {
					return sendTimeArr[4]
				}
			},
		},
		methods: {
			clickConversation(item) {
				this.$u.vuex('vuex_conversation_user', item.userID)
				this.$u.vuex('vuex_conversation', item)
				console.log(item)
				uni.navigateTo({
					url: "/pages/conversation/chatWin?conversationID=" + item.conversationID + "&draft=" + item
						.draftText,
				});
			},
			deleteConversation(id) {
				this.$openSdk.deleteConversation(id, (data) => {
					console.log(data);
				});
				this.chooseConversationID = 0;
			},
			pinConversation(id, state) {
				const newState = state === 0 ? true : false;
				this.$openSdk.pinConversation(id, newState, (data) => {
					console.log(data);
				});
			},
			markAsRead(item) {
				if (item.userID) {
					this.$openSdk.markSingleMessageHasRead(item.userID, data => {
						console.log(data);
					})
				} else {
					this.$openSdk.markGroupMessageHasRead(item.groupID, data => {
						console.log(data);
					})
				}
			},
		},
		beforeCreate() {
			that = this
		}
	}
</script>

<style lang="scss">
	.action-item {
		width: 148rpx;
		box-shadow: 0px 4rpx 8rpx 0rpx rgba(0, 0, 0, 0.5);
		font-size: 28rpx;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;

		&-del {
			background: linear-gradient(135deg, #ffd576 0%, #ffab41 100%);
		}

		&-top {
			background: linear-gradient(135deg, #87c0ff 0%, #0060e7 100%);
		}

		&-mark {
			background: linear-gradient(135deg, #c9c9c9 0%, #7a7a7a 100%);
		}
	}

	.chatItem {
		position: relative;
		background-color: #fff;
		height: 146rpx;
		display: flex;
		align-items: center;

		.portrait {
			flex-shrink: 0;
			width: 92rpx;
			height: 92rpx;
			border-radius: 92rpx;
			margin-left: 44rpx;
		}

		.chatItemMain {
			height: 144rpx;
			display: flex;
			flex-direction: column;
			width: 80%;
			margin-left: 28rpx;
			border-bottom: 1px solid #e5ebff;
			margin-right: 44rpx;

			.mainHead {
				display: flex;
				justify-content: space-between;
				margin-top: 38rpx;

				.nickName {
					font-size: 28rpx;
					font-weight: 600;
					color: #333333;
				}

				.latestTime {
					font-size: 24rpx;
					font-weight: 600;
					color: #999999;
				}
			}

			.mainBottom {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.latestContent {
					width: 80%;
					font-size: 24rpx;
					font-weight: 500;
					color: #666666;
					margin-top: 10rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.msgNumber {
					width: 32rpx;
					height: 32rpx;
					border-radius: 32rpx;
					background-color: #f44038;
					text-align: center;
					line-height: 32rpx;
					font-size: 24rpx;
					font-weight: 600;
					color: #ffffff;
				}
			}
		}

		.right-tools {
			display: flex;
			flex-direction: column;
			position: absolute;
			right: 24rpx;
			height: 60%;
			justify-content: space-between;
			align-items: flex-end;

			.latestTime {
				font-size: 24rpx;
				font-weight: 600;
				color: #999999;
			}

			.msgNumber {
				width: 32rpx;
				height: 32rpx;
				border-radius: 32rpx;
				background-color: #f44038;
				text-align: center;
				line-height: 32rpx;
				font-size: 24rpx;
				font-weight: 600;
				color: #ffffff;
			}
		}

		.operationBox {
			width: 100%;
			height: 136rpx;
			position: absolute;
			z-index: 99;
			right: 0;
			display: flex;
			font-size: 28rpx;
			font-weight: 500;
			color: #ffffff;
			text-align: center;
			line-height: 136rpx;

			.transparent {
				width: 100%;
				height: 100%;
			}

			&-left {
				flex-shrink: 0;
				width: 160rpx;
				height: 100%;
				background-image: linear-gradient(to right bottom,
						#7cbaff,
						#1b72ec);
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
			}

			&-right {
				flex-shrink: 0;
				width: 160rpx;
				height: 100%;
				background-image: linear-gradient(to right bottom,
						#ffd576,
						#ffab41);
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
			}

			&-add {
				display: flex;
				align-items: center;
				flex-shrink: 0;
				width: 160rpx;
				height: 100%;
				background-image: linear-gradient(to right bottom,
						#c9c9c9,
						#7a7a7a);
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
				line-height: 20px;
			}
		}
	}
</style>
