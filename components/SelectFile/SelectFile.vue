<template>
	<view class="file-outerBox" @touchmove.prevent v-if="isOpen">
		<view style="width: 100%; padding-top: --status-bar-height;"></view>
		<view class="file-titel" :style="{backgroundColor: navBgColor}">
			<view class="file-nav-leftBox" @click="backAddress">
				<image :src="backImg" mode="widthFix" class="file-back-img"></image>
			</view>
			<text :style="titelStyle">
				{{titel}}
			</text>
			<view class="file-nav-rightBox"></view>
		</view>
		<view class="file-address">
			<view class="root-box"  @click="backRoot">
				内部存储
				<image :src="directionImg" mode="widthFix" class="to-img-box"></image>
			</view>
			<scroll-view :scroll-x="true" class="address-scroll">
				<view class="address-box" v-for="(item,index) in addressBar" @click="backFolder(item,index)">
					{{item.name}}
					<image :src="directionImg" mode="widthFix" class="to-img-box"></image>
				</view>
			</scroll-view>
		</view>
		<view class="">
			<scroll-view :scroll-y="true" :style="{height: 'calc(100vh - ' +  (barHeight*2 + 280) + 'rpx)'}">
				<view class="select-tips" v-if="inaccessible">
					<view style="line-height: 40rpx;">
						无法访问的文件夹
					</view>
					<view style="line-height: 40rpx;">
						建议前往安卓存储访问框架查看文件
					</view>
				</view>
				<view class="folder-box" v-for="item in folderArr" @click="toFolder(item)">
					<view class="folder-name-box">
						<image :src="folderImg" mode="widthFix" class="folder-img"></image>
						<view class="name-box">{{item.name}}</view>
					</view>
					<view>
						<image :src="enterImg" mode="widthFix" class="toFolder-img"></image>
					</view>
				</view>
				<view class="file-box" v-for="(item,index) in fileArr" @click="selectFile(index)">
					<view class="file-name-box">
						<image :src="fileImg" mode="widthFix" class="file-img" v-if="item.type == 'file'"></image>
						<image :src="txtImg" mode="widthFix" class="file-img" v-if="item.type == 'txt'"></image>
						<image :src="docImg" mode="widthFix" class="file-img" v-if="item.type == 'doc'"></image>
						<image :src="pdfImg" mode="widthFix" class="file-img" v-if="item.type == 'pdf'"></image>
						<view class="name-box">
							{{item.name}}
						</view>
					</view>
					<view>
						<image :src="selectedImg" mode="widthFix" class="select-img" v-if="item.select"></image>
						<image :src="unselectedImg" mode="widthFix" class="select-img" v-else></image>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="">
			<button type="default" class="select-foot-btn" :style="btnStyle" @click="uploadBtn">{{btnText}}</button>
		</view>
	</view>
</template>

<script>
	
