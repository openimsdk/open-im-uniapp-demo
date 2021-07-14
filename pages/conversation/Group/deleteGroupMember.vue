<template>
	<view class="container">
		<u-navbar title="Chat members">
			<view class="right-title" slot="right">
				<u-button type="primary" size="mini" @click="deleteMember">delete</u-button>
			</view>
		</u-navbar>
		<u-search shape="square" :show-action="false" bg-color="#e9f2ff" class="searchInput" @change="search" @clear="clearSearch"
			placeholder="search" v-model="searchVal"/>
		<uni-indexed-list :showIndex="false" @click="clickItem" :showSelect="true" :options="friendList"/>
		
		<u-modal v-model="showModal" @confirm="comfirmAction" :show-title="false" confirm-text="determine" show-cancel-button cancel-text="cancel" content="Are you sure you want to delete?"></u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default{
		data(){
			return{
				showIndex:true,
				showModal:false,
				searchVal:"",
				friendList:[
					{
						letter: "Group members",
						data: []
					}
				],
				selectList:[],
				filterList:[]
			}
		},
		methods:{
			clickItem(data){
				this.selectList = data.select
			},
			search(val){
				if(val===""){
					this.showIndex = true
					// this.friendList[0].letter = "#"
					this.friendList[0].data = this.filterList
				}else{
					this.showIndex = false
					const newArr = []
					// this.friendList[0].letter = "contacts"
					this.friendList[0].data.forEach(v=>{
						if(v.nickName.indexOf(val)>-1) newArr.push(v)
					})
					this.friendList[0].data = newArr
				}
			},
			deleteMember(){
				this.showModal = true
			},
			comfirmAction(){
				if(this.selectList.length===0) return false
				const userList = this.selectList.map(u=>u.name.userId)
				console.log(userList);
				console.log(this.vuex_conversation.groupID);
				this.$openSdk.kickGroupMember(this.vuex_conversation.groupID,'',JSON.stringify(userList),(data)=>{
					console.log(data);
					if(data.msg&&JSON.parse(data.msg)[0].uid===userList[0]){
						this.$refs.uToast.show({
											title: 'kicked success',
											type: 'success',
											back: true
										})
					}
				})
			},
			clearSearch(){
				
			},
			getList(){
				this.$openSdk.getGroupMemberList(this.vuex_conversation.groupID,0,0,(data)=>{
					let tmpArr = JSON.parse(data.msg).data
					this.filterList = tmpArr.filter(v=>{
						if(v.nickName==="") v.nickName = v.userId
						if(v.userId!==this.vuex_group_info.ownerId) return v
					})
					this.friendList[0].data = this.filterList
				})
			},
		},
		beforeMount() {
			this.getList()
		},
	}
</script>

<style lang="scss">
	page{
		display: flex;
		.container{
			flex: 1;
			// background-color: #f0f2f5;
			.right-title{
				margin-right: 24rpx;
			}
			.searchInput{
				padding: 24rpx 0;
				// background-color: #e9f2ff;
				/deep/.u-content{
					border-radius: 0 !important;
					background-color: #e8f2ff !important;
					height: 78rpx !important;
				}
			}
			// .uni-indexed-list{
			// 	background-color: #f0f2f5;
			// 	/deep/.uni-indexed-list__item{
			// 		background-color: #f0f2f5;
			// 	}
			// }
		}
	}
</style>
