<template>
	<view class="mark_id_container">
		<custom-nav-bar :title="getTitle" />

		<view class="content_row">
			<u-input :disabled="!isRemark&&!isSelfNickname" v-model="content" disabledColor="transparent" maxlength="20"
				placeholder="请输入内容" border="bottom" clearable>
				<template slot="suffix">
					<u-button :loading="loading" @click="saveOrCopy" type="primary" :text="getConfirmText" />
				</template>
			</u-input>
		</view>
	</view>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'

	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	export default {
		components: {
			CustomNavBar
		},
		props: {

		},
		data() {
			return {
				content: '',
				isRemark: false,
				isSelfNickname: false,
				sourceInfo: {},
				loading: false
			};
		},
		computed: {
			getTitle() {
				if (this.isRemark) {
					return '设置备注'
				}
				if (this.isSelfNickname) {
					return '修改昵称'
				}
				return 'ID号'
			},
			getConfirmText() {
				return (this.isRemark || this.isSelfNickname) ? '保存' : '复制'
			}
		},
		onLoad(options) {
			const {
				isRemark,
				isSelfNickname,
				sourceInfo
			} = options;
			this.sourceInfo = JSON.parse(sourceInfo)
			this.isRemark = !!isRemark
			if (this.isRemark) {
				this.content = this.sourceInfo.remark
			}
			this.isSelfNickname = !!isSelfNickname
			if (this.isSelfNickname) {
				this.content = this.sourceInfo.nickname
			}
		},
		methods: {
			saveOrCopy() {
				if (this.isRemark) {
					this.loading = true
					IMSDK.compatibleAPI(IMSDK.IMMethods.SetFriendRemark, IMSDK.uuidv4(), {
							toUserID: this.sourceInfo.userID,
							remark: this.content
						}).then(() => {
							uni.$u.toast('设置成功')
							setTimeout(() => uni.navigateBack(), 1000)
						}).catch(() => uni.$u.toast('设置失败'))
						.finally(() => this.loading = false)

				} else if (this.isSelfNickname) {
					this.loading = true
					IMSDK.compatibleAPI(IMSDK.IMMethods.SetSelfInfo, IMSDK.uuidv4(), {
							nickname: this.content
						}).then(() => {
							uni.$u.toast('修改成功')
							setTimeout(() => uni.navigateBack(), 1000)
						}).catch(() => uni.$u.toast('设置失败'))
						.finally(() => this.loading = false)
				} else {
					uni.setClipboardData({
						data: this.sourceInfo.userID,
						success: () => {
							uni.hideToast();
							this.$nextTick(() => {
								uni.$u.toast('复制成功');
							})
						}
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mark_id_container {
		@include colBox(false);
		height: 100vh;

		.content_row {
			margin-top: 96rpx;
			margin: 72rpx 44rpx 0;

			.u-button {
				height: 60rpx;
			}
		}
	}
</style>
