<template>
	<view class="contact_add_container">
		<custom-nav-bar title="添加" />

		<view class="desc_title">
			<text>创建和加入群聊</text>
		</view>

		<view class="action_row">
			<action-item @click="groupAction(item)" v-for="item in groupActionMenus" :action="item" :key="item.idx" />
		</view>

		<view class="desc_title">
			<text>添加好友</text>
		</view>

		<view class="action_row">
			<action-item @click="friendAction(item)" v-for="item in friendActionMenus" :action="item" :key="item.idx" />
		</view>
	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import {
		GroupType
	} from '@/constant'
	import {
		scanQrCodeResult
	} from '@/util/imCommon';
	import ActionItem from './ActionItem.vue'
	export default {
		components: {
			CustomNavBar,
			ActionItem
		},
		data() {
			return {
				groupActionMenus: [{
						idx: 0,
						title: '创建群聊',
						desc: '创建群聊，全面使用司聊',
						icon: require('static/images/contact_add_create_group.png')
					},
					{
						idx: 1,
						title: '加入群聊',
						desc: '与成员一起沟通协作',
						icon: require('static/images/contact_add_join_group.png')
					},
				],
				friendActionMenus: [{
						idx: 0,
						title: '搜索好友',
						desc: '通过ID号搜索添加',
						icon: require('static/images/contact_add_search_user.png')
					},
					{
						idx: 1,
						title: '扫一扫',
						desc: '扫描二维码名片',
						icon: require('static/images/contact_add_qr_user.png')
					},
				]
			}
		},
		methods: {
			groupAction({
				idx
			}) {
				if (idx === 0) {
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
				} else {
					uni.navigateTo({
						url: '/pages/contact/switchJoinGroup/index'
					})
				}
			},
			friendAction({
				idx
			}) {
				if (!idx) {
					uni.navigateTo({
						url: '/pages/common/searchUserOrGroup/index?isSearchGroup=false'
					})
				} else{
					uni.scanCode({
						scanType:['qrCode'],
						success: ({result}) => scanQrCodeResult(result)
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contact_add_container {
		height: 100vh;
		background-color: #F8F8F8;

		.desc_title {
			font-size: 24rpx;
			color: #999;
			padding: 24rpx 44rpx;
		}

		.action_row {
			background-color: #fff;

			.action_item:last-child {
				.bottom_line {
					height: 0;
				}
			}
		}
	}
</style>
