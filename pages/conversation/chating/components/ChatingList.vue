<template>
	<scroll-view @click="click" id="scroll_view" :style="{height:`1px`}"
		scroll-y :scroll-into-view="scrollIntoView" upper-threshold="250"
		@scrolltoupper="scrolltoupper">
		<view id="scroll_wrap">
			<u-loadmore nomoreText="" :status="loadMoreStatus" />
			<message-item-render v-for="(item,index) in storeHistoryMessageList" :key="item.clientMsgID"
				:menuOutsideFlag="menuOutsideFlag"
				@messageItemRender="messageItemRender" :source="item" :preMessage="storeHistoryMessageList[index-1]"
				:isSender="item.sendID === storeCurrentUserID" />
			<view style="visibility: hidden;height: 12px;" id="message_bottom_item"></view>
		</view>
	</scroll-view>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from "vuex";
	import MessageItemRender from './MessageItem/index.vue'

	export default {
		name: "",
		components: {
			MessageItemRender
		},
		props: {
			menuOutsideFlag: Number,
		},
		data() {
			return {
				scrollIntoView: '',
				scrollTop: 0,
				initFlag: true,
				messageLoadState: {
					lastMinSeq: 0,
					loading: false
				},
			}
		},
		computed: {
			...mapGetters(['storeCurrentConversation', 'storeHistoryMessageList', 'storeHasMoreMessage',
				'storeCurrentUserID'
			]),
			loadMoreStatus() {
				console.log(this.storeHistoryMessageList);
				if (!this.storeHasMoreMessage) {
					return 'nomore'
				}
				return this.messageLoadState.loading ? 'loading' : 'loadmore'
			},
		},
		 watch: {
		    storeHistoryMessageList: {
		      immediate: true,
		      handler(newValue, oldValue) {
			if (newValue.length === 0) return;
			if (newValue.length > oldValue.length) {
			  setTimeout(() => {
			    this.$nextTick(() => {
			      this.scrollToAnchor(
				`auchor${newValue[newValue.length - 1].clientMsgID}`,
				false,
				true
			      );
			    });
			  }, 200);
			}
			console.log("监听到消息列表变化", newValue, oldValue);
		      },
		    },
		},
		mounted() {
			this.loadMessageList()
		},
		methods: {
			...mapActions('message', ['getHistoryMesageList']),
			messageItemRender(clientMsgID) {
				if (this.initFlag && clientMsgID === this.storeHistoryMessageList[this.storeHistoryMessageList
						.length - 1]
					.clientMsgID) {
					this.initFlag = false;
					setTimeout(() => this.scrollToAnchor(`auchor${clientMsgID}`, false, true), 200)
				}
			},
			async loadMessageList(isLoadMore = false) {
				this.messageLoadState.loading = true
				const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID
				const options = {
					conversationID: this.storeCurrentConversation.conversationID,
					userID: "",
					groupID: "",
					count: 20,
					startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
					lastMinSeq: this.messageLoadState.lastMinSeq,
				}
				try {
					const {
						emptyFlag,
						lastMinSeq
					} = await this.getHistoryMesageList(options)
					this.messageLoadState.lastMinSeq = lastMinSeq
					if (emptyFlag) {
						this.$emit('initSuccess')
					}
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
				this.$nextTick(function() {
					if (isLoadMore && lastMsgID) {
						this.scrollToAnchor(`auchor${lastMsgID}`)
					}
					this.messageLoadState.loading = false
				})
			},
			click(e) {
				this.$emit('click', e)
			},
			scrolltoupper() {
				if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
					this.loadMessageList(true)
				}
			},
			scrollToAnchor(auchor, isRecv = false, isInit = false) {
				this.$nextTick(function() {
					this.scrollIntoView = auchor
					if (isInit) {
						this.$emit('initSuccess')
					}
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	#scroll_view {
		flex: 1;

	}
</style>
