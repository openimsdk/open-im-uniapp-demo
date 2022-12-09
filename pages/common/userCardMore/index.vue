<template>
	<view class="user_more_container">
		<custom-nav-bar title="资料设置" />

		<view class="info_row">
			<user-info-row-item @click="toMark" lable="备注" arrow />
			<user-info-row-item @click="toMore" lable="更多资料" arrow />
		</view>

		<view class="info_row">
			<user-info-row-item lable="加入黑名单" arrow>
				<u-switch asyncChange :loading="blackLoading" size="20" :value="isBlacked" @change="change"></u-switch>
			</user-info-row-item>
		</view>

		<view class="info_row">
			<u-button @click="()=>showConfirm=true" type="error" plain text="解除好友关系"></u-button>
		</view>
		<u-toast ref="uToast"></u-toast>
		<u-modal :content="`确定要解除与${sourceInfo.nickname}的好友关系吗？`" asyncClose :show="showConfirm" showCancelButton
		 @confirm="confirmRemove" @cancel="() => showConfirm = false"></u-modal>
	</view>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import UserInfoRowItem from '../userCard/components/UserInfoRowItem.vue'
	import {
		ContactChooseTypes
	} from '@/constant';
	export default {
		components: {
			CustomNavBar,
			UserInfoRowItem
		},
		data() {
			return {
				blackLoading: false,
				sourceInfo: {},
				showConfirm: false,
			};
		},
		computed: {
			isBlacked() {
				return this.$store.getters.storeBlackList.findIndex(black => black.userID === this.sourceInfo.userID) !== -
					1
			}
		},
		onLoad(options) {
			const {
				sourceInfo
			} = options;
			this.sourceInfo = JSON.parse(sourceInfo)
		},
		methods: {
			change(isBlack) {
				this.blackLoading = true
				const funcName = isBlack ? IMSDK.IMMethods.AddBlack : IMSDK.IMMethods.RemoveBlack
				IMSDK.compatibleAPI(funcName, IMSDK.uuidv4(), this.sourceInfo.userID)
					.catch(() => this.showToast('操作失败')).finally(() => this.blackLoading = false)
			},
			confirmRemove() {
				IMSDK.compatibleAPI(IMSDK.IMMethods.DeleteFriend, IMSDK.uuidv4(), this.sourceInfo.userID)
					.then(() => this.showToast('操作成功')).catch(() => this.showToast('操作失败')).finally(() => this
						.showConfirm = false)
			},
			toMore() {
				uni.navigateTo({
					url: `/pages/common/detailsFileds/index?sourceInfo=${JSON.stringify(this.sourceInfo)}`
				})
			},
			toMark() {
				uni.navigateTo({
					url: `/pages/common/markOrIDPage/index?isRemark=true&sourceInfo=${JSON.stringify(this.sourceInfo)}`
				})
			},
			showToast(message) {
				this.$refs.uToast.show({
					message
				})
			}
		}
	}
</script>

<style lang="scss">
	.user_more_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F6F6F6;

		.info_row {
			background-color: #fff;
			margin-top: 24rpx;

			.u-button {
				border: none;
			}
		}
	}
</style>
