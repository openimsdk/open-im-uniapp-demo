<template>
	<view class="headRight">
		<image src="../../static/more-operations.png" mode="" class="headIcon" @click.stop="controlDisplay">
		</image>
		<view class="my-menuCon" v-show="showOperationsMenu">
			<view class="operationsMenu">
				<view class="operationsMenu-item" @click="goAddFriend">
					<image src="../../static/addFriend.png" mode="" class="itemImg"></image>
					<text>添加朋友</text>
				</view>
				<view class="operationsMenu-item" @click="launchGroup">
					<image src="../../static/launch_group.png" mode="" class="itemImg"></image>
					<text>发起群聊</text>
				</view>
				<view class="operationsMenu-item" @click="addNewGroup">
					<image src="../../static/add_new_group.png" mode="" class="itemImg"></image>
					<text>添加群聊</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"HeaderModal",
		data() {
			return {
				
			};
		},
		props:{
			showOperationsMenu:Boolean,
		},
		methods:{
			goAddFriend() {
				uni.navigateTo({
					url: "/pages/mailList/addFriend",
				});
			},
			launchGroup(){
				uni.navigateTo({
					url:"/pages/conversation/Group/launchGroup?type=launch"
				})
			},
			addNewGroup(){
				uni.navigateTo({
					url:"/pages/mailList/addFriend?from=group"
				})
			},
			controlDisplay(){
				this.$emit('controlDisplay')
			}
		}
	}
</script>

<style lang="scss">
	.headRight {
		.headIcon {
			width: 48rpx;
			height: 48rpx;
			margin-right: 40rpx;
		}
	
		.my-menuCon {
			z-index: 99;
			position: absolute;
			top: 86rpx;
			right: 1.5%;
			display: flex;
			flex-direction: column;
	
			&::after {
				content: "";
				position: absolute;
				top: -36rpx;
				right: 36rpx;
				border: 20rpx solid;
				border-color: transparent transparent #1b72ec transparent;
			}
	
			.operationsMenu {
				background-color: #1b72ec;
				box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.5);
				border-radius: 18rpx;
				padding: 24rpx;
	
				.operationsMenu-item {
					display: flex;
					align-items: center;
					font-size: 30rpx;
					font-weight: 600;
					color: #ffffff;
	
					&:nth-child(2){
						padding: 24rpx 0;
					}
					
					.itemImg {
						width: 36rpx;
						height: 36rpx;
						margin-right: 24rpx;
					}
				}
			}
		}
	}
</style>
