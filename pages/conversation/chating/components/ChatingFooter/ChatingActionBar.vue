<template>
	<view class="chat_action_bar">
		<u-row class="action_row">
			<u-col v-for="item in actionList" :key="item.idx" @click="actionClick(item)" span="3">
				<view class="action_item">
					<image :src="item.icon" alt="" srcset="">
						<text class="action_item_title">{{item.title}}</text>
				</view>
			</u-col>
		</u-row>
	</view>
</template>

<script>
	import {
		ChatingFooterActionTypes,
		ContactChooseTypes
	} from "@/constant"
	import {
		AmapWebKey
	} from "@/common/config";
	import IMSDK from '@/util/compatibleIM'
	import chooseFile from "./chooseFile";
	import {
		getPurePath
	} from "@/util/common";
import { gotoAppPermissionSetting, requestAndroidPermission } from "../../../../../util/permission";

	export default {
		components: {

		},
		data() {
			return {
				actionList: [{
						idx: 0,
						type: ChatingFooterActionTypes.Album,
						title: '相册',
						icon: require('static/images/chating_action_image.png')
					},
					{
						idx: 1,
						type: ChatingFooterActionTypes.Camera,
						title: '拍摄',
						icon: require('static/images/chating_action_camera.png')
					},
					{
						idx: 2,
						type: ChatingFooterActionTypes.Call,
						title: '视频通话',
						icon: require('static/images/chating_action_call.png')
					},
					{
						idx: 3,
						type: ChatingFooterActionTypes.File,
						title: '文件',
						icon: require('static/images/chating_action_file.png')
					},
					{
						idx: 4,
						type: ChatingFooterActionTypes.Card,
						title: '名片',
						icon: require('static/images/chating_action_card.png')
					},
					{
						idx: 5,
						type: ChatingFooterActionTypes.Location,
						title: '位置',
						icon: require('static/images/chating_action_location.png')
					},
				],
			}
		},
		methods: {
			async actionClick(action) {
				switch (action.type) {
					case ChatingFooterActionTypes.Album:
					case ChatingFooterActionTypes.Camera:
						this.$emit('prepareMediaMessage', action.type)
						break;
					case ChatingFooterActionTypes.Call:
						console.log('call');
						break;
					case ChatingFooterActionTypes.Card:
						uni.navigateTo({
							url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Card}`
						})
						break;
					case ChatingFooterActionTypes.File:
						const flag = await requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
						if (flag === -1) {
							uni.$u.toast('您已禁止访问存储，请前往开启')
							setTimeout(() => gotoAppPermissionSetting(), 250)
							return;
						}
						chooseFile((path) => {
							const idx = path.lastIndexOf('/')
							const fileName = path.slice(idx + 1)
							const message = IMSDK.IMApi.createFileMessageFromFullPath(IMSDK.uuidv4(),getPurePath(path), fileName)
							this.$emit('sendMessage', message)
						})
						break;
					case ChatingFooterActionTypes.Location:
						console.log('Location');
						uni.chooseLocation({
							success: (res) => {
								if (res) {
									const options = {
										name: res.name,
										latng: `${res.latitude},${res.longitude}`,
										addr: res.address,
										city: res.address,
										module: "locationPicker",
										latitude: res.latitude,
										longitude: res.longitude,
										url: `https://restapi.amap.com/v3/staticmap?size=600*300&markers=-1,https://cache.amap.com/lbs/static/cuntom_marker1.png,0:${res.longitude},${res.latitude}&key=${AmapWebKey}`
									}
									const message = IMSDK.IMApi.createLocationMessage(IMSDK.uuidv4(), JSON
										.stringify(options), res.longitude, res.latitude);
									this.$emit('sendMessage', message)
								} else {
									uni.$u.toast('获取位置失败')
								}
							},
							fail: ({
								errMsg
							}) => {
								if (!errMsg.includes('cancel')) {
									uni.$u.toast('获取位置失败')
								}
							}
						});
						break;
					default:
						break;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.chat_action_bar {
		padding: 24rpx 36rpx;

		.action_row {
			flex-wrap: wrap;
			margin-bottom: 24rpx;
		}

		.action_item {
			@include centerBox();
			flex-direction: column;
			margin-top: 24rpx;

			image {
				width: 96rpx;
				height: 96rpx;
			}

			&_title {
				font-size: 24rpx;
				color: #999;
				margin-top: 6rpx;
			}
		}
	}
</style>
