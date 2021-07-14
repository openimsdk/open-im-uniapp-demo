<template>
	<view class="">
		<u-navbar title="Chat members"/>
		<u-search height="88" shape="square" :show-action="false" bg-color="#fff" class="searchInput" @change="search" @clear="clearSearch"
			placeholder="search" v-model="searchVal"/>
			
		<view class="group-members">
				<view v-for="item in groupMemberList" class="menber-item">
					<u-avatar size="84" :src="item.faceUrl||'../../../static/user.png'"/>
					<view class="nick">{{item.nickName||'nick'}}</view>
				</view>
				<view class="menber-item access-icon">
					<u-avatar size="68" src="../../../static/add_group.png"/>
				</view>
				<view class="menber-item access-icon">
					<u-avatar size="68" src="../../../static/remove_group.png"/>
				</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				searchVal:"",
				groupMemberList:[]
			}
		},
		methods:{
			clearSearch(){
				
			},
			search(){
				
			},
			getGroupList(){
				this.$openSdk.getGroupMemberList(this.vuex_conversation.groupID,0,0,(data)=>{
					this.groupMemberList = JSON.parse(data.msg).data
				})
			},
		},
		beforeMount() {
			this.getGroupList()
		}
	}
</script>

<style lang="scss">
	.searchInput{
		margin-top: 24rpx !important;
		background-color: #FFFFFF;
		border-bottom: 1px solid #909399;
		/deep/.u-content{
			.u-icon__icon{
				font-size: 44rpx !important;
				color: grey !important;
			}
			.u-input{
				font-size: 36rpx;
			}
		}
	}
	.group-members{
		display: flex;
		flex-wrap: wrap;
		padding: 12rpx;
		.menber-item{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 116rpx;
			padding: 24rpx 0;
			.nick{
				width: 100%;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				text-align: center;
			}
		}
		.access-icon{
			margin-bottom: 36rpx;
		}
	}
</style>
