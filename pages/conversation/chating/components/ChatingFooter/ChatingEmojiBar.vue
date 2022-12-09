<template>
	<view class="chat_emoji_bar">
		<u-row class="emoji_row">
			<u-col @click="clickEmoji(emoji)" v-for="emoji in emojiList" :key="emoji.context" :id="`emoji${emoji.context}`" span="2">
				<image class="emoji_item" :src="emoji.src" alt="">
			</u-col>
		</u-row>
	</view>
</template>

<script>
	import emojis from "@/common/emojis.js"
	export default {
		components: {

		},
		data() {
			return {
				 
			}
		},
		computed:{
			emojiList() {
			  return emojis;
			},
		},
		mounted() {

		},
		methods: {
			clickEmoji(emoji) {
				this.$emit('emojiClick', emoji)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.chat_emoji_bar {
		padding: 24rpx 36rpx;
		position: relative;

		.emoji_row {
			flex-wrap: wrap;
			margin-bottom: 24rpx;
		}

		.emoji_item {
			@include centerBox();
			margin-top: 24rpx;
			width: 80rpx;
			height: 60rpx;
		}
		
		.backspace_icon {
			position: absolute;
			bottom: 48rpx;
			right: 72rpx;
		}
	}
</style>