/*
*	
* {property} 使用 v-model 绑定一个变量来控制组件的开启与关闭
* {property} navBgColor [String] 顶部标题栏背景色
* {property} folderImg [String] 文件夹的图片
* {property} backImg [String] 返回上一级图片
* {property} directionImg [String] 右指向箭头 
* {property} enterImg [String] 进入文件夹箭头
* {property} fileImg [String] 未知文件通用图标，当前仅可识别 pdf、doc/docx、txt
* {property} txtImg [String] txt文件图标
* {property} docImg [String] doc/docx文件图标
* {property} pdfImg [String] pdf文件图标 
* {property} selectedImg [String] 选中状态下的按钮图标
* {property} unselectedImg [String] 未选中状态下的按钮图标
* {property} titel [String] 标题文字，默认 '选择文件'
* {property} titelSize [String,Number] 标题文字大小，默认 36rpx
* {property} titelWeight [String,Number] 标题文字粗细，默认 600
* {property} titelColor [String] 标题文字颜色，默认 #373737
* {property} btnText [String] 底部按钮文字， 默认 '上传'
* {property} btnSize [String,Number] 底部按钮文字大小， 默认 36rpx
* {property} btnHeight [String,Number] 底部按钮高度， 默认 92rpx
* {property} btnBgColor [String] 底部按钮颜色， 默认 #6521e2
* {property} btnTextColor [String] 底部按钮文字颜色， 默认 #fff
*
* {event} confirm [Function] 点击上传按钮触发的回调事件，会返回选中文件的地址 event = [{name: name, url: path, sizeMB: sizeMb}]
*		name: 文件名  url: 文件地址  sizeMB: 文件大小，单位MB
*/
	
	export default {
		name:"nk-select-file",
		props:{
			value:{
				type: Boolean,
				default: false
			},
			backImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/c08ef3dc-2514-443d-91aa-a055a098077f.png'
			},
			directionImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/183fcda4-b046-4723-8356-dded284bdefc.png'
			},
			enterImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/138ad94e-84e5-460e-a4eb-9e29d2139049.png'
			},
			folderImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/7f70ee21-bd9c-4630-9a0a-113d78a99335.png'
			},
			fileImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/24fe2fda-a956-402e-af65-e11f8779c6d1.png'
			},
			txtImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/10450e01-189b-48c7-9b97-918104fdd701.png'
			},
			docImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/501660e5-8386-473f-bfcb-34c0b2b4a2f8.png'
			},
			pdfImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/b1056050-6d27-454e-b2b7-51e3832cfe5e.png'
			},
			selectedImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/ebaaad9d-4697-42d1-beea-f4c736132b9a.png'
			},
			unselectedImg:{
				type: String,
				default: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-5c697db4-d920-4af3-90a0-19211379b881/ea5fe3fa-799b-40c9-be01-00d0b7419c4a.png'
			},
			titel:{
				type: String,
				default: '选择文件'
			},
			titelSize: {
				type: [String,Number],
				default: 36
			},
			titelWeight: {
				type: [String,Number],
				default: 600
			},
			titelColor: {
				type: String,
				default: '#373737'
			},
			btnText: {
				type: String,
				default: '上传'
			},
			btnSize: {
				type: [String,Number],
				default: 36
			},
			btnHeight: {
				type: [String,Number],
				default: 92
			},
			btnBgColor: {
				type: String,
				default: '#6521e2'
			},
			btnTextColor: {
				type: String,
				default: '#fff'
			},
			navBgColor: {
				type: String,
				default: '#fff'
			}
			
		},
		data() {
			return {
				barHeight: '', // 状态栏高度
				rootAddress: {}, // 根目录
				addressBar: [], // 地址栏记录栈
				folderArr: [], // 文件夹
				fileArr: [], // 文件
				selectArr:[], // 选中文件集合
				isExit: true, // 退出
				isOpen: false,
				inaccessible: false, // 无法访问提示
				titelStyle: {
					fontSize: this.titelSize + 'rpx',
					fontWeight: this.titelWeight,
					color: this.titelColor
				},
				btnStyle: {
					height: this.btnHeight + 'rpx',
					backgroundColor: this.btnBgColor,
					color: this.btnTextColor,
					fontSize: this.btnSize + 'rpx'
				}
			};
		},
		watch:{
			value(val){
				if(val){
					this.open();
				}else{
					this.close();
				}
			}
		},
		methods:{
			// 打开组件
			open(){
				this.isOpen = true;
				this.getBarHeight();
				this.getRootDirectory();
			},
			// 关闭组件
			close(){
				this.isOpen = false;
				this.rootAddress = {}; // 根目录
				this.addressBar = []; // 地址栏记录栈
				this.folderArr = [];
				this.fileArr = [];
				this.selectArr = []; // 选中文件集合
				this.$emit('input', false);
				// 放到下一个生命周期，因为双向绑定的value修改父组件状态需要时间，且是异步的
				this.$nextTick(() => {
					this.$emit('change', false);
				})
			},
			
			// 获取状态栏高度
			getBarHeight(){
				var self = this;
				uni.getSystemInfo({
					success(res) {
						self.barHeight = res.statusBarHeight;
					}
				})
			},
			// 获取根目录
			getRootDirectory(){
				this.inaccessible = false;
				// 修改退出状态，以便在点击返回按钮时最后一层返回的是根目录，再点击一次才会退出
				this.isExit = false;
				this.addressBar = [];
				var environment = plus.android.importClass("android.os.Environment");
				environment.getExternalStorageState() === environment.MEDIA_MOUNTED;
				var sdRoot = environment.getExternalStorageDirectory();
				var rootName = plus.android.invoke(sdRoot,"getName");
				this.rootAddress = {
					name: rootName,
					file: sdRoot,
				};
				var files = plus.android.invoke(sdRoot,"listFiles");
				var len = files.length;
				for(let i = 0; i < len; i++){
					// 过滤隐藏文件
					if(!plus.android.invoke(files[i],"isHidden")){
						// 判断是文件还是文件夹
						if(plus.android.invoke(files[i],"isDirectory")){ 
							var folderName = plus.android.invoke(files[i],"getName")
							this.folderArr.push({name: folderName,file: files[i]})
						}
						else{
							var fileName = plus.android.invoke(files[i],"getName")
							if(fileName.search(/txt/i) > -1){
								// txt 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'txt',select: false})
							}
							else if(fileName.search(/doc/i) > -1 || fileName.search(/docx/i) > -1){
								// doc/docx 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'doc',select: false})
							}
							else if(fileName.search(/pdf/i) > -1){
								// pdf 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'pdf',select: false})
							}
							else{
								// 其他文件
								this.fileArr.push({name: fileName,file: files[i],type: 'file',select: false})
							}
						}
					}
				}
				// 排序，不区分大小写
				this.folderArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
				this.fileArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
				this.rootAddress.folderArr = this.folderArr;
				this.rootAddress.fileArr = this.fileArr;
			},
			// 进入文件夹
			toFolder(event){
				this.isExit = false; // 地址栈中存在新地址，重置退出状态
				this.folderArr = [];
				this.fileArr = [];
				this.addressBar.push(event)
				var files = plus.android.invoke(event.file,"listFiles");
				if(files == null){
					this.inaccessible = true;
				}
				var len = files.length;
				for(let i = 0; i < len; i++){
					// 过滤隐藏文件
					if(!plus.android.invoke(files[i],"isHidden")){
						// 判断是文件还是文件夹
						if(plus.android.invoke(files[i],"isDirectory")){
							var folderName = plus.android.invoke(files[i],"getName")
							this.folderArr.push({name: folderName,file: files[i]})
						}
						else{
							var fileName = plus.android.invoke(files[i],"getName")
							if(fileName.search(/txt/i) > -1){
								// txt 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'txt',select: false})
							}
							else if(fileName.search(/doc/i) > -1 || fileName.search(/docx/i) > -1){
								// doc/docx 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'doc',select: false})
							}
							else if(fileName.search(/pdf/i) > -1){
								// pdf 文件
								this.fileArr.push({name: fileName,file: files[i],type: 'pdf',select: false})
							}
							else{
								// 其他文件
								this.fileArr.push({name: fileName,file: files[i],type: 'file',select: false})
							}
						}
					}
				}
				// 排序，不区分大小写
				this.folderArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
				this.fileArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
			},
			// 返回根目录
			backRoot(){
				this.inaccessible = false;
				this.addressBar = [];
				this.folderArr = this.rootAddress.folderArr;
				this.fileArr = this.rootAddress.fileArr;
			},
			// 返回上级文件夹
			backFolder(event,index){
				this.inaccessible = false;
				var len = this.addressBar.length;
				if(index + 1 == len){
					// 点击当前文件夹--无事发生
					return;
				}
				else{
					this.folderArr = [];
					this.fileArr = [];
					this.addressBar.splice(index + 1, len - index + 1)
					var files = plus.android.invoke(event.file,"listFiles");
					var len = files.length;
					for(let i = 0; i < len; i++){
						// 过滤隐藏文件
						if(!plus.android.invoke(files[i],"isHidden")){
							// 判断是文件还是文件夹
							if(plus.android.invoke(files[i],"isDirectory")){ 
								var folderName = plus.android.invoke(files[i],"getName")
								this.folderArr.push({name: folderName,file: files[i]})
							}
							else{
								var fileName = plus.android.invoke(files[i],"getName")
								if(fileName.search(/txt/i) > -1){
									// txt 文件
									this.fileArr.push({name: fileName,file: files[i],type: 'txt',select: false})
								}
								else if(fileName.search(/doc/i) > -1 || fileName.search(/docx/i) > -1){
									// doc/docx 文件
									this.fileArr.push({name: fileName,file: files[i],type: 'doc',select: false})
								}
								else if(fileName.search(/pdf/i) > -1){
									// pdf 文件
									this.fileArr.push({name: fileName,file: files[i],type: 'pdf',select: false})
								}
								else{
									// 其他文件
									this.fileArr.push({name: fileName,file: files[i],type: 'file',select: false})
								}
							}
						}
					}
					// 排序，不区分大小写
					this.folderArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
					this.fileArr.sort(function(a,b){return a.name.toUpperCase() > b.name.toUpperCase() ? '1' : '-1'});
				}
			},
			// 选中文件
			selectFile(index){
				if(this.fileArr[index].select){
					// 取消选中
					this.$set(this.fileArr[index],'select',false);
					let name = this.fileArr[index].name;
					for(let i = 0; i < this.selectArr.length; i++){
						if(name == this.selectArr[i].name){
							this.selectArr.splice(i,1);
							break;
						}
					}
				}else{
					// 选中
					this.$set(this.fileArr[index],'select',true);
					
					// 读文件大小  
					var FileInputStream = plus.android.importClass("java.io.FileInputStream");  
					var fileSize = new FileInputStream(this.fileArr[index].file);  
					var size = fileSize.available(); 
					var sizeMb = size / 1048576;
					sizeMb = sizeMb.toFixed(4);
					
					// 获取文件的相对路径
					var Path = plus.android.invoke(this.fileArr[index].file,"getPath")
					this.selectArr.push({name: this.fileArr[index].name, url: Path, sizeMB: sizeMb})
				}
			},
			// 点击上传按钮
			uploadBtn(){
				this.$emit("confirm",this.selectArr);
				this.close();
			},
			// 点击返回
			backAddress(){
				// 先判断地址栈中是否还有地址
				var len = this.addressBar.length;
				if(len > 1){
					// 返回上级文件夹
					let index = len - 2;
					let event = this.addressBar[index];
					this.backFolder(event,index);
				}
				else{
					// 退出文件选择
					if(this.isExit){
						// 退出文件选择
						this.close();
						// this.$u.toast('在点击一次退出文件选择')
					}
					else{
						// 返回根目录
						this.isExit = true; // 下一次再点击则退出
						this.backRoot();
						uni.showToast({
						    title: '再操作一次退出文件选择',
							icon: 'none',
						    duration: 1000
						});
					}
				}
			}
		},
		mounted() {
			// this.getBarHeight();
			// this.getRootDirectory();
		}
	}
