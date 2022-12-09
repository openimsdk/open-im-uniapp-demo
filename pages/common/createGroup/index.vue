<template>
	<view class="create_group_container">
		<custom-nav-bar title="发起群聊" />

		<view class="group_base_info">
			<my-avatar @click="chooseImage" :isGroup="true" :src="groupFaceUrl" size="44" />
			<u--input placeholder="取个群名称方便后续搜索" border="none" v-model="groupName"></u--input>
		</view>

		<view class="member_row" @click="toChooseMember">
			<view class="desc_title">
				<text>群成员</text>
				<text>{{`${checkedMemberList.length}人`}}</text>
			</view>
			<view class="member_list">
				<view v-for="member in checkedMemberList.slice(0,5)" :key="member.userID" class="member_item">
					<my-avatar :src="member.userID" :desc="member.nickname" size="42" />
					<text class="member_name">{{member.nickname}}</text>
				</view>
			</view>
		</view>

		<view class="action_bar">
			<u-button :loading="createLoading" :disabled="disabledCreate" @click="complateCreate" type="primary"
				text="完成创建"></u-button>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		ContactChooseTypes,
		GroupMemberRole,
		GroupType,
		SessionType
	} from '@/constant'
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import {
		navigateToDesignatedConversation
	} from '@/util/imCommon'
	import {
		getPurePath
	} from '@/util/common'
	export default {
		components: {
			CustomNavBar,
			MyAvatar
		},
		data() {
			return {
				groupName: '',
				groupFaceUrl: '',
				checkedMemberList: [],
				fileList: [],
				type: GroupType.NomalGroup,
				createLoading: false,
			};
		},
		computed: {
			disabledCreate() {
				return !this.groupName || this.checkedMemberList.length === 0
			}
		},
		onLoad(options) {
			const {
				type,
				checkedMemberList
			} = options
			this.type = Number(type)
			this.checkedMemberList = checkedMemberList ? JSON.parse(checkedMemberList) : []
			this.setUploadListener()
		},
		onUnload() {
			this.disposeUploadListener()
		},
		methods: {
			uploadSuccessHandler({
				data
			}) {
				console.log(data);
				this.groupFaceUrl = data
			},
			uploadFailedHandler() {
				this.showToast('上传失败')
			},
			setUploadListener() {
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileSuccess, this.uploadSuccessHandler)
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileFailed, this.uploadFailedHandler)
			},
			disposeUploadListener() {
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileSuccess, this.uploadSuccessHandler)
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileFailed, this.uploadFailedHandler)
			},
			toChooseMember() {
				const checkedIDList = this.checkedMemberList.map(member => member.userID)
				uni.navigateTo({
					url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.GetList}&checkedUserIDList=${JSON.stringify(checkedIDList)}`
				})
			},
			complateCreate() {
				this.createLoading = true
				const baseInfo = {
					groupType: this.type,
					groupName: this.groupName,
					faceURL: this.groupFaceUrl,
				}
				const memberList = this.checkedMemberList.map(member => ({
					userID: member.userID,
					roleLevel: GroupMemberRole.Nomal
				}))
				IMSDK.compatibleAPI(IMSDK.IMMethods.CreateGroup, IMSDK.uuidv4(), baseInfo, memberList).then(({
					data
				}) => {
					this.showToast('创建成功', () => navigateToDesignatedConversation(data.groupID, this.type ===
						GroupType
						.NomalGroup ? SessionType.Group : SessionType.WorkingGroup,true));
				}).catch(() => this.showToast('创建失败')).finally(() => this.createLoading = false)
			},
			getCheckedUsers(list) {
				this.checkedMemberList = [...list]
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: function({
						tempFilePaths
					}) {
						IMSDK.IMApi.uploadFile(IMSDK.uuidv4(), getPurePath(tempFilePaths[0]))
					},
					fail: function(err) {
						this.showToast('上传失败')
					}
				})
			},
			showToast(message, complete = null) {
				this.$refs.uToast.show({
					message,
					duration: 1000,
					complete
				})
			}
		}
	}
</script>

<style lang="scss">
	.create_group_container {
		height: 100vh;
		background-color: #F6F6F6;
		position: relative;

		.group_base_info {
			@include vCenterBox();
			padding: 44rpx;
			background-color: #fff;
			margin: 36rpx 0;

			.u-input {
				margin-left: 48rpx;
			}
		}

		.member_row {
			padding: 44rpx;
			background-color: #fff;
			color: #999;

			.desc_title {
				@include vCenterBox();
				justify-content: space-between;
			}

			.member_list {
				display: flex;
				flex-wrap: wrap;
				margin-top: 24rpx;

				.member_item {
					@include colBox(false);
					align-items: center;
					margin-right: 12rpx;

					.member_name {
						@include nomalEllipsis();
						max-width: 42px;
						margin-top: 12rpx;
					}
				}
			}
		}

		.action_bar {
			width: 100%;
			position: absolute;
			bottom: 0;
		}
	}
</style>
