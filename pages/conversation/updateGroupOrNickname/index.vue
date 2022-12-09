<template>
	<view class="page_container">
		<custom-nav-bar title="" />

		<view class="desc_content">
			<view class="title">
				<text>{{getTitle}}</text>
			</view>
			<view class="sub_title">
				<text>{{getSubTitle}}</text>
			</view>
		</view>

		<view class="input_content">
			<my-avatar :src="sourceInfo.faceURL" :desc="sourceInfo.nickname" :isGroup="sourceInfo.groupName!==undefined"
				size="42" />
			<u--input placeholder="请输入内容" border="none" v-model="content" clearable></u--input>
		</view>

		<view class="action_row">
			<u-button :loading="updateLoading" :disabled="!content" @click="comfirmUpdate" text="完成" type="primary">
			</u-button>
		</view>
	</view>
</template>

<script>
	import IMSDK from '@/util/compatibleIM'
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	export default {
		components: {
			CustomNavBar,
			MyAvatar,
		},
		data() {
			return {
				sourceInfo: {},
				content: '',
				updateLoading: false
			};
		},
		computed: {
			isGroup() {
				return this.sourceInfo.nickname === undefined
			},
			getTitle() {
				return this.isGroup ? '修改群聊名称' : '我在群里的昵称'
			},
			getSubTitle() {
				return this.isGroup ? '修改群名称后，将在群内通知其他成员' : '昵称修改后，只会在此群内显示，群内成员都可以看见。'
			}
		},
		onLoad(options) {
			const {
				sourceInfo
			} = options
			this.sourceInfo = JSON.parse(sourceInfo);
			this.content = this.sourceInfo.nickname ?? this.sourceInfo.groupName;
		},
		methods: {
			comfirmUpdate() {
				this.updateLoading = true
				let func
				if (!this.isGroup) {
					func = IMSDK.compatibleAPI(IMSDK.IMMethods.SetGroupMemberNickname, IMSDK.uuidv4(), this.sourceInfo
						.groupID,
						this
						.sourceInfo.userID, this.content)
				} else {
					func = IMSDK.compatibleAPI(IMSDK.IMMethods.SetGroupInfo, IMSDK.uuidv4(), this.sourceInfo.groupID, {
						groupName: this.content
					})
				}

				func.then(() => {
					uni.$u.toast('修改成功');
					setTimeout(() => uni.navigateBack(), 250)
				}).catch(() => uni.$u.toast('修改失败')).finally(() => this.updateLoading = false)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page_container {

		.desc_content {
			margin-top: 10vh;
			padding: 0 72rpx;
			text-align: center;
			color: $uni-text-color;

			.title {
				font-size: 40rpx;
				font-weight: 500;
				margin-bottom: 24rpx;
			}

			.sub_title {
				font-size: 28rpx;
			}
		}

		.input_content {
			@include vCenterBox();
			margin: 72rpx 72rpx 0;
			padding: 12rpx 0;
			border-top: 1px solid rgba(51, 51, 51, .2);
			border-bottom: 1px solid rgba(51, 51, 51, .2);

			.u-avatar {
				margin-right: 24rpx;
			}
		}

		.action_row {
			text-align: center;
			width: 100%;
			margin-top: 30vh;

			.u-button {
				width: 300rpx;
				height: 70rpx;
			}
		}
	}
</style>
