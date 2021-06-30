<template>
	<view id="newFriends">
		<uni-nav-bar left-icon="back" title="new friends" @clickLeft="goBack"></uni-nav-bar>

		<view class="requestList">
			<view class="listItem" v-for="item in requestList">
				<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
					mode="" class="portrait"></image>
				<view class="listItemMain">
					<text>{{item.uid.length>20?item.uid.slice(0,20) + "...":item.uid}} </text>
					<button type="primary" class="increase" v-show="item.flag==0"
						@click="addConfirm(item.uid)">agree</button>
					<text class="alreadyIncrease" v-show="item.flag==1">agreed</text>
				</view>
			</view>
		</view>

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
			getList() {
				this.$openSdk.getFriendApplicationList((data) => {
					this.requestList = JSON.parse(data.msg)
				})
			},
			addConfirm(uid) {
				this.$openSdk.acceptFriendApplication(JSON.stringify(uid), (data) => {})
			},
			refuseAdd(uid) {
				this.$openSdk.refuseFriendApplication(JSON.stringify(uid), (data) => {
					if (data.msg === "") {
						this.$u.toast("refused")
					}
				})
			},
			frrendListener() {
				this.$globalEvent.addEventListener(
					"onFriendApplicationListAccept",
					(params) => {
						this.$u.toast("add success")
						this.getList()
					}
				);
				this.$globalEvent.addEventListener(
					"onFriendApplicationListReject",
					(params) => {
						this.$u.toast("refused")
						this.getList()
						// console.log(params);
					}
				);
			}
		},

		onLoad: function(options) {
			if (options.list) {
				this.requestList = JSON.parse(options.list)
			}
		},
		beforeMount() {
			this.frrendListener()
		},
		mounted() {
			_this = this
			this.getList()
		}
	}
</script>

<style lang="scss" scoped>
	#newFriends {

		.requestList {
			height: 100%;
			background-color: #fff;

			.listItem {
				height: 146rpx;
				display: flex;
				align-items: center;


				.portrait {
					flex-shrink: 0;
					width: 90rpx;
					height: 90rpx;
					border-radius: 90rpx;
					margin-left: 44rpx;
				}


				.listItemMain {
					height: 144rpx;
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					margin-left: 28rpx;
					border-bottom: 1px solid #E5EBFF;

					.increase {
						padding: 0;
						margin: 0;
						width: 92rpx;
						height: 52rpx;
						font-size: 28rpx;
						font-weight: 500;
						line-height: 52rpx;
						margin-right: 42rpx;
					}

					.alreadyIncrease {
						font-size: 28rpx;
						font-weight: 500;
						color: #666666;
						margin-right: 42rpx;
					}


				}




			}
		}
	}
</style>
