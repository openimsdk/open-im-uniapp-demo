<template>
	<view class="page_container">
		<custom-nav-bar title="账号设置" />

		<view class="info_wrap">
			<setting-item :loading="loading" @switch="switchGlobalOpt" title="勿扰模式" :switchValue="globalOptEnable"
				:is_switch="true" />
			<setting-item @click="toBlockList" title="通讯录黑名单" />
			<!-- <setting-item title="中英文切换" /> -->
		</view>
	</view>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	import SettingItem from '@/components/SettingItem/index.vue'
	import {
		OptType
	} from '@/constant';
	export default {
		components: {
			CustomNavBar,
			MyAvatar,
			SettingItem
		},
		data() {
			return {
				loading: false
			};
		},
		computed: {
			globalOptEnable() {
				return this.$store.getters.storeSelfInfo.globalRecvMsgOpt !== OptType.Nomal
			}
		},
		methods: {
			toBlockList() {
				uni.navigateTo({
					url: '/pages/profile/blockList/index'
				})
			},
			switchGlobalOpt(flag) {
				this.loading = true
				IMSDK.compatibleAPI(IMSDK.IMMethods.SetGlobalRecvMessageOpt, IMSDK.uuidv4(), flag ? OptType.WithoutNotify :
					OptType.Nomal).finally(() => this.loading = false).catch(e => {
					uni.$u.toast('设置失败')
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_container {
		background-color: #f8f8f8;

		.info_wrap {
			background-color: #fff;
			margin-top: 24rpx;

			.qr_icon {
				width: 22px;
				height: 23px;
			}
		}
	}
</style>
