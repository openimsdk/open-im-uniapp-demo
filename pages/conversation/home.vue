<template>
	<view @click="pageClick" id="home">
		<view class="head">
			<text class="title">Open IM</text>
			<HeaderModal :showOperationsMenu="showOperationsMenu" @controlDisplay="controlDisplay" />
		</view>
		<view class="main">
			<view class="chatList">
				<u-empty v-if="vuex_conversation_list.length===0" class="empty" text="There is no conversation" mode="message"/>
				<ConversationIist v-else :sessionList="vuex_conversation_list" />
			</view>
		</view>
	</view>
</template>

<script>
	import HeaderModal from '@/components/HeaderModal/HeaderModal.vue'
	import ConversationIist from './comps/ConversationIist.vue'
	import initSDKMixin from '@/utils/openIM-mixin.vue'
	export default {
		data() {
			return {
				sessionList: [],
				userInfo: null,
				startData: {},
				isLatestSeq: true,
				addNewMessage: false,
				showOperationsMenu: false,
				listener: null,
			};
		},
		mixins:[initSDKMixin],
		components: {
			HeaderModal,
			ConversationIist
		},
		methods: {
			pageClick() {
				console.log("pageClick");
				if (this.showOperationsMenu) this.showOperationsMenu = false
			},
			getAllConversationListList() {
				this.$openSdk.getAllConversationList((data) => {
					let tmpList = JSON.parse(data.msg);
					console.log(tmpList);
					for (let i = 0; i < tmpList.length; i++) {
						if (tmpList[i].latestMsg !== '') {
							tmpList[i].latestMsg = JSON.parse(tmpList[i].latestMsg);
							tmpList[i].isShow = false;
						}
					}
					this.$u.vuex('vuex_conversation_list',tmpList)
					uni.stopPullDownRefresh()
				});
			},
			controlDisplay() {
				this.showOperationsMenu = !this.showOperationsMenu;
			},
		},
		onHide() {
			if (this.showOperationsMenu) this.showOperationsMenu = false
		},
		onPullDownRefresh(){
			this.getAllConversationListList()
		},
		beforeMount() {
			this.getAllConversationListList();
		},
	};
</script>

<style lang="scss" scoped>
	#home {
		position: relative;

		.head {
			position: fixed;
			z-index: 99;
			width: 100%;
			height: 90rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			// box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.15);

			.title {
				font-size: 44rpx;
				font-weight: 500;
				color: #1b72ec;
				line-height: 90rpx;
				margin-left: 44rpx;
			}

			.headRight {
				.headIcon {
					width: 48rpx;
					height: 48rpx;
					margin-right: 40rpx;
				}

				.my-menuCon {
					z-index: 99;
					position: absolute;
					top: 86rpx;
					right: 1.5%;
					display: flex;
					flex-direction: column;

					&::after {
						content: "";
						position: absolute;
						top: -36rpx;
						right: 36rpx;
						border: 20rpx solid;
						border-color: transparent transparent #1b72ec transparent;
					}

					.operationsMenu {
						background-color: #1b72ec;
						box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.5);
						border-radius: 18rpx;
						padding: 24rpx;

						.operationsMenu-item {
							display: flex;
							align-items: center;
							font-size: 30rpx;
							font-weight: 600;
							color: #ffffff;

							&:nth-child(2) {
								padding: 24rpx 0;
							}

							.itemImg {
								width: 36rpx;
								height: 36rpx;
								margin-right: 24rpx;
							}
						}
					}
				}
			}
		}

		.main {
			padding-top: 90rpx;
			// padding-bottom: 120rpx;

			.chatList {
				margin-top: 6rpx;
				.empty{
					padding-top: 120rpx;
				}
			}
		}
	}
</style>
