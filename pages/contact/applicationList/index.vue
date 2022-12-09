<template>
	<view class="application_list_container">
		<custom-nav-bar :title="isGroupApplication ? '群通知' : '新的好友'" />
		<view class="search_bar_wrap">
			<u-search disabled class="search_bar" shape="square"
				:placeholder="`通过${isGroupApplication ? '群' : '用户'}ID搜索添加`" :showAction="false" @click="toSearch" />
		</view>

		<u-tabs :scrollable="false" :list="tabList" @click="clickTab"></u-tabs>

		<view class="pane_row" :style="{'transform': `translateX(${isRecv? '0': '-100%' })`}">
			<view class="pane_content">
				<view class="pane_title">
					<text>{{isGroupApplication ? '群通知' : '新的好友请求'}}</text>
				</view>
				<u-list v-if="getRecvRenderData.length>0" class="application_list">
					<u-list-item v-for="application in getRecvRenderData"
						:key="application[!isGroupApplication ? 'fromUserID' : 'userID']+application.groupID">
						<application-item :isRecv="true" :application="application" />
					</u-list-item>
				</u-list>
				<u-empty v-else mode="list" />
			</view>

			<view class="pane_content">
				<view class="pane_title">
					<text>我的请求</text>
				</view>
				<u-list v-if="getSendRenderData.length>0" class="application_list">
					<u-list-item v-for="application in getSendRenderData"
						:key="application[!isGroupApplication ? 'toUserID' : 'groupID']">
						<application-item :application="application" />
					</u-list-item>
				</u-list>
				<u-empty v-else mode="list" />
			</view>
		</view>

		<view v-if="isRecv ? getRecvRenderData.length>0 : getSendRenderData.length>0" class="view_all">
			<u-button @click="previewAll" type="primary" :plain="true"
				:text="`查看全部${isGroupApplication ? '群通知' : '好友请求'}`"></u-button>
		</view>


	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		ContactMenuTypes
	} from '@/constant'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import ApplicationItem from './ApplicationItem.vue'
	export default {
		components: {
			CustomNavBar,
			ApplicationItem
		},
		data() {
			return {
				keyword: "",
				isRecv: true,
				isGroupApplication: false,
			};
		},
		computed: {
			...mapGetters(['storeRecvFriendApplications', 'storeSentFriendApplications', 'storeRecvGroupApplications',
				'storeSentGroupApplications', 'storeUnHandleFriendApplicationNum', 'storeUnHandleGroupApplicationNum'
			]),
			getRecvRenderData() {
				const tmpList = this.isGroupApplication ? this.storeRecvGroupApplications : this
					.storeRecvFriendApplications
				tmpList.sort((a, b) => (a.handleResult === 0 ? -1 : 1));
				return tmpList.slice(0, 4)
			},
			getSendRenderData() {
				const tmpList = this.isGroupApplication ? this.storeSentGroupApplications : this
					.storeSentFriendApplications
				tmpList.sort((a, b) => (a.handleResult === 0 ? -1 : 1));
				return tmpList.slice(0, 4)
			},
			tabList() {
				return [{
						name: this.isGroupApplication ? '入群申请' : '好友请求'
					},
					{
						name: '我的请求'
					}
				]
			},
		},
		onLoad(params) {
			const {
				applicationType
			} = params
			this.isGroupApplication = applicationType === ContactMenuTypes.NewGroup
		},
		methods: {
			clickTab({
				index
			}) {
				this.isRecv = index === 0
			},
			previewAll() {
				uni.navigateTo({
					url: `/pages/contact/applicationListDetails/index?isGroupApplication=${this.isGroupApplication}&isRecv=${this.isRecv}`
				})
			},
			toSearch() {
				uni.navigateTo({
					url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${this.isGroupApplication}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.application_list_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F8F8F8;

		.search_bar_wrap {
			height: 34px;
			padding: 12px 22px;
			background-color: #fff;
		}

		.u-tabs {
			background-color: #fff;
		}

		.pane_row {
			display: flex;
			transition: all 0.3s ease 0s !important;
			background-color: #fff;

			.pane_content {
				@include colBox(false);
				height: 100%;
				flex: 0 0 100%;

				.pane_title {
					font-size: 28rpx;
					color: #999;
					padding: 12rpx 44rpx;
					background-color: #F8F8F8;
				}

				.application_list {
					flex: 1;
					height: 100% !important;
				}
			}
		}

		.view_all {
			margin-top: 48rpx;

			.u-button {
				border: none;
			}
		}

	}
</style>
