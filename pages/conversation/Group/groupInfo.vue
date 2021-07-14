<template>
	<view class="container">
		<u-navbar title="GroupInfo"/>
		<GroupCard :type="type" :info="groupInfo"/>
	</view>
</template>

<script>
	import GroupCard from './comps/GroupCard.vue'
	export default{
		data(){
			return{
				groupInfo:{},
				type:""
			}
		},
		components:{
			GroupCard
		},
		methods:{
			
		},
		onLoad:function(options){
			this.groupInfo = JSON.parse(options.groupInfo)[0]
			this.type = options.type
		}
	}
</script>

<style lang="scss">
	page{
		display: flex;
		.container{
			flex: 1;
			background-color: #e8f2ff;
		}
	}
	
</style>
