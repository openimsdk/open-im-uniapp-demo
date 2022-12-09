<template>
	<view class="details_container">
		<custom-nav-bar title="更多资料" />

		<view class="info_list">
			<user-info-row-item class="info_item" lable="头像" arrow>
				<my-avatar :src="sourceInfo.faceURL" :desc="sourceInfo.nickname" size="42" />
			</user-info-row-item>
			<user-info-row-item class="info_item" lable="昵称" arrow>
				<text class="right_content">{{sourceInfo.nickname}}</text>
			</user-info-row-item>
			<user-info-row-item class="info_item" lable="性别" arrow>
				<text class="right_content">{{getGender}}</text>
			</user-info-row-item>
			<user-info-row-item class="info_item" lable="生日" arrow>
				<text class="right_content">{{getBirthStr}}</text>
			</user-info-row-item>
			<user-info-row-item class="info_item" lable="手机号码" arrow>
				<text class="right_content">{{sourceInfo.phoneNumber || '-'}}</text>
			</user-info-row-item>
			<user-info-row-item class="info_item" lable="邮箱" arrow>
				<text class="right_content">{{sourceInfo.email || '-'}}</text>
			</user-info-row-item>
		</view>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import UserInfoRowItem from '../userCard/components/UserInfoRowItem.vue'
	export default {
		components: {
			CustomNavBar,
			MyAvatar,
			UserInfoRowItem
		},
		data() {
			return {
				sourceInfo: {}
			};
		},
		computed: {
			getGender() {
				if (this.sourceInfo.gender === 1) {
					return '男'
				}
				if (this.sourceInfo.gender === 2) {
					return '女'
				}
				return '保密'
			},
			getBirthStr() {
				return this.sourceInfo.birth ? dayjs(this.sourceInfo.birth).format("YYYY-MM-DD") : '-'
			}
		},
		onLoad(options) {
			const {
				sourceInfo
			} = options
			this.sourceInfo = JSON.parse(sourceInfo)
		}
	}
</script>

<style lang="scss" scoped>
	.details_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F6F6F6;

		.info_list {
			margin-top: 24rpx;

			.info_item {
				background-color: #fff;
				border-bottom: 1px solid rgba(153, 153, 153, 0.3);

				.right_content {
					color: #999;
				}
			}
		}


	}
</style>
