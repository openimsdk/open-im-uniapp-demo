<template>
	<view class="conversation_container">
		<chat-header ref="chatHeaderRef" />
		<view class="conversation_search">
			<u-search @click="toSearch" disabled :showAction="false" shape="square"></u-search>
		</view>
		<u-swipe-action ref="swipeWrapperRef" class="swipe_wrapper">
			<u-list class="conversation_list" :height="1">
				<u-list-item v-for="item in storeConversationList" :key="item.conversationID">
					<conversation-item @closeAllSwipe="closeAllSwipe" :source="item" />
				</u-list-item>
			</u-list>
		</u-swipe-action>
	</view>
</template>

<script>
	import {
		mapGetters,
	} from "vuex";
	import IMSDK from '@/util/compatibleIM'
	import ChatHeader from './components/ChatHeader.vue'
	import ConversationItem from './components/ConversationItem.vue'

	const ConversationMenus = {
		Pin: 'Pin',
		Remove: 'Remove',
		MarkRead: 'MarkRead'
	}

	export default {
		components: {
			ChatHeader,
			ConversationItem
		},
		data() {
			return {
				
			};
		},
		computed: {
			...mapGetters(['storeConversationList']),
		},
		onReady() {
			this.$nextTick(() => plus.navigator.closeSplashscreen())
		},
		onPullDownRefresh() {
			this.refreshConversationList();
		},
		methods: {
			toSearch() {

			},
			closeAllSwipe() {
				this.$refs.swipeWrapperRef.closeAll();
			},
			async refreshConversationList() {
				await this.$store.dispatch('conversation/getConversationList')
				uni.stopPullDownRefresh();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.conversation_container {
		@include colBox(false);
		height: 100vh;
		overflow-y: hidden;
	}

	.conversation_search {
		padding: 24rpx 44rpx;
	}

	.swipe_wrapper {
		@include colBox(false);
		flex: 1;
		width: 100%;
		overflow-y: auto;
	}

	.conversation_list {
		flex: 1;
		width: 100%;
		// position: relative;
		// z-index: -1;
	}

	/deep/.u-swipe-action-item__right__button__wrapper__text {
		-webkit-line-clamp: 2 !important;
		max-width: 32px;
	}
</style>
