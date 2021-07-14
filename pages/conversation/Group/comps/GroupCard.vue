<template>
	<view class="group-card">
		<view class="group-title">
			<u-avatar :src="info.faceUrl" />
			<view class="group-info">
				<text>{{info.groupName}}</text>
				<view class="group-number">
					<view @longpress="showCopy" class="grouo-num">
						<view class="num-title">
							<image class="group-icon" src="../../../../static/group_icon.png" mode=""></image>
							<text>Group number:</text>
						</view>
						<text>{{info.groupID}}</text>
						<view @click="copy" v-show="isShowCopy" class="copy-area">
							<text>copy</text>
						</view>
					</view>

				</view>
			</view>
		</view>
		<view class="group-introduce">
			<text>
				{{info.introduction}}
			</text>
		</view>
		<u-button v-if="type!=='showInfo'" :loading="loading" class="add-group-btn" type="primary" @click="addGroup">
			{{groupShip?'Chat with group':'Add group chat'}}</u-button>
		<u-button v-else class="add-group-btn" type="primary" @click="modifyGroup">Modify group data</u-button>
		<u-modal v-model="showNoPremission" :show-title="false" show-cancel-button confirm-text="determine"
			cancel-text="cancel" content="You are a member of a group and do not have this permission."></u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isShowCopy: false,
				timer: null,
				groupShip: false,
				loading: false,
				showNoPremission: false
			}
		},
		props: {
			info: Object,
			type: String
		},
		methods: {
			showCopy() {
				this.isShowCopy = true
				if (this.timer) clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					if (this.isShowCopy) this.isShowCopy = false
				}, 2000)
			},
			copy() {
				uni.setClipboardData({
					data: this.info.groupID,
					success: () => {
						uni.hideToast()
						this.isShowCopy = false
						this.$u.toast("copy")
					}
				});
			},
			addGroup() {
				if (this.groupShip) {
					const newItem = Object.assign({}, this.info)
					newItem.conversationID = 'group_' + newItem.groupID
					this.$u.vuex('vuex_conversation', newItem)
					this.$u.vuex('vuex_conversation_user', "")
					uni.navigateTo({
						url: "/pages/conversation/chatWin",
					});
				} else {
					this.loading = true
					this.$openSdk.joinGroup(this.info.groupID, 'hi', (data) => {
						console.log(data);
						if (data.msg) {
							this.$u.toast('send success')
						}
						this.loading = false
					})
				}
			},
			modifyGroup() {
				if (this.vuex_user_info[0].uid === this.info.ownerId) {
					uni.navigateTo({
						url: "/pages/conversation/Group/modifyGroup"
					})
				} else {
					this.showNoPremission = true
				}
			},
			checkShip() {
				console.log(this.vuex_group_list);
				const idx = this.vuex_group_list.findIndex(g => g.groupID === this.info.groupID)
				if (idx > -1) {
					this.groupShip = true
				}
			},
			applicationListener() {
				this.$globalEvent.addEventListener("onApplicationProcessed", (params) => {
					console.log('onApplicationProcessed----------');
					if (JSON.parse(params.msg).groupId === this.info.groupID) this.checkShip()
				});
			}
		},
		beforeMount() {
			this.checkShip()
			this.applicationListener()
		}
	}
</script>

<style lang="scss">
	.group-card {
		width: 88vw;
		height: 860rpx;
		border-radius: 24rpx;
		background-color: #fff;
		margin: 3vh auto;
		box-shadow: 0px 1px 8px 1px rgba(0, 0, 0, 0.15);

		.group-title {
			display: flex;
			padding: 84rpx 36rpx;
			padding-bottom: 24rpx;

			.group-info {
				margin-left: 24rpx;

				&>text {
					font-weight: 600;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				.group-number {
					display: flex;
					align-items: center;
					margin-top: 8rpx;
					position: relative;

					.grouo-num {
						display: flex;
						flex-direction: column;
					}

					.num-title {
						display: flex;
						align-items: center;

						.group-icon {
							width: 28rpx;
							height: 28rpx;
							margin-right: 12rpx;
						}
					}

					.copy-area {
						position: absolute;
						height: 60rpx;
						line-height: 60rpx;
						border-radius: 10rpx;
						padding: 0 12rpx;
						top: -72rpx;
						right: 120rpx;
						background-color: #666666;
						color: #FFFFFF;

						&::after {
							content: '';
							position: absolute;
							bottom: -24rpx;
							right: 36%;
							border: 12rpx solid;
							border-color: #666666 transparent transparent transparent;
						}
					}
				}
			}
		}

		.group-introduce {
			width: 90%;
			margin: 36rpx auto;
			background-color: #f2f2f2;
			padding: 24rpx;
			border-radius: 12rpx;

			text {
				line-height: 42rpx;
				height: 42rpx;
				word-wrap: break-word;
			}
		}

		.add-group-btn {
			margin-top: 200rpx;
			width: 300rpx;
		}
	}
</style>
