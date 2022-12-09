<template>
	<view :insertImageFlag="insertImageFlag" :change:insertImageFlag="input.insertImageFlagUpdate" class="editor_wrap">
		<editor :placeholder="placeholder" id="editor2" @ready="editorReady" @focus="editorFocus" @blur="editorBlur" @input="editorInput" />
		<view class="canvas_container">
			<text class="canvas_container_name">
				{{ canvasData.title }}
			</text>
			<canvas v-if="canvasData.show" canvas-id="atCanvas" :style="{width:canvasData.width}"
				id="atCanvas"></canvas>
		</view>
	</view>
</template>>

<script>
	export default {
		props:{
			placeholder: {
				type:String,
				default: ''
			}
		},
		data() {
			return {
				editorCtx: null,
				canvasData: {
					width: 0,
					title: "",
					show: false
				},
				imageData: {},
				insertImageFlag: null,
			};
		},
		methods: {
			editorReady() {
				uni
					.createSelectorQuery()
					.select("#editor2")
					.context((res) => {
						this.$emit("ready", res);
						this.editorCtx = res.context;
					})
					.exec();
			},
			insertImage(imageData) {
				this.imageData = imageData
				this.insertImageFlag = true
			},
			internalInsertImage() {
				this.editorCtx.insertImage({
					...this.imageData,
					complete: () => {
						this.insertImageFlag = false
						// this.setDraftTextItem();
					},
				});
			},
			createCanvasData(sendID, senderNickname) {
				this.canvasData.title = "@" + senderNickname;
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query
						.select(".canvas_container_name")
						.boundingClientRect((style) => {
							let width = parseInt(style.width)+4;
							this.canvasData.width = width + "px";
							this.canvasData.show = true
							this.$nextTick(() => {
								const ctx = uni.createCanvasContext("atCanvas");
								const fontSize = 16;
								ctx.setFontSize(fontSize);
								ctx.setFillStyle("#3e44ff");
								let text = this.canvasData.title;
								console.log(width);
								if (width >= 240) {
									text = this.transformContent(
										ctx,
										this.canvasData.title,
										width
									)[0];
								}
								ctx.fillText(text, 0, 16);
								ctx.draw();
								this.canvasToTempFilePath(sendID, senderNickname);
							});
						})
						.exec();
				});
			},
			canvasToTempFilePath(sendID, senderNickname) {
				uni.canvasToTempFilePath({
					canvasId: "atCanvas",
					success: (res) => {
						this.insertImage({
							src: res.tempFilePath,
							width: this.canvasData.width,
							height: "20px",
							data: {
								sendID,
								senderNickname
							},
							extClass: 'at_el'

						});
					},
				});
			},
			transformContent(ctx, text, contentWidth, lineNumber = 1) {
				let textArray = text.split("");
				let textStr = "";
				let row = [];
				const length = textArray.length;
				let index = 0;
				for (let i = 0; i < length; i++) {
					const t = textArray[i];
					index = i;
					const width = ctx.measureText(textStr + t).width + i * 0.2;
					if (width < contentWidth) {
						textStr += t;
						if (i === length - 1) {
							row.push(textStr);
							textStr = "";
						}
					} else {
						row.push(textStr);
						textStr = t;
						if (row.length >= lineNumber) {
							break;
						}
					}
				}
				if (index < length) {
					//文字未显示完
					const lastIndex = row.length - 1;
					const str = row[lastIndex];
					const strLength = str.length;
					const str2 = "...";
					for (let j = strLength - 1; j > 0; j--) {
						let s = str.slice(0, j);
						const str1 = s + str2;
						const width = ctx.measureText(str1).width + j * 0.2;
						if (width < contentWidth) {
							row.splice(lastIndex, 1, str1);
							break;
						}
					}
				}
				return row;
			},

			editorFocus() {
				this.$emit("focus");
			},
			editorBlur() {
				this.$emit("blur");
			},
			editorInput(e) {
				this.$emit("input", e);
			},
		},
	};
</script>

<script module="input" lang="renderjs">
	export default {
		methods: {
			insertImageFlagUpdate(newValue, oldValue, ownerVm, vm) {
				if (newValue === null) {
					return;
				}
				if (newValue) {
					this.$el.querySelector('.ql-editor').setAttribute('inputmode', 'none')
					ownerVm.callMethod('internalInsertImage')
				} else {
					this.$el.querySelector('.ql-editor').removeAttribute('inputmode')
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.editor_wrap {
		position: relative;
	}

	#editor2 {
		background-color: #fff;
		min-height: 30px;
		max-height: 120px;
		height: auto;
		word-break: break-all;
	}

	/deep/.ql-editor {
		img {
			vertical-align: sub !important;
		}

		p {
			padding: 4px;
		}
	}

	.canvas_container {
		position: fixed;
		bottom: -99px;
		z-index: -100;

		&_name {
			max-width: 480rpx;
			display: inline-block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		#atCanvas {
			height: 20px;

		}
	}
</style>