</script>

<style lang="scss">
.file-outerBox{
	width: 100%;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1070;
	padding-bottom: 40rpx;
	background-color: #fff;
	.file-titel{
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		// background-color: #FFFFFF;
		padding: 0 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		.file-nav-leftBox{
			width: 60rpx;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			.file-back-img{
				width: 36rpx;
			}
		}
		.file-nav-rightBox{
			width: 60rpx;
			height: 100%;
		}
	}
	.file-address{
		width: 100%;
		height: 60rpx;
		background-color: #FBFBFB;
		padding: 0 32rpx;
		display: flex;
		color: #373737;
		font-size: 24rpx;
		.address-scroll{
			width: calc(100% - 116rpx);
			white-space: nowrap;
			height: 100%;
			.address-box{
				height: 60rpx;
				line-height: 60rpx;
				display: inline-block;
				.to-img-box{
					width: 20rpx;
				}
			}
		}
		.root-box{
			width: 116rpx;
			height: 60rpx;
			line-height: 60rpx;
			display: inline-block;
			box-shadow: 10rpx 0 10rpx -10rpx rgba(8,8,8,0.3);
			.to-img-box{
				width: 20rpx;
			}
		}
	}
	.folder-box{
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 32rpx;
		border-bottom: 1px solid #EEEEEE;
		.folder-name-box{
			width: 80%;
			display: flex;
			align-items: center;
			flex-wrap: wrap; 
			.folder-img{
				width: 72rpx;
				margin-right: 16rpx;
			}
			.name-box{
				width: calc(100% - 100rpx);
				overflow: hidden;
				word-wrap: break-word;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
		.toFolder-img{
			width: 28rpx;
		}
	}
	.select-tips{
		width: 100%;
		height: 160rpx;
		text-align: center;
		font-size: 32rpx;
		color: #888;
		padding-top: 60rpx;
	}
	.file-box{
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 32rpx;
		border-bottom: 1px solid #EEEEEE;
		.file-name-box{
			width: 80%;
			display: flex;
			align-items: center;
			.file-img{
				width: 72rpx;
				margin-right: 16rpx;
			}
			// .type-file{
			// 	width: 60rpx;
			// 	margin-left: 10rpx;
			// }
			.name-box{
				width: calc(100% - 100rpx);
				overflow: hidden;
				word-wrap: break-word;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
		.select-img{
			width: 32rpx;
		}
	}
	.select-foot-btn{
		width: calc(100% - 64rpx);
		margin-top: 20rpx;
	}
}
</style>
