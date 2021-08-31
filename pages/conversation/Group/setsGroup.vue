<template>
	<view class="container">
		<u-navbar title-width="400" title="Group chat settings" />
		<view @click="modifyGroup" class="group-head">
			<u-avatar :src="groupInfo.faceUrl" />
			<view class="group-info">
				<text class="group-name">{{groupInfo.groupName}}</text>
				<text class="group-introduce">{{groupInfo.introduction}}</text>
			</view>
		</view>
		<view class="group-menber">
			<view v-for="item in groupMemberList" class="menber-item">
				<u-avatar size="68" :src="item.faceUrl||'../../../static/user.png'" />
				<view class="nick">{{item.nickName||'nickname'}}</view>
			</view>
			<view @click="addUser" class="menber-item access-icon">
				<u-avatar size="68" src="../../../static/add_group.png" />
			</view>
			<view @click="removeUser" class="menber-item access-icon">
				<u-avatar size="68" src="../../../static/remove_group.png" />
			</view>
			<view @click="showAll" class="menber-item access-icon">
				<image src="../../../static/right_arrow.png" style="width: 24rpx;height: 44rpx;"></image>
			</view>
		</view>
		<view class="group-access">
			<AccessItem @click="announcementGroup" title="Group announcement" />
			<AccessItem @click="transferManagement" title="Transfer of management rights" />
			<AccessItem @click="editNick" title="My nickname in the group" />
		</view>

		<view class="group-access">
			<AccessItem @click="breakUpGroup" style="margin-top: 24rpx;" title="Break up group chat" />
		</view>

		<view class="group-access">
			<AccessItem @click="delRecords" title="Empty chat record" />
			<AccessItem isSwitch title="No hint news" />
		</view>

		<view class="group-access">
			<AccessItem @click="changeTop" :isChecked="vuex_conversation.isPinned===0?false:true" style="margin-top: 24rpx;" isSwitch title="Top chat" />
		</view>

		<u-button :disabled="!isInGroup" :loading="loading" style="margin-top: 48rpx;border-radius: 0;" type="primary"
			@click="quitGroup">sign out</u-button>

		<u-popup v-model="breakPopState" mode="bottom">
			<view class="">
				<view class="break-title">
					You will lose contact with group friends after disbanding the group. Are you sure you want to
					disband?
				</view>
				<view class="break-btns">
					<u-button class="break-btns-item" @click="comfirmBreak" type="primary">confirm</u-button>
					<u-button class="break-btns-item" @click="cancelBreak" type="primary">cancel</u-button>
				</view>
			</view>
		</u-popup>

		<u-modal v-model="showDelRecords" @confirm="comfirmDelRed" :show-title="false" show-cancel-button confirm-text="determine"
			cancel-text="cancel" content="Are you sure you want to delete the chat records of this chat group?">
		</u-modal>
		<u-modal v-model="showQuitGroup" @confirm="comfirmQuit" :show-title="false" show-cancel-button
			confirm-text="determine" cancel-text="cancel"
			content="You are the group leader. If you want to quit the group chat, please transfer the management right first.">
		</u-modal>
		<u-modal v-model="showNoPremission" :show-title="false" show-cancel-button confirm-text="determine"
			cancel-text="cancel" content="You are a member of a group and do not have this permission."></u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import AccessItem from "./comps/AccessItem.vue"
	export default {
		data() {
			return {
				breakPopState: false,
				showDelRecords: false,
				showQuitGroup: false,
				showNoPremission: false,
				groupInfo: {},
				groupMemberList: [],
				loading: false,
				hasPremisson: false,
				isInGroup: false,
				groupInfoJson:""
			}
		},
		components: {
			AccessItem
		},
		methods: {
			breakUpGroup() {
				if (this.hasPremisson) {
					this.breakPopState = true
				} else {
					this.showNoPremission = true
				}
			},
			quitGroup() {
				this.showQuitGroup = true
			},
			comfirmQuit() {
				this.loading = true
				this.$openSdk.quitGroup(this.groupInfo.groupID, (data) => {
					console.log(data);
					if (data.msg) {
						this.loading = false
						uni.$emit('quitGroup')
						this.$refs.uToast.show({
							title: 'quit success',
							type: 'success',
							url: '/pages/conversation/home',
							isTab: true
						})
					}
				})
			},
			delRecords() {
				this.showDelRecords = true
			},
			comfirmDelRed(){
				this.$u.toast('developing')
			},
			changeTop(state) {
				this.$openSdk.pinConversation(this.vuex_conversation.conversationID, state, (data) => {
					console.log(data);
				});
			},
			comfirmBreak() {
				this.$u.toast('developing')
				this.breakPopState = false
			},
			cancelBreak() {
				this.breakPopState = false
			},
			checkPremisson() {
				this.hasPremisson = this.vuex_user_info.uid === this.groupInfo.ownerId
			},
			checkIsInGroup() {
				this.isInGroup = this.vuex_group_list.findIndex(g => g.groupID === this.groupInfo.groupID) > -1
			},
			transferManagement() {
				if (this.hasPremisson) {
					uni.navigateTo({
						url: "/pages/conversation/Group/transferOwener"
					})
				} else {
					this.showNoPremission = true
				}
			},
			editNick() {
				this.$u.toast('deverloping')
				// uni.navigateTo({
				// 	url:"/pages/conversation/Group/nickInGroup"
				// })
			},
			announcementGroup() {
				if (this.hasPremisson) {
					uni.navigateTo({
						url: "/pages/conversation/Group/groupAnnouncement?content=" + JSON.stringify(this
							.groupInfo)
					})
				} else {
					this.showNoPremission = true
				}
			},
			modifyGroup() {
				uni.navigateTo({
						url: "/pages/conversation/Group/groupInfo?type=showInfo&groupInfo="+this.groupInfoJson
					})
			},
			showAll() {
				uni.navigateTo({
					url: "/pages/conversation/Group/groupMember"
				})
			},
			removeUser() {
				if (this.hasPremisson) {
					uni.navigateTo({
						url: "/pages/conversation/Group/deleteGroupMember"
					})
				} else {
					this.showNoPremission = true
				}
			},
			addUser() {
				if (this.isInGroup) {
					uni.navigateTo({
						url: "/pages/conversation/Group/launchGroup?type=add"
					})
				} else {
					this.$u.toast('you are not a member of the group')
				}
			},
			getGroupInfo() {
				const groupIdList = [this.vuex_conversation.groupID]
				this.$openSdk.getGroupsInfo(JSON.stringify(groupIdList), (data) => {
					this.groupInfoJson = data.msg
					this.groupInfo = JSON.parse(data.msg)[0]
					this.$u.vuex('vuex_group_info', this.groupInfo)
					this.checkIsInGroup()
					this.checkPremisson()
				})
			},
			getGroupMemberList() {
				this.$openSdk.getGroupMemberList(this.vuex_conversation.groupID, 0, 0, (data) => {
					const tmpArr = JSON.parse(data.msg).data
					if (tmpArr.length < 5) {
						this.groupMemberList = tmpArr
					} else {
						this.groupMemberList = tmpArr.splice(0, 4)
					}
				})
			},
			
			setGroupLisitener() {
				this.$globalEvent.addEventListener("onGroupInfoChanged", (params) => {
					const tmpData = JSON.parse(params.msg)
					if (tmpData.groupId == this.groupInfo.groupID) {
						this.groupInfo = JSON.parse(tmpData.groupInfo)
						this.$u.vuex('vuex_group_info', this.groupInfo)
					}
				});
			}
		},
		beforeMount() {
			this.setGroupLisitener()
			this.getGroupInfo()
			this.getGroupMemberList()
		}
	}
