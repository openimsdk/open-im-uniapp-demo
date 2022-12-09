<template>
	<view class="request_join_container">
		<custom-nav-bar :title="isGroup?'群聊验证':'好友验证'">
			<view class="top_right_btn" slot="more">
				<u-button @click="sendRequest" text="发送" type="primary"></u-button>
			</view>
		</custom-nav-bar>

		<text class="title">{{`发送${isGroup?'入群':'好友'}申请`}}</text>

		<view class="input_container">
			<u--textarea height="120" v-model="reason" border="none" placeholder="请输入内容" maxlength="200" count>
			</u--textarea>
		</view>
	</view>
</template>

<script>
	import {
		GroupJoinSource
	} from "@/constant"
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import {
		navigateToDesignatedConversation
	} from "@/util/imCommon";

	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				reason: "",
				sourceID: '',
				isGroup: false,
				isScan: false,
			};
		},
		onLoad(options) {
			const {
				isGroup,
				sourceID,
				isScan,
			} = options
			this.isGroup = JSON.parse(isGroup);
			this.isScan = JSON.parse(isScan);
			this.sourceID = sourceID
		},
		methods: {
			sendRequest() {
				let func
				if (this.isGroup) {
					const joinSource = this.isScan ? GroupJoinSource.QrCode : GroupJoinSource.Search
					func = IMSDK.compatibleAPI(IMSDK.IMMethods.JoinGroup, IMSDK.uuidv4(), this.sourceID, this.reason,
						joinSource)
				} else {
					func = IMSDK.compatibleAPI(IMSDK.IMMethods.AddFriend, IMSDK.uuidv4(), {
						toUserID: this.sourceID,
						reqMsg: this.reason
					})
				}
				func.then(() => {
					uni.$u.toast('发送成功')
					setTimeout(() => uni.navigateBack(), 1000)
				}).catch(() => uni.$u.toast('发送失败'))
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
	.request_join_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F6F6F6;

		.top_right_btn {
			margin-right: 44rpx;

			.u-button {
				height: 48rpx;
			}
		}

		.title {
			font-size: 28rpx;
			color: #999;
			margin: 24rpx 44rpx;
		}

		.input_container {
			/deep/.u-textarea {
				padding: 24rpx 44rpx !important;
			}
		}

	}
</style>
