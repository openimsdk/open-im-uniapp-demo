<template>
	<u-navbar :title="title" placeholder class="custom_nav_bar">
		<template slot="left">
			<slot name="left">
				<view class="u-nav-slot">
					<img @click="leftClick" class="back_icon" width="12" height="20"
						src="static/images/common_left_arrow.png" alt="" srcset="">
				</view>
			</slot>
		</template>

		<template slot="center">
			<slot name="center"></slot>
		</template>

		<template slot="right">
			<slot name="more">
				<view @click="rightClick" v-if="more" class="u-nav-slot">
					<u-icon class="more_dot" name="more-dot-fill" size="23" color="#333"></u-icon>
				</view>
			</slot>
		</template>

	</u-navbar>
</template>

<script>
	export default {
		name: "",
		components: {

		},
		props: {
			title: {
				type: String,
			},
			more: {
				type: Boolean,
				default: false
			},
			route: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {

			};
		},
		methods: {
			leftClick() {
				if (this.route) {
					uni.navigateBack();
				}
				this.$emit('leftClick')
			},
			rightClick() {
				this.$emit('rightClick')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.custom_nav_bar {
		/deep/ .u-navbar__content__left {
			padding: 0;
		}

		/deep/ .u-navbar__content__right {
			padding: 0;
		}

		.back_icon {
			padding: 24rpx;
			margin-left: 20rpx;
		}

		.more_dot {
			padding: 24rpx;
			margin-right: 20rpx;
		}
	}
</style>
