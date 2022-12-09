<template>
	<view class="contact_choose_container">
		<custom-nav-bar title="联系人" />

		<view class="search_bar_wrap">
			<u-search shape="square" placeholder="搜索" :showAction="false" v-model="keyword" />
		</view>

		<view class="tab_container">
			<view class="tabs_bar">
				<template v-for="item in tabs">
					<view @click="tabChange(item.idx)" :key="item.idx" v-if="!(!showGroup && item.idx === 1)"
						class="tab_item">
						<image :src="activeTab === item.idx ? item.activeIcon : item.icon" alt="">
							<text>{{item.title}}</text>
					</view>
				</template>
			</view>

			<view class="tab_pane" v-show="activeTab === 0">
				<choose-index-list @itemClick="userClick" @updateCheck="updateCheckedUser" :height="getListHeight"
					:indexList="getChooseData.indexList" :itemArr="getChooseData.dataList"
					:checkedIDList="checkedUserIDList" :showCheck="showCheck" />
			</view>

			<view class="tab_pane" v-show="activeTab === 1 && showGroup">
				<u-list class="member_list" :style="{height: getListHeight}">
					<u-list-item v-for="item in storeGroupList" :key="item.groupID">
						<user-item @updateCheck="updateCheckedGroup"
							:checked="checkedGroupIDList.includes(item.groupID)"
							:item="item"
							:checkVisible="showCheck" />
					</u-list-item>
				</u-list>
			</view>

			<choose-index-footer :comfirmLoading="comfirmLoading" v-if="showCheck"
				@removeItem="updateCheckedUserOrGroup" @confirm="confirm" :choosedData="getCheckedInfo" />
		</view>

		<u-modal :show="showConfirmModal" showCancelButton asyncClose @confirm="modalConfirm"
			@cancel="()=>showConfirmModal=false" :content='`确定要发送${cardInfo.nickname}的名片吗？`' />
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		ContactChooseTypes,
		GroupStatus,
		PageEvents,
		SessionType
	} from '@/constant'
	import {
		formatChooseData,
		toastWithCallback
	} from '@/util/common'
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import UserItem from '@/components/UserItem/index.vue'
	import ChooseIndexList from "@/components/ChooseIndexList/index.vue"
	import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue"

	const showGroupTypes = [
		ContactChooseTypes.ForWard,
		ContactChooseTypes.MergeForWard,
		ContactChooseTypes.ShareCard
	]

	export default {
		components: {
			CustomNavBar,
			UserItem,
			ChooseIndexList,
			ChooseIndexFooter
		},
		data() {
			return {
				keyword: "",
				type: ContactChooseTypes.Card,
				activeTab: 0,
				showConfirmModal: false,
				groupID: '',
				cardInfo: {},
				forwardMessage: '',
				checkedUserIDList: [],
				checkedGroupIDList: [],
				comfirmLoading: false,
				tabs: [{
						idx: 0,
						title: '按好友选',
						icon: require("static/images/contact_choose_friend.png"),
						activeIcon: require("static/images/contact_choose_friend_active.png"),
					},
					{
						idx: 1,
						title: '按群聊选',
						icon: require("static/images/contact_choose_group.png"),
						activeIcon: require("static/images/contact_choose_group_active.png"),
					},
				]
			};
		},
		computed: {
			...mapGetters(['storeFriendList', 'storeGroupList', 'storeCurrentConversation', 'storeCurrentUserID']),
			getListHeight() {
				const statusBar = uni.getWindowInfo().statusBarHeight
				return (uni.getWindowInfo().safeArea.height - statusBar - 58 - 97 - (this.showCheck ? 72 : 0) - 44) + 'px'
			},
			showCheck() {
				return this.type !== ContactChooseTypes.Card
			},
			showGroup() {
				return showGroupTypes.includes(this.type)
			},
			getChooseData() {
				return formatChooseData(this.storeFriendList)
			},
			getCheckedInfo() {
				const checkedFriends = this.storeFriendList.filter(friend => this.checkedUserIDList.includes(friend
					.userID))
				const checkedGroups = this.storeGroupList.filter(group => this.checkedGroupIDList.includes(group.groupID))
				return [...checkedFriends, ...checkedGroups]
			},
		},
		onLoad(options) {
			const {
				groupID,
				type,
				cardInfo,
				forwardMessage,
				checkedUserIDList,
				checkedGroupIDList
			} = options
			this.type = type;
			this.groupID = groupID;
			this.cardInfo = cardInfo ? JSON.parse(cardInfo) : {};
			this.forwardMessage = forwardMessage || '';
			this.checkedUserIDList = checkedUserIDList ? JSON.parse(checkedUserIDList) : [];
			this.checkedGroupIDList = checkedGroupIDList ? JSON.parse(checkedGroupIDList) : [];
		},
		methods: {
			tabChange(idx) {
				this.activeTab = idx
			},
			updateCheckedUserOrGroup(item) {
				if (item.userID) {
					this.updateCheckedUser(item)
				} else {
					this.updateCheckedGroup(item)
				}
			},
			updateCheckedUser({
				userID
			}) {
				if (this.checkedUserIDList.includes(userID)) {
					const idx = this.checkedUserIDList.findIndex(item => item === userID)
					const tmpArr = [...this.checkedUserIDList]
					tmpArr.splice(idx, 1)
					this.checkedUserIDList = [...tmpArr]
				} else {
					this.checkedUserIDList = [...this.checkedUserIDList, userID]
				}
			},
			updateCheckedGroup({
				groupID
			}) {
				if (this.checkedGroupIDList.includes(groupID)) {
					const idx = this.checkedGroupIDList.findIndex(item => item === groupID)
					const tmpArr = [...this.checkedGroupIDList]
					tmpArr.splice(idx, 1)
					this.checkedGroupIDList = [...tmpArr]
				} else {
					this.checkedGroupIDList = [...this.checkedGroupIDList, groupID]
				}
			},
			userClick(item) {
				this.cardInfo = {
					...item
				};
				this.showConfirmModal = true;
			},
			confirm() {
				this.comfirmLoading = true
				if (this.type === ContactChooseTypes.GetList) {
					let pages = getCurrentPages()
					let prevPage = pages[pages.length - 2]
					prevPage.$vm.getCheckedUsers(this.getCheckedInfo)
					this.comfirmLoading = false

					uni.navigateBack({
						delta: 1
					})
					return;
				}


				if (this.type === ContactChooseTypes.Invite) {
					IMSDK.compatibleAPI(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuidv4(), this.groupID, '', this
							.getCheckedInfo.map(user => user.userID))
						.then(() => {
							toastWithCallback('操作成功', () => uni.navigateBack());
							this.comfirmLoading = false
						}).catch(() => toastWithCallback('操作失败'));
					return;
				}

				this.getCheckedInfo.map(item => {
					let message = '';

					if (this.type === ContactChooseTypes.ForWard) {
						message = IMSDK.IMApi.createForwardMessage(IMSDK.uuidv4(), this.forwardMessage)
					}

					if (this.type === ContactChooseTypes.ShareCard) {
						message = IMSDK.IMApi.createCardMessage(IMSDK.uuidv4(), this.cardInfo)
					}

					IMSDK.IMApi.sendMessage(IMSDK.uuidv4(), message, item
						.userID ?? "",
						item.groupID ?? "", IMSDK.offlinePushInfo)
				})
				uni.$emit(PageEvents.MutipleCheckUpdate, false)
				toastWithCallback('转发成功', () => uni.navigateBack())
				this.comfirmLoading = false
			},
			modalConfirm() {
				const message = IMSDK.IMApi.createCardMessage(IMSDK.uuidv4(), this.cardInfo)
				const parsedMessage = JSON.parse(message)
				this.$store.dispatch('message/pushNewMessage', parsedMessage)
				IMSDK.IMApi.sendMessage(IMSDK.uuidv4(), message, this.storeCurrentConversation
					.userID, this.storeCurrentConversation.groupID, IMSDK.offlinePushInfo);
				this.$nextTick(() => uni.$emit(PageEvents.ScrollToBottom, parsedMessage.clientMsgID))
				toastWithCallback('发送成功', () => uni.navigateBack())
				this.showConfirmModal = false
			},
		},
	}
</script>

<style lang="scss" scoped>
	.contact_choose_container {
		.search_bar_wrap {
			height: 34px;
			padding: 12px 22px;
		}

		.tab_container {
			@include colBox(false);
			overflow: hidden;

			.tabs_bar {
				@include vCenterBox();
				justify-content: space-evenly;

				.tab_item {
					@include colBox(false);
					align-items: center;

					image {
						width: 50px;
						height: 50px;
					}
				}
			}

			.tab_pane {
				flex: 1;
				margin-top: 24px;

				.member_list {
					/deep/uni-scroll-view {
						max-height: 100% !important;
					}
				}

				.member_anchor {
					background-color: #F8F8F8 !important;
					border: none !important;
				}
			}
		}
	}
</style>
