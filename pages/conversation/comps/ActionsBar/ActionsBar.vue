<template>
	<view class="more-operation">
		<ActionItem @click="clickShot" :icon="actions[0].icon" text="拍摄" :size="48"/>
		<ActionItem @click="clickAlbum" :icon="actions[1].icon" text="相册" :size="48"/>
		<ActionItem @click="clickVoice" :icon="actions[2].icon" text="语音通话" :size="48"/>
		<ActionItem @click="clickVideo" :icon="actions[3].icon" text="视频通话" :size="48"/>
		<ActionItem @click="clickFile" :icon="actions[4].icon" text="文件" :size="48"/>
		<ActionItem @click="clickIDcard" :icon="actions[5].icon" text="名片" :size="48"/>
		<ActionItem @click="clickLocation" :icon="actions[6].icon" text="位置" :size="40"/>
	</view>
</template>

<script>
	import ActionItem from "./ActionItem.vue"
	export default {
		data(){
			return {
				actions:[
					{
						icon:require("../../../../static/camera.png"),
						text:"拍摄",
						size:48
					},
					{
						icon:require("../../../../static/album.png"),
						text:"相册",
						size:48
					},
					{
						icon:require("../../../../static/voice_msg.png"),
						text:"语音通话",
						size:48
					},
					{
						icon:require("../../../../static/video_msg.png"),
						text:"视频通话",
						size:48
					},
					{
						icon:require("../../../../static/file_msg.png"),
						text:"文件",
						size:48
					},
					{
						icon:require("../../../../static/idcard_msg.png"),
						text:"名片",
						size:48
					},
					{
						icon:require("../../../../static/location_msg.png"),
						text:"位置",
						size:42
					},
				]
			}
		},
		components:{
			ActionItem
		},
		methods:{
			clickShot(){
				this.$emit("clickShot")
			},
			clickAlbum(){
				this.$emit("clickAlbum")
			},
			clickVoice(){
				this.$emit("clickVoice")
			},
			clickVideo(){
				this.$emit("clickVideo")
			},
			clickFile(){
				this.$emit("clickFile")
			},
			clickIDcard(){
				this.$emit("clickIDcard")
			},
			clickLocation(){
				this.$emit("clickLocation")
			},
		}
	}
</script>

<style lang="scss">
	.more-operation {
		height: 160px;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.operation-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 0 0 25%;
			.op-text{
				color: #5B97EB;
			}
		}
	}
</style>
