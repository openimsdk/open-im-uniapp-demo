<template>
	<u-overlay :show="visible">
		<view class="record_container">

			<view :data-tip="!cancelFlag ? '松开发送' : ''" class="record_area">
				<image src="static/images/chating_footer_recording.png" alt="">
			</view>

			<view class="record_action_bar">
				<view :data-tip="isCancelActive ? '松开取消' : ''" class="record_action"
					:class="{'record_action_cancling':isCancelActive}">
					X
				</view>
				<view :data-tip="isTranslateActive ? '转文字' : ''" class="record_action"
					:class="{'record_action_translating':isTranslateActive}">
					文
				</view>
			</view>

			<view class="layer_container">
				<view class="prompt-layer prompt-layer-1">
					<view class="prompt-loader">
						<view class="em" v-for="(item,index) in 20" :key="index"></view>
					</view>
				</view>
			</view>
		</view>
	</u-overlay>
</template>

<script>
	const recorderManager = uni.getRecorderManager()
	const windowWidth = uni.getWindowInfo().windowWidth
	let timer

	const RecordActions = {
		Cancel: 'Cancel',
		Translate: 'Translate'
	}


	export default {
		name: "",
		components: {},
		props: {
			visible: Boolean,
		},
		data() {
			return {
				cancelFlag: false,
				activeAction: null,
				duration: 0,
			};
		},
		computed: {
			isCancelActive() {
				return this.activeAction === RecordActions.Cancel
			},
			isTranslateActive() {
				return this.activeAction === RecordActions.Translate
			}
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.recordStart()
				}
			}
		},
		methods: {
			recordStart() {
				recorderManager.onStop(({
					tempFilePath
				}) => {
					if (this.isCancelActive || this.isTranslateActive) {
						uni.$u.toast('已取消')
					} else {
						this.$emit('recordFinish', tempFilePath, this.duration)
					}
					this.clearTimer()
					this.activeAction = null
					this.cancelFlag = false
				})
				recorderManager.onStart((res) => {
					this.startTimer()
				})
				recorderManager.onError((err) => {
					console.log(err);
				})
				recorderManager.start();
			},
			touchMoveSpeech(e, recordHeight) {
				const touches = e.touches[0]
				this.cancelFlag = touches.pageY < recordHeight
				if (this.cancelFlag) {
					const isCancel = touches.pageX < windowWidth / 2
					this.activeAction = isCancel ? RecordActions.Cancel : RecordActions.Translate
				} else {
					this.activeAction = null
				}
			},
			checkStopType() {
				console.log(this.activeAction);
				recorderManager.stop()
			},
			startTimer() {
				timer = setInterval(() => this.duration++, 1000);
			},
			clearTimer() {
				if (timer) {
					clearInterval(timer)
					this.duration = 0
				}
			}
		},
	}
</script>

