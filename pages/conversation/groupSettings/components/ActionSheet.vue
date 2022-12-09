<template>
	<u-action-sheet safeAreaInsetBottom closeOnClickOverlay @close="onClose" @select="onSelect" round="24"
		:actions="joinGroupActions" :show="visible" cancelText="取消" />
</template>

<script>
	import {
		OptType,
		GroupMemberRole,
		GroupVerificationTypes
	} from '@/constant'
	import IMSDK from '@/util/compatibleIM'
	export default {
		name: "",
		components: {},
		props: {
			visible: Boolean,
			groupID: String
		},
		data() {
			return {
				joinGroupActions: [{
						name: '允许任何人加群',
						type: GroupVerificationTypes.AllNot
					},
					{
						name: '群成员邀请无需验证',
						type: GroupVerificationTypes.ApplyNeedInviteNot
					},
					{
						name: '需要发送验证消息',
						type: GroupVerificationTypes.AllNeed
					},
				]
			};
		},
		methods: {
			onClose() {
				this.$emit('update:visible', false)
			},
			onSelect({
				type
			}) {
				IMSDK.compatibleAPI(IMSDK.IMMethods.SetGroupVerification, IMSDK.uuidv4(), this.groupID, type)
					.then(() => uni.$u.toast('操作成功')).catch(() => uni.$u.toast('操作失败'))
			}
		}
	}
</script>

<style lang="scss">

</style>