</script>

<style lang="scss">
	page {
		display: flex;

		.container {
			flex: 1;
			background-color: #e8f2ff;

			.group-head {
				display: flex;
				background-color: #FFFFFF;
				margin-top: 24rpx;
				padding: 24rpx;

				.group-info {
					display: flex;
					flex-direction: column;
					margin-left: 24rpx;

					.group-name {
						font-weight: 600;
					}

					.group-introduce {
						font-size: 22rpx;
						color: #666666;
						margin-top: 12rpx;
					}
				}
			}

			.group-menber {
				display: flex;
				background-color: #FFFFFF;
				margin-top: 24rpx;

				.menber-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					width: 100rpx;
					padding: 24rpx 0;

					&:first-child {
						margin-left: 24rpx;
					}

					&:last-child {
						width: 60rpx;
					}

					.nick {
						width: 100%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						text-align: center;
					}
				}

				.access-icon {
					margin-bottom: 36rpx;
				}
			}

			.group-access {
				margin-top: 24rpx;
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
			}

			.break-title {
				margin: 48rpx;
				line-height: 40rpx;
			}

			.break-btns {
				display: flex;
				margin-bottom: 48rpx;

				.break-btns-item {
					height: 60rpx;
					width: 192rpx;
				}
			}
		}
	}
</style>