<style lang="scss">
	.prompt-layer {
		border-radius: 16rpx;
		background: #fff;
		padding: 60rpx 32rpx;
		box-sizing: border-box;
		position: relative;
		// position: absolute;
		// left: 50%;
		// transform: translateX(-50%);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.prompt-layer::after {
		content: '';
		display: block;
		border: 24rpx solid rgba(0, 0, 0, 0);
		border-top-color: #fff;
		position: absolute;
		bottom: -40rpx;
		left: 50%;
		transform: translateX(-50%);
	}

	.prompt-layer-1 {
		font-size: 24rpx;
		width: 380rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		top: -320rpx;
	}

	.prompt-layer-1 .p {
		color: #000;
	}

	.prompt-layer-1 .span {
		color: rgba(0, 0, 0, .6);
	}

	.prompt-loader .em {}

	/* 语音音阶------------- */
	.prompt-loader {
		width: 260rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.prompt-loader .em {
		display: block;
		background: #3A65CC;
		width: 1px;
		height: 10%;
		margin-right: 2.5px;
		float: left;
	}

	.prompt-loader .em:last-child {
		margin-right: 0px;
	}

	.prompt-loader .em:nth-child(1) {
		animation: load 2.5s 1.4s infinite linear;
	}

	.prompt-loader .em:nth-child(2) {
		animation: load 2.5s 1.2s infinite linear;
	}

	.prompt-loader .em:nth-child(3) {
		animation: load 2.5s 1s infinite linear;
	}

	.prompt-loader .em:nth-child(4) {
		animation: load 2.5s 0.8s infinite linear;
	}

	.prompt-loader .em:nth-child(5) {
		animation: load 2.5s 0.6s infinite linear;
	}

	.prompt-loader .em:nth-child(6) {
		animation: load 2.5s 0.4s infinite linear;
	}

	.prompt-loader .em:nth-child(7) {
		animation: load 2.5s 0.2s infinite linear;
	}

	.prompt-loader .em:nth-child(8) {
		animation: load 2.5s 0s infinite linear;
	}

	.prompt-loader .em:nth-child(9) {
		animation: load 2.5s 0.2s infinite linear;
	}

	.prompt-loader .em:nth-child(10) {
		animation: load 2.5s 0.4s infinite linear;
	}

	.prompt-loader .em:nth-child(11) {
		animation: load 2.5s 0.6s infinite linear;
	}

	.prompt-loader .em:nth-child(12) {
		animation: load 2.5s 0.8s infinite linear;
	}

	.prompt-loader .em:nth-child(13) {
		animation: load 2.5s 1s infinite linear;
	}

	.prompt-loader .em:nth-child(14) {
		animation: load 2.5s 1.2s infinite linear;
	}

	.prompt-loader .em:nth-child(15) {
		animation: load 2.5s 1.4s infinite linear;
	}

	.prompt-loader .em:nth-child(16) {
		animation: load 2.5s 1.6s infinite linear;
	}

	.prompt-loader .em:nth-child(17) {
		animation: load 2.5s 1.8s infinite linear;
	}

	.prompt-loader .em:nth-child(18) {
		animation: load 2.5s 2.0s infinite linear;
	}

	.prompt-loader .em:nth-child(19) {
		animation: load 2.5s 2.2s infinite linear;
	}

	.prompt-loader .em:nth-child(20) {
		animation: load 2.5s 2.4s infinite linear;
	}

	@keyframes load {
		0% {
			height: 10%;
		}

		50% {
			height: 100%;
		}

		100% {
			height: 10%;
		}
	}

	.record_container {
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
		width: 100%;

		.record_area {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 260rpx;
			width: 150%;
			background-color: #dfdfdf;
			border-radius: 50% / 100% 100% 0 0;
			position: relative;
			left: -25%;

			image {
				width: 36px;
				height: 36px;
			}

			&:after {
				content: attr(data-tip);
				font-size: 26rpx;
				color: #BEBEBE;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				top: -64rpx;
			}
		}

		.record_action_bar {
			display: flex;
			width: 80%;
			min-height: 200rpx;
			justify-content: space-between;
			margin-left: 10%;
			margin-bottom: 48rpx;

			.record_action {
				height: 144rpx;
				width: 144rpx;
				border-radius: 50%;
				background-color: #484848;
				color: #8e8e8e;
				transition: all 0.25s;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 56rpx;
				font-weight: 500;
				transform: rotate(-24deg);
				position: relative;

				&:after {
					content: attr(data-tip);
					position: absolute;
					font-size: 26rpx;
					color: #BEBEBE;
					transform: rotate(24deg);
					top: -50%;
					left: 50%;
					width: 120rpx;
					text-align: center;
				}

				&:last-child {
					transform: rotate(24deg);

					&:after {
						transform: rotate(-24deg);
						left: auto;
						right: 40%;
					}
				}

				&_cancling {
					transform: rotate(-24deg) scale(1.2);
					background-color: #eeedf0;
					color: #696768;
				}

				&_translating {
					transform: rotate(24deg) scale(1.2) !important;
					background-color: #eeedf0;
					color: #696768;
				}
			}

		}

		.layer_container {
			display: flex;
			justify-content: center;
			width: 100%;
		}
	}
</style>
