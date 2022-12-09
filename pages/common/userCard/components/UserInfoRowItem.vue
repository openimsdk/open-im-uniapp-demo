<template>
	<view @click="click" class="row_item" :class="{'arrow_right':arrow}">
		<view class="title">
			<text>{{lable}}</text>
		</view>
		<view class="content">
			<text>{{content}}</text>
		</view>
		<slot>
			<u-icon v-if="arrow" name="arrow-right" color="#999" size="20"></u-icon>
		</slot>
	</view>
</template>

<script>
	export default {
		name: "",
		components: {},
		props: {
			lable: String,
			content: String,
			arrow: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		},
		methods: {
			click(){
				this.$emit('click')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.row_item {
		@include vCenterBox();
		padding: 24rpx 44rpx;

	}
	
	.title {
		margin-right: 24rpx;
	}

	.arrow_right {
		justify-content: space-between;
	}
</style>
