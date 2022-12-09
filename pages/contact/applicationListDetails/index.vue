<template>
	<view class="application_list_container">
		<custom-nav-bar :title="getTitle" />

		<u-list class="application_list">
			<u-list-item v-for="application in getRenderData" :key="getKey(application)">
				<application-item :isRecv="isRecv" :application="application" />
			</u-list-item>
		</u-list>

	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import ApplicationItem from '../applicationList/ApplicationItem.vue'
	export default {
		components: {
			CustomNavBar,
			ApplicationItem
		},
		data() {
			return {
				isGroupApplication: false,
				isRecv: false,
			};
		},
		computed: {
			getRenderData() {
				let getterKey = this.isRecv ? 'storeRecvFriendApplications' : 'storeSentFriendApplications';
				if (this.isGroupApplication) {
					getterKey = this.isRecv ? 'storeRecvGroupApplications' : 'storeSentGroupApplications'
				}
				return [...this.$store.getters[getterKey]].sort((a, b) => (a.handleResult === 0 ? -1 : 1))
			},
			getKey() {
				return (application) => {
					if (this.isGroupApplication) {
						return this.isRecv ? application.userID + application.groupID : application.groupID
					}
					return application[this.isRecv ? 'fromUserID' : 'toUserID']
				}
			},
			getTitle() {
				if (!this.isRecv) {
					return '我的申请'
				}
				return this.isGroupApplication ? '群通知' : '好友请求'
			}
		},
		onLoad(options) {
			const {
				isGroupApplication,
				isRecv
			} = options
			this.isGroupApplication = JSON.parse(isGroupApplication)
			this.isRecv = JSON.parse(isRecv)
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
	.application_list_container {
		@include colBox(false);
		height: 100vh;
		background-color: #F8F8F8;


		.application_list {
			margin-top: 24rpx;
			flex: 1;
		}


	}
</style>
