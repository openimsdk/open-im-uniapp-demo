<template>
	<view id="addFriend">
		<uni-nav-bar left-icon="back" :title="title" @clickLeft="goBack"></uni-nav-bar>
		<view class="main">
			<u-search action-text="search" :placeholder="placeholder" class="my-search" disabled shape="square" @click="goInput" />
			<view class="myUid">
				<text>My Account: {{ this.vuex_user_info[0].uid}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noUser: false,
				title:"Add friends",
				placeholder:"Please enter the account number"
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			goInput() {
				let from = "single"
				if(this.title === "Add group chat") from = "group"
				uni.navigateTo({
					url: '/pages/mailList/addFriendInput?from='+from
				});
			},

		},
		onLoad:function(options){
			if(options.from==="group"){
				this.title = "Add group chat"
				this.placeholder = "Please enter group number"
				
			}
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
