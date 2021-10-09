<template>
	<view v-show="showAcition" :class="{'top-action':isTop,'bottom-action':!isTop}" class="msg-actions">
		<view v-if="msgItem.contentType==101" @click="copyMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_copy.png" />
			<text class="action-text">复制</text>
		</view>
		<view @click="forwardMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_share.png" />
			<text class="action-text">转发</text>
		</view>
		<view @click="deleteMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_del.png" />
			<text class="action-text">删除</text>
		</view>
		<view @click="mutilCheckMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_muti.png" />
			<text class="action-text">多选</text>
		</view>
		<view v-if="from===1" @click="replyMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_reply.png" />
			<text class="action-text">回复</text>
		</view>
		<view v-show="contentTypeFilter(msgItem.contentType)" @click="downloadFile" class="action-item">
			<image class="action-icon" src="../../../static/msg_download.png" />
			<text class="action-text">下载</text>
		</view>
		<view v-if="from===0" @click="withdrawMsg" class="action-item">
			<image class="action-icon" src="../../../static/msg_withdraw.png" />
			<text class="action-text">撤回</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				forwardMsgContent:""
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
						_this.$u.toast("已复制")
					}
				});
			},
			deleteMsg() {
				this.$openSdk.deleteMessageFromLocalStorage(JSON.stringify(this.msgItem), (data) => {
					if (data.msg === "") {
						const params = {
							msgId: this.msgItem.clientMsgID,
							isRevoke:false
						}
						this.msgItem.isDelete = true
						uni.$emit("deleteMsg", params)
					}
				})
			},
			forwardMsg() {
				this.forwardMsgContent = this.$openSdk.createForwardMessage(JSON.stringify(this.msgItem))
				uni.navigateTo({
					url:'/pages/conversation/forwardMsg?msg='+this.forwardMsgContent
				})
			},
			mutilCheckMsg(){
				this.$u.toast("developing")
			},
			replyMsg(){
				this.$u.toast("developing")
				// uni.$emit("replyMsg",this.msgItem)
			},
			downloadFile(){
				this.$u.toast("developing")
			},
			withdrawMsg() {
				this.$openSdk.revokeMessage(JSON.stringify(this.msgItem),(data)=>{
					if(data.msg===""){
						const params = {
							msgId:this.msgItem.clientMsgID,
							isRevoke:true
						}
						uni.$emit("deleteMsg",params)
					}
				})
			},
			contentTypeFilter(type) {
				const msgTypeList = [ 102, 104, 105]
				return msgTypeList.indexOf(type) > -1
			},
		},
	}
</script>

<style lang="scss">
	.bottom-action {
		bottom: -112rpx;
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
			margin: 18rpx;

			.action-icon {
				margin-bottom: 8rpx;
				width: 28rpx;
				height: 28rpx;
			}
			.action-text{
				white-space:nowrap
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
		top:  -112rpx;
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
			margin: 18rpx;

			.action-icon {
				margin-bottom: 8rpx;
				width: 28rpx;
				height: 28rpx;
			}
			.action-text{
				white-space:nowrap
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
