<template>
	<view class="file_message_container bg_container">
		<view @click="toPreviewFile" class="file_info">
			<text class="file_name">{{message.fileElem.fileName}}</text>
			<text class="file_size">{{getSizeStr}}</text>
		</view>
		<image src="@/static/images/chating_message_file.png" alt="" srcset="">
	</view>
</template>

<script>
	import {
		bytesToSize
	} from "@/util/imCommon"
	export default {
		name: "",
		props: {
			message: Object
		},
		data() {
			return {

			};
		},
		computed: {
			getSizeStr() {
				return bytesToSize(this.message.fileElem.fileSize)
			}
		},
		methods: {
			toPreviewFile() {
				
			}
		}
	}
</script>

<style lang="scss" scoped>
	.file_message_container {
		@include vCenterBox();

		.file_info {
			@include colBox(true);
			margin-right: 24rpx;
			max-width: 360rpx;

			.file_name {
				@include nomalEllipsis();
			}

			.file_size {
				color: #999;
				font-size: 24rpx;
			}
		}

		image {
			width: 22px;
			height: 28px;
		}
	}
</style>
