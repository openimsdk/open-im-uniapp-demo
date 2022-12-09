<template>
	<view class="page_container">
		<custom-nav-bar title="我的信息" />

		<view class="info_wrap">
			<info-item :loading="loadingState.faceURL" @click="updateAvatar" title="头像">
				<my-avatar :src="selfInfo.faceURL" :desc="selfInfo.nickname" size="42" slot="value" />
			</info-item>
			<info-item @click="updateNickname" title="昵称" :content="selfInfo.nickname" />
			<info-item :loading="loadingState.gender" @click="updateGender" title="性别" :content="getGender" />
			<info-item :loading="loadingState.birth" @click="()=> showDatePicker = true" title="生日"
				:content="getBirth" />
			<info-item :showArrow="false" title="手机号码" :content="selfInfo.phoneNumber||'-'" />
			<info-item :showArrow="false" title="邮箱" :content="selfInfo.email || '-'" />
			<info-item @click="toQrCode" title="二维码名片">
				<image slot="value" class="qr_icon" src="@/static/images/self_info_qr.png" mode=""></image>
			</info-item>
			<info-item :showArrow="false" @click="copyID" title="ID" :content="selfInfo.userID" />
		</view>

		<u-datetime-picker :minDate="0" :maxDate="nowDate" :show="showDatePicker" @confirm="confirmDate"
			@cancel="()=>showDatePicker = false" v-model="selfInfo.birth" mode="date" />
	</view>
</template>

<script>
	import {
		businessInfoUpdate
	} from '@/api/login'
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import dayjs from 'dayjs';
	import InfoItem from './InfoItem.vue'
	import {
		getPurePath
	} from '../../../util/common';
	export default {
		components: {
			CustomNavBar,
			MyAvatar,
			InfoItem
		},
		data() {
			return {
				showDatePicker: false,
				loadingState: {
					faceURL: false,
					gender: false,
					birth: false,
				},
				nowDate: Date.now()
			};
		},
		computed: {
			selfInfo() {
				return this.$store.getters.storeSelfInfo
			},
			getGender() {
				if (this.selfInfo.gender === 0) {
					return '保密'
				}
				if (this.selfInfo.gender === 1) {
					return '男'
				}
				return '女'
			},
			getBirth() {
				const birth = this.selfInfo.birth
				return birth ? dayjs(birth * 1000).format('YYYY-MM-DD') : '-'
			}
		},
		onLoad() {
			this.setUploadListener();
		},
		onUnload() {
			this.disposeUploadListener();
		},
		methods: {
			updateNickname() {
				uni.navigateTo({
					url: `/pages/common/markOrIDPage/index?isSelfNickname=true&sourceInfo=${JSON.stringify(this.selfInfo)}`
				})
			},
			updateGender() {
				uni.showActionSheet({
					itemList: ['男', '女'],
					success: async ({
						tapIndex
					}) => {
						this.loadingState.gender = true
						await this.updateSelfInfo({
							gender: tapIndex + 1
						}, 'gender')
					}
				})
			},
			updateAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: ({
						tempFilePaths
					}) => {
						this.loadingState.faceURL = true
						IMSDK.IMApi.uploadFile(IMSDK.uuidv4(), getPurePath(tempFilePaths[0]))
					}
				})
			},
			toQrCode() {
				uni.navigateTo({
					url: `/pages/common/userOrGroupQrCode/index`
				})
			},
			copyID() {
				uni.setClipboardData({
					data: this.selfInfo.userID,
					success: () => {
						uni.hideToast();
						this.$nextTick(() => {
							uni.$u.toast('复制成功');
						})
					}
				});
			},
			async updateSelfInfo(data, key) {
				try {
					await businessInfoUpdate({
						userID: this.selfInfo.userID,
						...data,
					})
					await this.$store.dispatch('user/updateBusinessInfo')
					uni.$u.toast('修改成功')
				} catch (e) {
					uni.$u.toast('修改失败')
				}
				this.loadingState[key] = false
			},
			confirmDate({
				value
			}) {
				this.loadingState.birth = true
				this.updateSelfInfo({
					birth: value / 1000
				}, 'birth')
				this.showDatePicker = false
			},


			uploadSuccessHandler({
				data
			}) {
				console.log(data);
				this.updateSelfInfo({
					faceURL: data
				}, 'faceURL')
			},
			uploadFailedHandler() {
				uni.$u.toast('上传失败')
			},
			// uploadProgressHandler({progress,operationID}) {
			// 	console.log('uploadProgressHandler:::');
			// 	console.log(progress,operationID);
			// },
			setUploadListener() {
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileSuccess, this.uploadSuccessHandler)
				IMSDK.subscribe(IMSDK.IMEvents.UploadFileFailed, this.uploadFailedHandler)
				// IMSDK.subscribe(IMSDK.IMEvents.UploadFileProgress,this.uploadProgressHandler)
			},
			disposeUploadListener() {
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileSuccess, this.uploadSuccessHandler)
				IMSDK.unsubscribe(IMSDK.IMEvents.UploadFileFailed, this.uploadFailedHandler)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page_container {
		background-color: #f8f8f8;

		.info_wrap {
			background-color: #fff;
			margin-top: 24rpx;

			.qr_icon {
				width: 22px;
				height: 23px;
			}
		}
	}
</style>
