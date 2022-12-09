<template>
	<u-index-list @scrolltolower="scrolltolower" class="user_list" :style="{'height': height}" :index-list="indexList">
		<template v-for="(item,index) in itemArr">
			<u-index-item :key="index">
				<u-index-anchor class="user_anchor" :text="indexList[index]"></u-index-anchor>
				<user-item @itemClick="itemClick" @updateCheck="updateCheck"
					:checked="checkedIDList.includes(cell.userID)" :disabled="disabledIDList.includes(cell.userID)"
					:checkVisible="showCheck" v-for="cell in item" :item="cell" :key="cell.userID" />
			</u-index-item>
		</template>
	</u-index-list>
</template>

<script>
	import UserItem from "../UserItem/index.vue"
	export default {
		name: "ChooseIndexList",
		components: {
			UserItem
		},
		props: {
			height: {
				type: String,
				default: '0px'
			},
			indexList: {
				type: Array,
				default: () => []
			},
			itemArr: {
				type: Array,
				default: () => []
			},
			checkedIDList: {
				type: Array,
				default: () => []
			},
			disabledIDList: {
				type: Array,
				default: () => []
			},
			showCheck: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			};
		},
		methods: {
			itemClick(item) {
				this.$emit('itemClick', item)
			},
			updateCheck(item) {
				this.$emit('updateCheck', item)
			},
			scrolltolower() {
				this.$emit('scrolltolower')
			}
		}
	}
</script>

<style scoped lang="scss">
	.user_list {
		flex: 1;
		/deep/uni-scroll-view {
			max-height: 100% !important;
		}
	}

	.user_anchor {
		background-color: #F8F8F8 !important;
		border: none !important;
	}
</style>
