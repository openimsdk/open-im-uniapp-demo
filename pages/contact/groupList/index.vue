<template>
	<view class="group_list_container">
		<custom-nav-bar title="我的群组">
			<view @click="toCreateGroup" class="nav_right_action" slot="more">
				<text>发起群聊</text>
			</view>
		</custom-nav-bar>
		<view class="search_bar_wrap">
			<u-search class="search_bar" shape="square" placeholder="搜索群组" :showAction="false" v-model="keyword" />
		</view>

		<u-tabs :scrollable="false" :list="tabList" @click="clickTab"></u-tabs>

		<view class="pane_row" :style="{'transform': `translateX(${isMyCreate? '0': '-100%' })`}">
			<view class="pane_content">
				<view class="pane_title">
					<text>我创建的</text>
				</view>
				<u-list v-if="getMyCreateGroupList.length >0" class="group_list">
					<u-list-item v-for="group in getMyCreateGroupList" :key="group.groupID">
						<group-item :groupInfo="group" />
					</u-list-item>
				</u-list>
				<u-empty v-else mode="list" />
			</view>

			<view class="pane_content">
				<view class="pane_title">
					<text>我加入的</text>
				</view>
				<u-list v-if="getMyJoinedGroupList.length >0" class="group_list">
					<u-list-item v-for="group in getMyJoinedGroupList" :key="group.groupID">
						<group-item :groupInfo="group" />
					</u-list-item>
				</u-list>
				<u-empty v-else mode="list" />
			</view>
		</view>



	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import GroupItem from './GroupItem.vue'
	import {
		GroupType
	} from '@/constant';
	export default {
		components: {
			CustomNavBar,
			GroupItem
		},
		data() {
			return {
				keyword: "",
				tabList: [{
						name: '我创建的'
					},
					{
						name: '我加入的'
					}
				],
				isMyCreate: true,
				indexList: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
			};
		},
		computed: {
			...mapGetters(['storeGroupList', 'storeCurrentUserID']),
			getMyCreateGroupList() {
				return this.storeGroupList.filter(group => group.ownerUserID === this.storeCurrentUserID)
			},
			getMyJoinedGroupList() {
				return this.storeGroupList.filter(group => group.ownerUserID !== this.storeCurrentUserID)
			}
		},
		mounted() {

		},
		methods: {
			clickTab({
				index
			}) {
				this.isMyCreate = index === 0
			},
			toCreateGroup() {
				uni.showActionSheet({
					itemList: ['普通群', '工作群'],
					success: ({
						tapIndex
					}) => {
						uni.navigateTo({
							url: `/pages/common/createGroup/index?type=${tapIndex ? GroupType.WorkingGroup : GroupType.NomalGroup}`
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.group_list_container {
		@include colBox(false);
		height: 100vh;

		.nav_right_action {
			padding-right: 44rpx;
		}

		.search_bar_wrap {
			height: 34px;
			padding: 12px 22px;
		}

		.pane_row {
			display: flex;
			flex: 1;
			transition: all 0.3s ease 0s !important;

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

				.group_list {
					flex: 1;
					height: 100%;
				}
			}
		}

	}
</style>
