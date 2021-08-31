<template>
	<view class="">
		<uni-nav-bar left-icon="back" title="Group notification" @clickLeft="goBack"></uni-nav-bar>
		<scroll-view scroll-y class="scroll-box">
			<view v-for="(item,index) in vuex_group_application_list" :key="item.createTime" class="notice-item">
				<u-avatar :src="item.fromUserFaceURL"/>
				<view class="info-area">
					<text class="nick">{{item.fromUserNickName}}</text>
					<text class="info u-line-3">{{`Apply to join ${item.groupName} Invitation from group member`}}</text>
				</view>
				<view v-if="item.flag===0" class="btns-area">
					<u-button @click="addConfirm(item)" :hair-line="false" type="primary" size="mini">agree</u-button>
					<u-button @click="refuseAdd(item)" :hair-line="false" type="info" size="mini">refuse</u-button>
				</view>
				<view v-else class="status-area">
					<text>{{item.flag===1?"agreed":"refused"}}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				requestList:[],
				detailList:[]
			}
		},
		methods:{
			goBack() {
				uni.navigateBack()
			},
			addConfirm(item) {
				const applicationJson = JSON.stringify(item)
				const acceptReason = ""
				this.$openSdk.acceptGroupApplication(applicationJson, acceptReason, (data) => {
					console.log(data);
					if(data.msg){
						item.flag = 1
					}
				})
			},
			refuseAdd(item) {
				const applicationJson = JSON.stringify(item)
				const refuseReason = ""
				this.$openSdk.refuseGroupApplication(applicationJson,refuseReason, (data) => {
					if(data.msg){
						item.flag = -1
					}
				})
			},
		},
	}
</script>

<style lang="scss">
	.scroll-box{
		height: calc(100vh - 44px);
		.notice-item{
			display: flex;
			position: relative;
			padding: 36rpx;
			.info-area{
				flex: 3;
				margin-left: 34rpx;
				display: flex;
				flex-direction: column;
				margin-right: 24rpx;
				.nick{
					font-weight: 500;
					font-size: 32rpx;
				}
				.info{
					font-size: 24rpx;
					 overflow: hidden;
					 line-clamp: 3;
					 word-break: break-all;
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
</style>
