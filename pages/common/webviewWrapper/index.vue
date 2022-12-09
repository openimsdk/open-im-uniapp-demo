<template>
	<web-view :src="url"></web-view>
</template>

<script>
	export default {
		data() {
			return {
				url: ''
			};
		},
		onLoad(options) {
			this.url = decodeURIComponent(options.url)
		}
	}
</script>

<style lang="scss">

</style>
