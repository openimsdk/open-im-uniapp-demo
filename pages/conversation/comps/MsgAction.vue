<template>
	<view v-show="showAcition" :class="{'top-action':isTop,'bottom-action':!isTop}" class="msg-actions">
		<view v-if="msgItem.contentType==101" @click="copyMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_copy.png" />
			<text>copy</text>
		</view>
		<view @click="deleteMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_del.png" />
			<text>delete</text>
		</view>
		<view v-if="msgItem.contentType!=103" @click="forwardMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_share.png" />
			<text>forward</text>
		</view>
		<view v-if="from===0" @click="withdrawMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_withdraw.png" />
			<text>withdraw</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		props: {
			showAcition: Boolean,
			isTop: Boolean,
			msgItem: Object,
			from: Number
		},
		methods: {
			copyMsg() {
				let _this = this
				uni.setClipboardData({
					data: this.msgItem.content,
					success: () => {
						uni.hideToast()
						_this.$u.toast("copy")
					}
				});
			},
			deleteMsg() {
				let _this = this
				this.$openSdk.deleteMessageFromLocalStorage(JSON.stringify(this.msgItem), (data) => {
					if (data.msg === "") {
						const params = {
							positionId: _this.msgItem.positionId
						}
						this.msgItem.isDelete = true
						uni.$emit("deleteMsg", params)
					}
				})
			},
			forwardMsg() {
				this.$u.toast("forwardMsg developing")
				// this.$openSdk.createForwardMessage()
			},
			withdrawMsg() {
				// this.$openSdk.revokeMessage(JSON.stringify(this.msgItem),(data)=>{
				// 	if(data.msg===""){
				// 		const params = {
				// 			positionId:_this.msgItem.positionId,
				// 			isRevoke:true
				// 		}
				// 		uni.$emit("deleteMsg",{positionId:params})
				// 	}
				// })
				this.$u.toast("withdrawMsg developing")
			}
		},
	}
</script>

<style lang="scss">
	.bottom-action {
		bottom: -90rpx;
		z-index: 9;
		position: absolute;
		display: flex;
		background-color: #666666;
		border-radius: 8rpx;

		.action-item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 20rpx;
			color: #FFFFFF;
			margin: 12rpx;

			.action-icon {
				margin-bottom: 4rpx;
				width: 28rpx;
				height: 28rpx;
			}
		}

		&::after {
			content: '';
			border: 7px solid;
			border-color: transparent transparent #666666 transparent;
			position: absolute;
			top: -14px;
			left: 7px
		}
	}

	// .top-action{
	// 	top: -67px;
	// 	&::after{
	// 		bottom: -14px;
	// 		border-color: #666666 transparent transparent transparent;
	// 	}
	// }
	.top-action {
		position: absolute;
		top:  -92rpx;
		display: flex;
		background-color: #666666;
		border-radius: 8rpx;

		.action-item {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 20rpx;
			// font-weight: 100;
			color: #FFFFFF;
			margin: 12rpx;

			.action-icon {
				margin-bottom: 4rpx;
				width: 28rpx;
				height: 28rpx;
			}
		}

		&::after {
			content: '';
			border: 7px solid;
			border-color: #666666 transparent transparent transparent;
			position: absolute;
			bottom: -14px;
			left: 7px
		}
	}
</style>
