<template>
	<u-avatar @longpress="longpress" @click="click" @onError="errorHandle" :src="getAvatarUrl" :text="avatarText"
		bgColor="#5496EB" :defaultUrl="getDdefaultUrl" :shape="shape" :size="size">
	</u-avatar>
</template>

<script>
	import defaultAvatars from '@/common/defaultAvatars.js'
	import defaultGroupIcon from 'static/images/contact_my_group.png'
	import defaultNotifyIcon from 'static/images/default_notify_icon.png'
	export default {
		name: "MyAvatar",
		props: {
			src: String,
			shape: {
				type: String,
				default: 'square'
			},
			size: {
				type: String,
				default: '40'
			},
			isGroup: {
				type: Boolean,
				default: false
			},
			isNotify: {
				type: Boolean,
				default: false
			},

			desc: String
		},
		data() {
			return {
				avatarText: undefined
			};
		},
		computed: {
			getAvatarUrl() {
				if (this.isNotify) {
					return defaultNotifyIcon
				}
				if (this.src) {
					return defaultAvatars[this.src] ?? this.src
				}
				if (this.isGroup) {
					return defaultGroupIcon
				}
				this.avatarText = this.desc ? this.desc.slice(this.desc.length > 1 ? -2 : -1) : '未知'
				return ''
			},
			getDdefaultUrl() {
				return this.isGroup ? defaultGroupIcon : undefined;
			}
		},
		methods: {
			errorHandle() {
				this.avatarText = this.desc ? this.desc.slice(this.desc.length > 1 ? -2 : -1) : '未知'
			},
			redirectShow() {
				if (this.avatarText) {
					this.avatarText = undefined
				}
			},
			click() {
				this.$emit('click')
			},
			longpress() {
				this.$emit('longpress')
			}
		},
		watch: {
			src() {
				this.redirectShow()
			},
			desc() {
				this.redirectShow()
			}
		},
	}
</script>

<style>

</style>
