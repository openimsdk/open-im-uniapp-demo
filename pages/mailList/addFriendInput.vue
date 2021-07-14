<template>
	<view id="addFriendInput">
		<view class="head">
			<u-search bg-color="#fff" action-text="cancel" @custom="goBack" class="my-search" v-model="searchValue" focus clearabled :placeholder="`Please enter the ${target} number`" shape="square" @change="noUser = false"/>
		</view>
		<view class="searchResult" @click="searchFriend" v-show="searchValue.length>0 && !noUser">
			<image src="../../static/searchFriend.png" mode="" class="searchFriend"></image>
			<text class="searchFriendTitle">search:</text>
			<text class="searchFriendValue">{{searchValue}}</text>
		</view>
		<view class="searchResult2" v-show="noUser">
			<text class="noUserTitle">{{`The ${target} does not exist`}}</text>
		</view>
	</view>
</template>

<script>
	let _this = null
	export default {
		data() {
			return {
				searchValue: "",
				noUser: false,
				userInfo: "",
				target:"user"
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			eliminateValue() {
				this.searchValue = ""
			},
			searchFriend() {
				const reqData = [this.searchValue]
				if(this.target === "user"){
					this.$openSdk.getUsersInfo(JSON.stringify(reqData), data => {
						if (data.msg === '[]') {
							this.noUser = true
						} else {
							this.noUser= false
							uni.navigateTo({
								url: '/pages/mailList/addFriendDetail?userInfo=' + data.msg
							});
						}
					})
				}else{
					this.$openSdk.getGroupsInfo(JSON.stringify(reqData), data => {
						if (data.msg === '[]') {
							this.noUser = true
						} else {
							this.noUser= false
							uni.navigateTo({
								url: '/pages/conversation/Group/groupInfo?type=searchShow&groupInfo=' + data.msg
							});
						}
					})
				}
			},
		},
		onLoad:function(options){
			if(options.from === "group"){
				this.target = "group"
			}
		}
	}
</script>

<style lang="scss" scoped>
	#addFriendInput {
		.head {
			.my-search{
				padding:24rpx;
				background-color: #e9f2ff;
				
			}

			.eliminate {
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				top: 36%;
				left: 72%;
			}

			.cancel {
				font-size: 36rpx;
				font-weight: 600;
				color: #1B72EC;
				margin-left: 34rpx;
			}
		}

		.searchResult {
			width: 750rpx;
			height: 120rpx;
			background: #E8F2FF;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 32rpx;

			.searchFriend {
				width: 60rpx;
				height: 60rpx;
				flex-shrink: 0;
				margin-left: 44rpx;
			}

			.searchFriendTitle {
				flex-shrink: 0;
				margin-left: 20rpx;
			}

			.searchFriendValue {
				word-wrap: break-word;
				flex: 1;
				width: 0;
				margin-left: 20rpx;
				margin-right: 30rpx;
			}


		}

		.searchResult2 {
			width: 750rpx;
			height: 152rpx;
			background: #E8F2FF;
			display: flex;
			align-items: center;
			justify-content: center;

			.noUserTitle {
				font-size: 32rpx;
				font-weight: 500;
				color: #666666;
			}
		}

	}
</style>
