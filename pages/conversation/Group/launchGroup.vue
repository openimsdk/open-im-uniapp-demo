<template>
	<view class="">
		<u-navbar title-width="400" :title="title"/>
		<u-search :show-action="false" bg-color="#e9f2ff" class="searchInput" @change="search" @clear="clearSearch"
			placeholder="search" v-model="searchVal"/>
	<!-- 	<view class="no-results">
			<text>No "C" results ware found.</text>
		</view> -->
		<uni-indexed-list :showIndex="showIndex" @click="clickItem" :showSelect="true" :options="friendList"/>
		<view class="bottom-bar">
			<u-button :loading="loading" @click="comfrimAction" class="bottom-btn" type="primary" size="mini">complete{{selectLenght>0?'('+selectLenght+')':''}}</u-button>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default{
		data(){
			return{
				searchVal:"",
				title:"Launch group chat",
				Initials: ['#'],
				selectList:[],
				selectLenght:0,
				showIndex:true,
				loading:false,
				friendList:[
					{
						letter: "#",
						data: []
					}
				],
			}
		},
		methods:{
			search(val){
				if(val===""){
					this.showIndex = true
					this.friendList[0].data = this.vuex_mail_list
				}else{
					this.showIndex = false
					const newArr = []
					// this.friendList[0].letter = "contacts"
					this.friendList[0].data.forEach(v=>{
						if(v.name.indexOf(val)>-1) newArr.push(v)
					})
					this.friendList[0].data = newArr
				}
			},
			clearSearch(){
				console.log(111);
				this.showIndex = true
				this.friendList[0].data = this.vuex_mail_list
			},
			clickItem(data){
				console.log(data);
				this.selectList = data.select
				this.selectLenght = data.select.length
			},
			comfrimAction(){
				if(this.selectLenght===0) return false
				this.loading = true
				if(this.title==="Launch group chat"){
					const groupInfo = {
						groupName:"My group aaa",
						introduction:"My group introduction",
						notification:"hello,come on",
						faceUrl:"https://echat-1302656840.cos.ap-chengdu.myqcloud.com/1625728198419_IMG20210622085412.jpg"
					}
					let memberList=[]
					console.log(this.selectList);
					this.selectList.map(v=>memberList.push({uid:v.name.uid,setRole:0}))
					console.log(memberList);
					this.$openSdk.createGroup(JSON.stringify(groupInfo),JSON.stringify(memberList),(data)=>{
						if(data.msg){
							this.$refs.uToast.show({
												title: 'create success',
												type: 'success',
												back: true
											})
						}
						this.loading = false
					})
				}else{
					const userList = this.selectList.map(u=>u.name.uid)
					this.$openSdk.inviteUserToGroup(this.vuex_conversation.groupID,'',JSON.stringify(userList),(data)=>{
						console.log(data);
						if(data.msg){
							this.$refs.uToast.show({
												title: 'invite success',
												type: 'success',
												back: true
											})
						}
						this.loading = false
					})
				}
			},
			filtterData(){
				if(this.title === "Select contact"){
					this.$openSdk.getGroupMemberList(this.vuex_conversation.groupID,0,0,(data)=>{
					const groupMemberList = JSON.parse(data.msg).data
					let filterList=[];
					groupMemberList.forEach(m=>filterList.push(m.userId))
					this.friendList[0].data=this.vuex_mail_list.filter(u=>!filterList.includes(u.uid))
				})
				}else{
					this.friendList[0].data = this.vuex_mail_list
				}
			}
		},
		mounted() {
			this.filtterData()
		},
		onLoad:function(options){
			if(options.type==="add"){
				this.title = "Select contact"
			}
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
</style>
