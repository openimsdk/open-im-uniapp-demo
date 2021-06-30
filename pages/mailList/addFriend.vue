<template>
	<view id="addFriend">
		<uni-nav-bar left-icon="back" title="Add friends" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<u-search action-text="search" class="my-search" disabled shape="square" @click="goInput" />
			<view class="myUid"> <text>My Account: </text> <text
					class="uidValue">{{ this.$store.state.userInfo[0].uid}}</text> </view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noUser: false
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			goInput() {
				uni.navigateTo({
					url: '/pages/mailList/addFriendInput'
				});
			},

		}
	}
</script>

<style lang="scss" scoped>
	#addFriend {
		.main {
			display: flex;
			flex-direction: column;
			align-items: center;

			.searchInput {
				width: 580rpx;
				height: 82rpx;
				background-color: #E8F2FF;
				border-radius: 8rpx;
				margin-top: 50rpx;
				background-image: url(../../static/search2.png);
				background-size: 36rpx 36rpx;
				background-repeat: no-repeat;
				background-position: 20rpx 50%;
				padding-left: 76rpx;
				padding-right: 20rpx;
			}

			.my-search {
				padding: 50rpx 20rpx 0 76rpx;

				/deep/.u-action {
					overflow: inherit;
				}
			}

			.myUid {
				font-size: 30rpx;
				font-weight: 400;
				color: #666666;
				width: 82%;
				display: flex;
				margin-top: 32rpx;

				.uidValue {
					word-wrap: break-word;
					flex: 1;
					width: 0;
				}

			}

		}
	}
</style>
