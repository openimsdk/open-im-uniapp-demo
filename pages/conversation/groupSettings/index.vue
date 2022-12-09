<template>
	<view class="group_settings_container">
		<custom-nav-bar title="聊天设置" />
		<view class="group_settings_content">
			<view class="setting_row info_row">
				<view class="group_avatar" @click="updateGroupAvatar">
					<my-avatar :src="storeCurrentConversation.faceURL" :isGroup="true" size="48" />
					<image v-if="isOwner || isAdmin" class="edit_icon" src="static/images/group_setting_edit.png" alt="">
				</view>
				<text class="group_name">{{storeCurrentConversation.showName}}</text>
				<text>({{storeCurrentGroup.memberCount}})</text>
			</view>

			<group-member-row :isNomal="!isAdmin&&!isOwner" :groupID="storeCurrentConversation.groupID"
				:memberCount="storeCurrentGroup.memberCount" />

			<view class="setting_row">
				<setting-item @click="toUpdateGroupName" title="群聊名称">
					<text class="sub_title">{{storeCurrentConversation.showName}}</text>
				</setting-item>
				<setting-item title="群类型" :arrow="false">
					<text class="sub_title">{{getGroupTypeStr}}</text>
				</setting-item>
				<setting-item @click="toTransfer" title="群主管理权转让" />
				<setting-item @click="toUpdatePage" title="我在群里的昵称" :border="false">
					<text class="sub_title">{{storeCurrentMemberInGroup.nickname}}</text>
				</setting-item>
			</view>

			<view class="setting_row">
				<setting-item @click="toGroupQr" title="群二维码" :border="false">
					<image style="margin-right: 6rpx;width: 18px;height: 18px;" src="@/static/images/group_setting_qrcode.png" alt="">
				</setting-item>
			</view>

			<view class="setting_row">
				<setting-item title="群ID号" :arrow="false" :border="false">
					<text class="sub_title">{{storeCurrentConversation.groupID}}</text>
				</setting-item>
			</view>

			<view class="setting_row">
				<setting-item title="消息免打扰" :loading="switchLoading.opt" @switch="changeOpt($event,2)"
					:switchValue="storeCurrentConversation.recvMsgOpt === 2" :is_switch="true" />
				<setting-item title="屏蔽消息" :loading="switchLoading.opt" @switch="changeOpt($event,1)"
					:switchValue="storeCurrentConversation.recvMsgOpt === 1" :is_switch="true" />
				<setting-item title="聊天置顶" :loading="switchLoading.pin" @switch="changePin"
					:switchValue="storeCurrentConversation.isPinned" :is_switch="true" />
				<setting-item @click="()=>confirmType = 'Clear'" title="清空聊天记录" :border="false" />
			</view>

			<view class="bottom_action">
				<u-button @click="()=>confirmType = isOwner ? 'Dismiss' : 'Quit' " type="error" plain
					:text="isOwner ? '解散群聊' : '退出群聊'">
				</u-button>
			</view>

			<u-modal :content="getConfirmContent" asyncClose :show="confirmType!==null" showCancelButton
				@confirm="confirm" @cancel="() => confirmType = null"></u-modal>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	import {
		OptType,
		GroupMemberRole,
		GroupType,
		GroupMemberListTypes
	} from '@/constant'
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import SettingItem from '@/components/SettingItem/index.vue'
	import GroupMemberRow from './components/GroupMemberRow.vue'

	const ConfirmTypes = {
		Clear: 'Clear',
		Dismiss: 'Dismiss',
		Quit: 'Quit'
	}

	export default {
		components: {
			CustomNavBar,
			MyAvatar,
			SettingItem,
			GroupMemberRow,
		},
		props: {

		},
		data() {
			return {
				confirmType: null,
				switchLoading: {
					pin: false,
					opt: false,
					mute: false,
				},
			};
		},
		computed: {
			...mapGetters(['storeCurrentConversation', 'storeCurrentMemberInGroup', 'storeCurrentGroup']),
			getConfirmContent() {
				if (this.confirmType === ConfirmTypes.Clear) {
					return '确定要清空聊天记录吗？'
				}
				if (this.confirmType === ConfirmTypes.Quit) {
					return '确定要退出当前群聊吗？'
				}
				if (this.confirmType === ConfirmTypes.Dismiss) {
					return '确定要解散当前群聊吗？'
				}
				return ''
			},
			isOwner() {
				return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Owner
			},
			isAdmin() {
				return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Admin
			},
			getGroupTypeStr() {
				return this.storeCurrentGroup.groupType === GroupType.NomalGroup ? '普通群' : '工作群'
			}
		},
		methods: {
			toTransfer() {
				if (!this.isAdmin && !this.isOwner) {
					return;
				}
				uni.navigateTo({
					url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Transfer}&groupID=${this.storeCurrentGroup.groupID}`
				})
			},
			toUpdatePage() {
				uni.navigateTo({
					url: `/pages/conversation/updateGroupOrNickname/index?sourceInfo=${JSON.stringify(this.storeCurrentMemberInGroup)}`
				})
			},
			toUpdateGroupName() {
				if (!this.isAdmin && !this.isOwner) {
					return;
				}

				uni.navigateTo({
					url: `/pages/conversation/updateGroupOrNickname/index?sourceInfo=${JSON.stringify(this.storeCurrentGroup)}`
				})
			},
			toGroupQr() {
				uni.navigateTo({
					url: `/pages/common/userOrGroupQrCode/index?sourceInfo=${JSON.stringify(this.storeCurrentGroup)}`
				})
			},
			updateGroupAvatar() {
				if (!this.isAdmin && !this.isOwner) {
					return;
				}

				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success({
						tempFilePaths
					}) {
						IMSDK.IMApi.uploadFile(IMSDK.uuidv4(), getPurePath(tempFilePaths[0]))
					}
				})
			},
			changePin(isPin) {
				this.switchLoading.pin = true
				IMSDK.compatibleAPI(IMSDK.IMMethods.PinConversation, IMSDK.uuidv4(), this.storeCurrentConversation
						.conversationID, isPin)
					.then(() => uni.$u.toast('操作成功')).catch(() => uni.$u.toast('操作失败'))
					.finally(() => this.switchLoading.pin = false)
			},
			changeOpt(notNomal, type) {
				this.switchLoading.opt = true
				IMSDK.compatibleAPI(IMSDK.IMMethods.SetConversationRecvMessageOpt, IMSDK.uuidv4(), [this
						.storeCurrentConversation
						.conversationID
					], notNomal ? type : OptType.Nomal)
					.then(() => uni.$u.toast('操作成功')).catch(() => uni.$u.toast('操作失败'))
					.finally(() => this.switchLoading.opt = false)
			},
			confirm() {
				let funcName = ''
				if (this.confirmType === ConfirmTypes.Clear) {
					funcName = IMSDK.IMMethods.ClearGroupHistoryMessageFromLocalAndSvr
				}
				if (this.confirmType === ConfirmTypes.Quit) {
					funcName = IMSDK.IMMethods.QuitGroup
				}
				if (this.confirmType === ConfirmTypes.Dismiss) {
					funcName = IMSDK.IMMethods.DismissGroup
				}
				IMSDK.compatibleAPI(funcName, IMSDK.uuidv4(), this
						.storeCurrentConversation
						.groupID).then(() => {
						uni.$u.toast('操作成功');
						if (this.confirmType === ConfirmTypes.Clear) {
							this.$store.commit('message/SET_HISTORY_MESSAGE_LIST', []);
							this.$store.commit('message/SET_PREVIEW_IMAGE_LIST', []);
						} else {
							setTimeout(() => uni.switchTab({
								url: '/pages/conversation/conversationList/index'
							}), 250)
						}
					}).catch(() => uni.$u.toast('操作失败'))
					.finally(() => this.confirmType = null)
			},


			uploadSuccessHandler({
				data
			}) {
				console.log(data);
				IMSDK.compatibleAPI(IMSDK.IMMethods.SetGroupInfo, IMSDK.uuidv4(), this.storeCurrentConversation.groupID, {
					faceURL: data
				}).then(() => uni.$u.toast('修改成功')).catch(() => uni.$u.toast('修改失败'))
			},
			uploadFailedHandler() {
				uni.$u.toast('上传失败')
			},

			setUploadListener() {
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileSuccess, uploadSuccessHandler)
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileFailed, uploadFailedHandler)
			},
			disposeUploadListener() {
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileSuccess, uploadSuccessHandler)
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileFailed, uploadFailedHandler)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.group_settings_container {
		@include colBox(false);
		height: 100vh;
		background-color: #f6f6f6;

		.group_settings_content {
			overflow-y: auto;
		}

		.setting_row {
			background-color: #fff;
			margin: 24rpx 0;

			.sub_title {
				@include nomalEllipsis();
				max-width: 300rpx;
				font-size: 28rpx;
				color: #999;
			}

			&:nth-child(1) {
				margin-top: 12rpx;
			}
		}

		.info_row {
			@include vCenterBox();
			padding: 36rpx 44rpx;

			.group_avatar {
				margin-right: 36rpx;
				position: relative;

				.edit_icon {
					position: absolute;
					right: 0;
					bottom: 0;
					width: 11px;
					height: 11px;
				}
			}

			.group_name {
				@include nomalEllipsis();
				max-width: 480rpx;
				margin-right: 24rpx;
			}
		}

		.bottom_action {
			margin: 84rpx 0;

			.u-button {
				border: none;
			}
		}
	}
</style>
