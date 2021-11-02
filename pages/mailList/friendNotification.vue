<template>
	<view id="newFriends">
		<uni-nav-bar left-icon="back" title="新朋友" @clickLeft="goBack"></uni-nav-bar>

		<scroll-view scroll-y class="scroll-box">
			<view v-for="item in vuex_friend_application_list" :key="item.uid" class="notice-item">
				<u-avatar :src="item.icon||'../../static/user.png'"/>
				<view class="info-area">
					<text class="nick">{{item.name}}</text>
				</view>
				<view v-if="item.flag===0" class="btns-area">
					<u-button :hair-line="false" @click="addConfirm(item.uid)" type="primary" size="mini">同意</u-button>
					<u-button :hair-line="false" @click="refuseAdd(item.uid)" type="info" size="mini">拒绝</u-button>
				</view>
				<view v-else class="status-area">
					<text>{{item.flag===1?"已同意":"已拒绝"}}</text>
				</view>
			</view>
		</scroll-view>

	</view>
</template>

<script>
	let _this = null
	export default {
		data() {
			return {
				requestList: [],
				uid: ""
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			addConfirm(uid) {
				this.$openSdk.acceptFriendApplication(uid, (data) => {
					console.log(data);
				})
			},
			refuseAdd(uid) {
				this.$openSdk.refuseFriendApplication(uid, (data) => {})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.scroll-box{
		height: calc(100vh - 44px);
		.notice-item{
			display: flex;
			position: relative;
			padding: 24rpx 36rpx;
			.info-area{
				flex: 3;
				margin-left: 34rpx;
				display: flex;
				justify-content: center;
				flex-direction: column;
				margin-right: 24rpx;
				.nick{
					font-weight: 500;
					font-size: 32rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.info{
					font-size: 24rpx;
					 overflow: hidden;
					 line-clamp: 3;
					 word-break: break-word;
				}
			}
			.btns-area{
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				/deep/.u-btn{
					height: 40rpx;
					width: 94rpx;
				}
				/deep/.u-btn--info{
					background-color: #D8D8D8;
					margin-top: 18rpx;
				}
			}
			.status-area{
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				text{
					font-size: 32rpx;
					color: #999;
				}
			}
			&::after{
				content: '';
				position: absolute;
				bottom: 0;
				width: 100%;
				margin-left: 122rpx;
				height: 1px;
				background-color: #E5EBFF;
			}
		}
	}
	
	
	// #newFriends {

	// 	.requestList {
	// 		// height: 100%;
	// 		height: calc(100vh - 44px);
	// 		background-color: #fff;

	// 		.listItem {
	// 			height: 146rpx;
	// 			display: flex;
	// 			align-items: center;


	// 			.portrait {
	// 				flex-shrink: 0;
	// 				width: 90rpx;
	// 				height: 90rpx;
	// 				border-radius: 90rpx;
	// 				margin-left: 44rpx;
	// 				overflow: hidden;
	// 			}


	// 			.listItemMain {
	// 				height: 144rpx;
	// 				display: flex;
	// 				align-items: center;
	// 				// justify-content: space-between;
	// 				width: 100%;
	// 				margin-left: 28rpx;
	// 				border-bottom: 1px solid #E5EBFF;
					
						
	// 				.req-user{
	// 					flex: 1;
	// 				}

	// 					.btn-list{
	// 						display: flex;
	// 						flex: 1;
	// 						margin-left: 24rpx;
	// 						// justify-content: space-around;
	// 						.increase {
	// 							padding: 0;
	// 							margin: 0;
	// 							width: 92rpx;
	// 							height: 52rpx;
	// 							font-size: 28rpx;
	// 							font-weight: 500;
	// 							line-height: 52rpx;
	// 							margin-left: 24rpx;
	// 						}
	// 					}
					

	// 				.alreadyIncrease {
	// 					font-size: 28rpx;
	// 					font-weight: 500;
	// 					color: #666666;
	// 					margin-right: 42rpx;
	// 				}


	// 			}




	// 		}
	// 	}
	// }
</style>
