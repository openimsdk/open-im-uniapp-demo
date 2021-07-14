<template>
	<view class="container">
		<u-navbar title-width="400" :title="`Edit group ${type}`">
			<view class="right-title" slot="right">
				<u-button size="mini" :hair-line="false" @click="changeGroupInfo">Submit</u-button>
			</view>
		</u-navbar>
		<u-input v-if="type==='name'" v-model="groupInfo.groupName" class="input-group-name" placeholder="please input group name" height="88"/>
		<u-input v-else v-model="groupInfo.introduction" class="input-group-introduction" type="textarea" placeholder="please input group introduction"/>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				groupInfo:{},
				type:"name"
			}
		},
		methods:{
			changeGroupInfo(){
				this.$openSdk.setGroupInfo(JSON.stringify(this.groupInfo),(data)=>{
					console.log(data);
					if(data.msg){
						this.$u.toast('update success!')
					}
					uni.navigateBack()
				})
			}
		},
		onLoad:function(options){
			if(options.type) this.type= options.type
		},
		beforeMount() {
			this.groupInfo = this.vuex_group_info
		}
	}
</script>

<style lang="scss">
	page{
		display: flex;
		.container{
			flex: 1;
			background-color: #ebf2ff;
			.right-title{
				margin-right: 24rpx;
				/deep/.u-btn{
					font-size: 32rpx;
					border: none;
					color: #333 !important;
					background-color: #FFFFFF !important;
				}
			}
			.input-group-name{
				background-color: #FFFFFF;
				margin-top: 24rpx;
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
				padding: 0 24rpx !important;
			}
			.input-group-introduction{
				background-color: #FFFFFF;
				box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
				height: 612rpx;
				width: 90%;
				border-radius: 12rpx;
				margin: 24rpx auto;
				/deep/.u-input__textarea{
					padding: 24rpx;
				}
			}
		}
	}
</style>
