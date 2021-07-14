<template>
	<view @click="clickItem" class="access-item">
		<text>{{title}}</text>
		<u-icon v-if="!isSwitch" color="#999" size="36" name="arrow-right"/>
		<u-switch v-else size="36" v-model="newCheck"/>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				newCheck:this.isChecked
			}
		},
		props:{
			title:String,
			isChecked:{
				type:Boolean,
				default:false
			},
			isSwitch:{
				type:Boolean,
				default:false
			}
		},
		methods:{
			clickItem(){
				this.$emit("click",this.newCheck)
			}
		}
	}
</script>

<style lang="scss">
	.access-item{
		background-color: #FFFFFF;
		padding: 24rpx;
		font-weight: 500;
		border-bottom: .5px solid #eaeaea;
		.u-icon--right,
		.u-switch{
			float: right;
		}
		&:hover{
			background-color: #e8f2ff;
		}
	}
</style>
