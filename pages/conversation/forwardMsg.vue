<template>
	<view>
		<u-navbar title-width="400" :title="title" />
		<u-search shape="square" :show-action="false" bg-color="#e9f2ff" class="searchInput" @change="search"
			@clear="clearSearch" placeholder="搜索" v-model="searchVal" />
		<!-- 		<view class="no-results">
			<text>No "C" results ware found.</text>
		</view> -->
		<uni-indexed-list :showIndex="false" :isShowSection="false" @click="clickItem" :options="friendList" />
		<!-- 	<view class="bottom-bar">
			<u-button :loading="loading" @click="comfrimAction" class="bottom-btn" type="primary" size="mini">complete{{selectLenght>0?'('+selectLenght+')':''}}</u-button>
		</view> -->
		<!-- <u-toast ref="uToast" /> -->
		<u-modal :async-close="true" confirm-text="发送" cancel-text="取消" :show-title="false" v-model="showModal" show-cancel-button
			@confirm="sendConfirm" @cancel="sendCancel" :content="'确认发送给'+selectUser.name+'?'" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showModal: false,
				searchVal: "",
				title: "选择",
				Initials: ['#'],
				selectList: [],
				selectLenght: 0,
				showIndex: true,
				loading: false,
				friendList: [{
					letter: "#",
					data: []
				}],
				selectUser:{},
				// content: `确认发送给<text>dsadas</text>`,
				forwardMsg: ""
			}
		},
		methods: {
			sendConfirm() {
				this.$openSdk.sendMessage(
					this.forwardMsg,
					this.selectUser.uid,
					"",
					false
				);
				this.showModal = false
				this.$u.toast('转发成功')
				uni.navigateBack()
			},
			sendCancel() {
				this.showModal = false
				this.selectUser = {}
			},
			search(val) {
				if (val === "") {
					this.showIndex = true
					this.friendList[0].data = this.vuex_original_mail_list
				} else {
					this.showIndex = false
					const newArr = []
					// this.friendList[0].letter = "contacts"
					this.friendList[0].data.forEach(v => {
						if (v.name.indexOf(val) > -1) newArr.push(v)
					})
					this.friendList[0].data = newArr
				}
			},
			clearSearch() {
				this.showIndex = true
				this.friendList[0].data = this.vuex_original_mail_list
			},
			clickItem(data) {
				this.selectUser = data.item.name
				this.showModal = true
			},
			filtterData() {
				this.friendList[0].data = this.vuex_original_mail_list
			},
		},
		mounted() {
			this.filtterData()
		},
		onLoad: function(option) {
			this.forwardMsg = option.msg
		}
	}
</script>

<style lang="scss">
	.searchInput {
		padding: 24rpx;
	}

	.uni-indexed-list {
		bottom: 96rpx;
	}

	.bottom-bar {
		position: absolute;
		bottom: 0;
		background-color: #e7f4fd;
		height: 96rpx;
		width: 100%;

		.bottom-btn {
			position: absolute;
			bottom: 24rpx;
			right: 36rpx;
		}
	}

	.list-title {
		padding: 12rpx 30rpx;
		background-color: #e9f2ff;
		// color: #e9f2ff;
	}

	.no-results {
		margin: 48rpx auto;
		display: flex;
		justify-content: center;
	}
	.slot-content{
		text-align: center;
		padding: 24rpx 0;
	}
</style>
