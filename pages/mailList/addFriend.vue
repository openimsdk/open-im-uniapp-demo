<template>
	<view id="addFriend">
		<uni-nav-bar left-icon="back" title="Add friends" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<u-search action-text="search" placeholder="please enter the account number" class="my-search" disabled shape="square" @click="goInput" />
			<view class="myUid">
				<text>My Account: {{ this.$store.state.userInfo[0].uid}}</text>
			</view>
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
			// align-items: center;

			.my-search {
				padding: 50rpx 48rpx;

				/deep/.u-action {
					overflow: inherit;
				}
			}

			.myUid {
				font-size: 30rpx;
				font-weight: 400;
				color: #666666;
				justify-content: center;
				display: flex;
				text{
					word-wrap: break-word;
				}

			}

		}
	}
</style>
