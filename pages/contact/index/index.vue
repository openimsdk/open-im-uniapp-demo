<template>
	<view class="contact_container">
		<custom-nav-bar>
			<view class="contact_title" slot="left">
				<text>通讯录</text>
			</view>
			<view class="contact_action" slot="more">
				<view class="search_icon">
					<image src="@/static/images/common_search.png" alt="" srcset="">
				</view>
				<view @click="contactAddClick" class="">
					<image src="@/static/images/common_circle_add.png" alt="" srcset="">
				</view>
			</view>
		</custom-nav-bar>

		<contact-menus />

		<view class="list_title">
			<text>
				常用联系人
			</text>
		</view>

		<u-list class="user_list" height="1">
			<u-list-item v-for="user in frequentContacts" :key="user.userID">
				<user-item @itemClick="userClick" :item="user" />
			</u-list-item>
		</u-list>
	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import ContactMenus from './components/ContactMenus.vue'
	import UserItem from "@/components/UserItem/index.vue"
	export default {
		components: {
			CustomNavBar,
			ContactMenus,
			UserItem
		},
		data() {
			return {
				frequentContacts: []
			};
		},
		methods: {
			contactAddClick() {
				uni.navigateTo({
					url: "/pages/contact/contactAdd/index"
				})
			},
			userClick(item) {
				uni.navigateTo({
					url: `/pages/common/userCard/index?sourceID=${item.userID}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contact_container {
		@include colBox(false);
		height: 100vh;
		background-color: #f6f6f6;

		.contact_title {
			padding-left: 44rpx;
			font-size: 44rpx;
			color: #1B72EC;
		}

		.contact_action {
			padding-right: 44rpx;
			display: flex;

			.search_icon {
				margin-right: 24rpx;
			}
			image {
				width: 24px;
				height: 24px;
			}
		}

		.list_title {
			font-size: 24rpx;
			color: #999;
			margin-left: 44rpx;
		}

		.user_list {
			flex: 1;
			margin-top: 24rpx;
			background-color: #fff;
		}
	}
</style>
