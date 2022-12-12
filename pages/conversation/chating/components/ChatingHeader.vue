<template>
	<u-navbar @click="click" placeholder class="chating_header">
		<view @click="routeBack" class="u-nav-slot" slot="left">
			<img class="back_icon" width="12" height="20" src="static/images/common_left_arrow.png" alt="" srcset="">
		</view>
		<view class="u-nav-slot" slot="center">
			<view class="chating_info" :class="{'chating_info_single':isSingle}">
				<view class="conversation_info">
					<view class="title">{{storeCurrentConversation.showName}}</view>
					<view v-if="!isSingle" class="sub_title">{{groupMemberCount}}
					</view>
				</view>
				<view v-if="isSingle" class="online_state">
					<view class="dot" :style="{backgroundColor:isOnline ? '#10CC64' : '#999'}" />
					<view class="online_str">{{onlineStr}}</view>
				</view>
			</view>

		</view>
		<view class="u-nav-slot" slot="right">
			<view class="right_action">
				<img @click="routeCall" class="action_item" width="23" height="23" src="static/images/common_call.png"
					alt="" srcset="">
				<u-icon @click="goSetting" class="action_item" name="more-dot-fill" size="23" color="#333">
				</u-icon>
			</view>
		</view>
	</u-navbar>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from "vuex";
	import {
		GroupAtType,
		SessionType,
	} from '@/constant'
	import {
		getDesignatedUserOnlineState,
	} from '@/util/imCommon'
	import IMSDK from '@/util/compatibleIM'
	export default {
		name: 'ChatingHeader',
		data() {
			return {
				isOnline: false,
				isTyping: false,
				onlineStr: '离线',
			}
		},
		computed: {
			...mapGetters(['storeCurrentConversation', 'storeCurrentGroup']),
			isSingle() {
				return this.storeCurrentConversation.conversationType === SessionType.Single
			},
			groupMemberCount() {
				return `(${this.storeCurrentGroup?.memberCount??0})`
			},
		},
		  mounted() {
		    this.getOnlineState();
		},
		methods: {
			click(e) {
				this.$emit('click', e)
			},
			routeBack() {
				uni.navigateBack()
			},
			goSetting() {
				const url = this.isSingle ? '/pages/conversation/singleSettings/index' :
					'/pages/conversation/groupSettings/index'
				uni.navigateTo({
					url
				})
			},
			routeCall() {

			},
			async getOnlineState() {
				getDesignatedUserOnlineState(this.storeCurrentConversation.userID).then((str) => {
					console.log('getOnlineState', str);
					this.isOnline = str !== '离线'
					this.onlineStr = str
				}).catch((err) => {
					console.log(err);
					this.isOnline = false
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.chating_header {
		/deep/ .u-navbar__content__left {
			padding: 0;
		}

		.back_icon {
			padding: 24rpx;
			margin-left: 20rpx;
		}

		.chating_info {
			&_single {
				margin-bottom: 24rpx;
			}

			.conversation_info {
				@include vCenterBox();

				.title {
					@include nomalEllipsis();
					max-width: 280rpx;
				}

				.sub_title {
					margin-left: 8rpx;
				}
			}



			.online_state {
				@include vCenterBox();
				flex-direction: row;
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				font-size: 24rpx;
				color: #999;

				.dot {
					background-color: #10CC64;
					width: 12rpx;
					height: 12rpx;
					border-radius: 50%;
					margin-right: 12rpx;
				}

				.online_str {
					@include nomalEllipsis();
					max-width: 280rpx;
				}
			}
		}

		/deep/ .u-navbar__content__right {
			padding: 0;
		}

		.right_action {
			@include vCenterBox();
			flex-direction: row;
			margin-right: 24rpx;

			.action_item {
				padding: 12rpx;
			}

			.u-icon {
				margin-left: 12rpx;
			}
		}
	}
</style>
