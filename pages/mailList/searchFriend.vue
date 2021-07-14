<template>
	<view id="searchFriend">
		<uni-nav-bar left-icon="back" title="Search contacts" @clickLeft="goBack"></uni-nav-bar>
		<view class="inputCon">
			<u-search action-text="search" bg-color="#e9f2ff" class="searchInput" @search="search"
				placeholder="Please Input UserId" v-model="searchVal"></u-search>
		</view>
		<view class="friendList">
			<view class="friendListItem" v-for="item in searchList">
				<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
					mode="" class="portrait"></image>
				<view class="ItemMain">
					<text>{{item.name}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				friendList: [],
				searchList: [],
				searchVal: ""
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			search() {
				console.log(this.searchList);
				this.searchList = this.friendList.filter(i => i.uid.indexOf(this.searchVal) > -1)
			}
		},
		onLoad: function(options) {
			console.log(options);
			if (options.list) this.friendList = JSON.parse(options.list)
		}
	}
</script>

<style lang="scss" scoped>
	#searchFriend {
		.inputCon {
			.searchInput {
				padding: 24px;

				/deep/.u-action {
					overflow: inherit;
				}
			}
		}

		.friendList {
			margin-top: 6rpx;
			.friendListItem {
				background-color: #fff;
				height: 146rpx;
				display: flex;
				align-items: center;
				.portrait {
					flex-shrink: 0;
					width: 92rpx;
					height: 92rpx;
					border-radius: 92rpx;
					margin-left: 44rpx;
				}
				.ItemMain {
					height: 144rpx;
					display: flex;
					align-items: center;
					width: 100%;
					margin-left: 28rpx;
					border-bottom: 1px solid #E5EBFF;
				}
			}
		}
	}
</style>
