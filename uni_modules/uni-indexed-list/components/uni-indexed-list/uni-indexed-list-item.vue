<template>
	<view>
		<view v-if="(loaded || list.itemIndex < 15)&&isShowSection" class="uni-indexed-list__title-wrapper">
			<text v-if="list.items && list.items.length > 0" class="uni-indexed-list__title">{{ list.key }}</text>
		</view>
		<view v-if="(loaded || list.itemIndex < 15) && list.items && list.items.length > 0"
			class="uni-indexed-list__list">
			<view v-for="(item, index) in list.items" :key="index" class="uni-indexed-list__item"
				hover-class="uni-indexed-list__item--hover">
				<view class="uni-indexed-list__item-container" @click="onClick(idx, index)">
					<view class="uni-indexed-list__item-border"
						:class="{'uni-indexed-list__item-border--last':index===list.items.length-1,'uni-select-list':showSelect}">
						<view v-if="showSelect">
							<uni-icons :type="item.checked ? 'checkbox-filled' : 'circle'"
								:color="item.checked ? '#007aff' : '#aaa'" size="24" />
						</view>
						<!-- <text class="uni-indexed-list__item-content">{{ item.name }}</text> -->
						<view class="uni-indexed-list__item-content">
							<image :src="item.name.icon||item.name.faceUrl||constUrl" mode=""
								style="width: 88rpx;height: 88rpx;border-radius: 88rpx;"/>
						</view>
						<text class="uni-indexed-list__item-content">{{ item.name.comment||item.name.name||item.name.groupName||item.name.nickName }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'UniIndexedList',
		data(){
			return{
				constUrl:"https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
			}
		},
		props: {
			loaded: {
				type: Boolean,
				default: false
			},
			idx: {
				type: Number,
				default: 0
			},
			list: {
				type: Object,
				default () {
					return {}
				}
			},
			showSelect: {
				type: Boolean,
				default: false
			},
			isShowSection:{
				type:Boolean,
				default:true
			}
		},
		methods: {
			onClick(idx, index) {
				this.$emit("itemClick", {
					idx,
					index
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.uni-indexed-list__list {
		background-color: $uni-bg-color;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		border-top-style: solid;
		border-top-width: 1px;
		border-top-color: $uni-border-color;
	}

	.uni-indexed-list__item {
		font-size: $uni-font-size-lg;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.uni-indexed-list__item-container {
		padding-left: $uni-spacing-row-lg;
		flex: 1;
		position: relative;
		padding-top: 12rpx;
		/* #ifndef APP-NVUE */
		display: flex;
		box-sizing: border-box;
		/* #endif */
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		/* #ifdef H5 */
		cursor: pointer;
		/* #endif */
	}

	.uni-indexed-list__item-border {
		flex: 1;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		box-sizing: border-box;
		/* #endif */
		flex-direction: row;
		// justify-content: space-between;
		align-items: center;
		height: 50px;
		padding: $uni-spacing-row-lg;
		padding-left: 0;
		&::after{
			content: '';
			position: absolute;
			bottom: 0;
			left: 110rpx;
			border-bottom: .5px solid #bddbff;
			width: 100%;
		}
		// border-bottom-style: solid;
		// border-bottom-width: 1px;
		// border-bottom-color: $uni-border-color;
	}
	.uni-select-list{
		&::after{
			content: '';
			position: absolute;
			bottom: 0;
			left: 160rpx;
			border-bottom: .5px solid #bddbff;
			width: 100%;
		}
	}

	.uni-indexed-list__item-border--last {
		border-bottom-width: 0px;
	}

	.uni-indexed-list__item-content {
		// flex: 1;
		font-size: 14px;
		margin-left: 14rpx;
	}

	.uni-indexed-list {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.uni-indexed-list__title-wrapper {
		/* #ifndef APP-NVUE */
		display: flex;
		width: 100%;
		height: 46rpx;
		align-items: center;
		/* #endif */
		background-color: rgba(27, 114, 236, 0.12);
	}

	.uni-indexed-list__title {
		padding: 6px 12px;
		line-height: 24px;
		margin-left: 26rpx;
		font-weight: 600;
		color: #1B72EC;
		font-size: $uni-font-size-sm;
	}
</style>
