<template>
	<view class="preview_location_container">
		<custom-nav-bar title="位置" />

		<map class="map_area" :style="{height: height}" :latitude="latng[0]" :longitude="latng[1]"
			:markers="marks">
		</map>
	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				latng: [],
				marks: [],
				height: '0px',
			};
		},
		onLoad(options) {
			const {
				latng
			} = options
			this.latng = latng.split(',')
			this.getMarks();
			const {
				windowHeight,
				statusBarHeight
			} = uni.getWindowInfo()
			this.height = `${windowHeight - statusBarHeight - 44}px`
		},
		methods: {
			getMarks() {
				this.marks = [{
					id: 123456,
					latitude: this.latng[0],
					longitude: this.latng[1],
					iconPath: '../../../static/images/location.png'
				}]
			},
		}
	}
</script>

<style lang="scss">
	.preview_location_container {
		@include colBox(false);
		height: 100vh;

		.map_area {
			width: 100%;
		}
	}
</style>
