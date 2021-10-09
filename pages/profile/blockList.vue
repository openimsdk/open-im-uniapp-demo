<template>
	<view id="blockList">
		<uni-nav-bar left-icon="back" title="通讯录黑名单" @clickLeft="goBack"></uni-nav-bar>
		<view class="list">
			<view class="list-item" v-for="item in vuex_black_list">
				<image src="https://echat-1302656840.cos.ap-chengdu.myqcloud.com/1632447310193.png"
					mode="" class="portrait"></image>
				<view class="listItemMain">
					<text class="name">{{item.name}}</text>
					<button type="primary" class="remove" @click="remove(item.uid)">remove</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: []
			}
		},
		methods: {
			goBack() {
				uni.switchTab({
					url: '/pages/profile/my'
				});
			},
			getList() {
				this.$openSdk.getBlackList((data) => {
					this.list = JSON.parse(data.msg)
					console.log(this.list);
				})
			},
			remove(uid) {
				this.$openSdk.deleteFromBlackList(uid, (data) => {})
			},
		},
		mounted() {
			this.getList()
		}
	}
</script>

<style lang="scss" scoped>
	#blockList {

		.list-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 130rpx;

			.portrait {
				flex-shrink: 0;
				width: 90rpx;
				height: 90rpx;
				border-radius: 90rpx;
				margin-left: 44rpx;
			}

			.listItemMain {
				height: 130rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				margin-left: 28rpx;
				border-bottom: 1px solid #E5EBFF;

				.name {
					font-size: 28rpx;
					font-weight: 400;
					color: #333333;
				}

				.remove {
					padding: 0;
					margin: 0;
					width: 122rpx;
					height: 52rpx;
					font-size: 28rpx;
					font-weight: 500;
					line-height: 52rpx;
					margin-right: 42rpx;
				}


			}

		}




	}
</style>
