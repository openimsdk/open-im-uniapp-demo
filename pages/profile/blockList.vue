<template>
	<view id="blockList">
		<uni-nav-bar left-icon="back" title="Address book blacklist" @clickLeft="goBack"></uni-nav-bar>
		<view class="list">
			<view class="list-item" v-for="item in list">
				<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
					mode="" class="portrait"></image>
				<view class="listItemMain">
					<text class="name">{{item.uid.length>10?item.uid.slice(0,10):item.uid}}</text>
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
				})
			},
			remove(uid) {
				this.$openSdk.deleteFromBlackList(JSON.stringify(uid), (data) => {})
			},
		},
		mounted() {
			this.getList()
			this.$globalEvent.addEventListener("onBlackListDeleted",(data)=>{
				this.getList()
			})
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
