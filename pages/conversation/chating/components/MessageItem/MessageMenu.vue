<template>
	<view :style="{left:getLeft,right:getRight}" class="message_menu_container"
		:class="{'message_menu_container_bottom':is_bottom}">
		<view class="message_menu_item" v-for="item in menuList" v-if="item.visible" @click="menuClick(item)" :key="item.idx">
			<image :src="item.icon" alt="" srcset="">
				<text>{{item.title}}</text>
		</view>
	</view>

</template>

<script>
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	import {
		MessageMenuTypes,
		MessageType,
		ContactChooseTypes,
	} from '@/constant'
	import IMSDK from '@/util/compatibleIM'

	import copy from '@/static/images/chating_message_copy.png'
	import forward from '@/static/images/chating_message_forward.png'
	import reply from '@/static/images/chating_message_reply.png'
	import revoke from '@/static/images/chating_message_revoke.png'
	import multiple from '@/static/images/chating_message_multiple.png'
	import del from '@/static/images/chating_message_del.png'

	const canCopyTypes = [MessageType.TEXTMESSAGE, MessageType.ATTEXTMESSAGE, MessageType.ADVANCETEXTMESSAGE, MessageType
		.QUOTEMESSAGE
	]

	export default {
		components: {},
		props: {
			message: {
				type: Object
			},
			is_bottom: {
				type: Boolean,
				default: true
			},
			isSender: Boolean,
			paterWidth: Number,
		},
		data() {
			return {

			}
		},
		computed: {
			...mapGetters(['storeCurrentMemberInGroup', 'storeCurrentUserID']),
			getLeft() {
				// 145 + 145*0.2
				if (this.isSender && this.paterWidth < 174) {
					return 'auto'
				}
				if (!this.isSender && this.paterWidth < 174) {
					return '0'
				}
				return '20%'
			},
			getRight() {
				if (this.isSender && this.paterWidth < 174) {
					return '0'
				}
				return 'auto'
			},
			canRevoke() {
				return this.isSender
			},
			menuList() {
				return [{
						idx: 0,
						type: MessageMenuTypes.Copy,
						title: '复制',
						icon: copy,
						visible: canCopyTypes.includes(this.message.contentType)
					},
					{
						idx: 1,
						type: MessageMenuTypes.Del,
						title: '删除',
						icon: del,
						visible: true
					},
					{
						idx: 2,
						type: MessageMenuTypes.Forward,
						title: '转发',
						icon: forward,
						visible: true
					},
					{
						idx: 3,
						type: MessageMenuTypes.Reply,
						title: '回复',
						icon: reply,
						visible: true
					},
					{
						idx: 4,
						type: MessageMenuTypes.Revoke,
						title: '撤回',
						icon: revoke,
						visible: this.canRevoke
					},
					{
						idx: 5,
						type: MessageMenuTypes.Multiple,
						title: '多选',
						icon: multiple,
						visible: true
					},
				]
			}
		},
		mounted() {

		},
		methods: {
			...mapActions('message', ['deleteMessages', 'updateOneMessage']),
			menuClick({
				type
			}) {
				switch (type) {
					case MessageMenuTypes.Copy:
						uni.setClipboardData({
							data: this.getCopyText(),
							success: () => {
								uni.hideToast();
								this.$nextTick(() => {
									uni.$u.toast('复制成功');
								})
							}
						});
						break;
					case MessageMenuTypes.Del:
						IMSDK.compatibleAPI(IMSDK.IMMethods.DeleteMessageFromLocalAndSvr, IMSDK.uuidv4(), this.message)
							.then(() => {
								this.deleteMessages([this.message])
								uni.$u.toast('删除成功')
							}).catch(() => uni.$u.toast('删除失败'))
						break;
					case MessageMenuTypes.Forward:
						uni.navigateTo({
							url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.ForWard}&forwardMessage=${JSON.stringify(this.message)}`
						})
						break;
					case MessageMenuTypes.Multiple:
						// todo
						break;
					case MessageMenuTypes.Reply:
						this.$store.commit('message/SET_QUOTE_MESSAGE', this.message);
						break;
					case MessageMenuTypes.Revoke:
						IMSDK.compatibleAPI(IMSDK.IMMethods.NewRevokeMessage, IMSDK.uuidv4(), this.message)
							.then(() => {
								this.updateOneMessage({
									message: {
										...this.message,
										contentType: MessageType.ADVANCEREVOKEMESSAGE,
										content: JSON.stringify({
											clientMsgID: this.message.clientMsgID,
											revokeTime: Date.now(),
											revokerID: this.storeCurrentUserID,
											revokerNickname: '你',
											revokerRole: 0,
											seq: this.message.seq,
											sessionType: this.message.sessionType,
											sourceMessageSendID: this.message.sendID,
											sourceMessageSendTime: this.message.sendTime,
											sourceMessageSenderNickname: this.message.senderNickname,
										})
									}
								})
							}).catch(() => uni.$u.toast('撤回失败'))
						break;
					default:
						break;
				}
			},
			getCopyText() {
				if (this.message.contentType === MessageType.ATTEXTMESSAGE) {
					return this.message.atElem.text;
				}
				if (this.message.contentType === MessageType.QUOTEMESSAGE) {
					return this.message.quoteElem.text;
				}
				return this.message.content;
			},
		}
	}
</script>

<style scoped lang="scss">
	.message_menu_container {
		display: flex;
		flex-wrap: wrap;
		min-width: 145px;
		max-width: 145px;
		background-color: #5b5b5b;
		padding: 12px 20px;
		padding-bottom: 0;
		border-radius: 8px;
		position: absolute;
		top: -12px;
		// left: 0%;
		transform: translateY(-100%);
		z-index: 9;

		&_bottom {
			top: unset;
			transform: translateY(12px);
		}

		.message_menu_item {
			@include colBox(false);
			align-items: center;
			font-size: 12px;
			color: #fff;
			padding-right: 16px;
			padding-bottom: 12px;

			&:nth-child(4n) {
				padding-right: 0;
			}

			image {
				width: 17px;
				height: 19px;
				margin-bottom: 4px;
			}
		}
	}
</style>
