<template>
	<view class="choose_container">
		<custom-nav-bar title="默认头像" />
	
		<view class="avatar_row">
			<view @click="clickItem(idx)" v-for="(item,idx) in avatarList" :key="idx" class="avatar_item">
				<u--image radius="6" height="68" width="68" :showLoading="true" :src="item"></u--image>
			</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import avatars from '@/common/defaultAvatars';
	
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				avatarList: [...Object.values(avatars)]
			};
		},
		methods: {
			clickItem(idx) {
				const keys = [...Object.keys(avatars)]
				let pages = getCurrentPages()
				let prevPage = pages[pages.length - 2]
				prevPage.$vm.getDefaultAvatar(keys[idx])
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss">
.choose_container {
		@include colBox(false);
		height: 100vh;

		.avatar_row {
			width: calc(100% - 88rpx);
			margin:  44rpx;
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			.avatar_item {
				display: flex;
				justify-content: center;
				flex: 0 0 25%;
				margin-bottom: 22px;
			}
		}
	}
</style>
