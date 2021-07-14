<template>
	<view class="">
		<u-navbar title-width="400" title="Group list"/>
		<u-search  shape="square" :show-action="false" bg-color="#e9f2ff" class="searchInput" @change="search" @clear="clearSearch"
			placeholder="search" v-model="searchVal"/>
		<u-empty v-if="vuex_group_list.length===0" class="empty" text="There is no group" mode="list"/>
		<uni-indexed-list :showIndex="false" :isShowSection="false" @click="clickItem" :showSelect="false" :options="groupList"/>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default{
		data(){
			return{
				searchVal:"",
				Initials: ['#'],
				showIndex:true,
				groupList:[
					{
						letter: "#",
						data: []
					}
				],
				originalList:[]
			}
		},
		methods:{
			search(val){
				if(val===""){
					this.showIndex = true
					this.groupList[0].data = this.vuex_group_list
				}else{
					this.showIndex = false
					const newArr = []
					// this.groupList[0].letter = "contacts"
					this.groupList[0].data.forEach(v=>{
						if(v.groupName.indexOf(val)>-1) newArr.push(v)
					})
					this.groupList[0].data = newArr
				}
			},
			clearSearch(){
				this.showIndex = true
				this.groupList[0].data = this.vuex_group_list
			},
			clickItem(item){
				let newItem = item.item.name
				newItem.conversationID = 'group_'+newItem.groupID
				this.$u.vuex('vuex_conversation', newItem)
				this.$u.vuex('vuex_conversation_user', newItem.uid)
				uni.navigateTo({
					url: "/pages/conversation/chatWin",
				});
			},
		},
		beforeMount() {
			this.groupList[0].data = this.vuex_group_list
		}
	}
</script>

<style lang="scss">
	.searchInput{
		padding: 24rpx;
	}
	.uni-indexed-list{
		bottom: 96rpx;
	}
	.bottom-bar{
		position: absolute;
		bottom: 0;
		background-color: #e7f4fd;
		height: 96rpx;
		width: 100%;
		.bottom-btn{
			position: absolute;
			bottom: 24rpx;
			right: 36rpx;
		}
	}
	.list-title{
		padding: 12rpx 30rpx;
		background-color: #e9f2ff;
		// color: #e9f2ff;
	}
	.no-results{
		margin: 48rpx auto;
		display: flex;
		justify-content: center;
	}
	.empty{
		padding-top: 120rpx;
	}
</style>
