export const calculateDiffTime = (start_time) => {
	if (!parseInt(start_time)) return "-";
	const endTime = Math.round(new Date() / 1000);

	const timeDiff = endTime - start_time
	const day = parseInt(timeDiff / 86400);
	// const hour = parseInt((timeDiff % 86400) / 3600);
	// const minute = parseInt((timeDiff % 3600) / 60);
	return day;
}

export const formatDate = (timestamp) => {
	const now = new Date(timestamp)
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const date = now.getDate();
	const hour = now.getHours();
	let minute = now.getMinutes();
	if(minute.toString().length===1) minute = "0"+minute
	let second = now.getSeconds();
	if(second.toString().length===1) second = "0"+second
	const str1 = year + "-" + month + "-" + date
	const str2 = hour + ":" + minute + ":" + second
	return [year,month,date,str1, str2];
}

export const asyncGetImgInfo = (url) =>{
	return new Promise((resolve,reject)=>{
		uni.getImageInfo({
			src:url,
			success: (res) => {
				resolve(res)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}


export const moveToDoc = (tempFilePaths) =>{
	return Promise((resolve,reject)=>{
		plus.io.resolveLocalFileSystemURL(tempFilePaths,
		(tmpEntry)=>{
			plus.io.resolveLocalFileSystemURL("_doc/",
			(docEntry)=>{
				caEntry.getDirectory("file",{create:true},
				(fileEntry)=>{
					tmpEntry.moveTo(fileEntry,_,(entrys)=>{
						resolve(entrys)
					})
				},(err)=>{
					console.log(err);
					reject(err)
				})
			},
			(err)=>{
				console.log(err);
				reject(err)
			})
		},
		(err)=>{
			console.log(err);
			reject(err)
		})
	})
}

export const randomString = (len)=> {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　var maxPos = $chars.length;
　　var pwd = '';
　　for ( let i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

export const getAndroidVideoThumb = (path) => {  
        path=plus.io.convertLocalFileSystemURL(path);
		console.log(path);
        var pathns=path.split(".");  
        pathns[pathns.length-1]="jpg";  
        var imgpath=pathns.join(".");  
        var File = plus.android.importClass("java.io.File");  
        var file = new File(imgpath);  
        if(file.exists())return "file://"+plus.io.convertAbsoluteFileSystem(imgpath);  
        var FileOutputStream  = plus.android.importClass("java.io.FileOutputStream");  
        var outputStream = new FileOutputStream(file);  
        var Bitmap = plus.android.importClass("android.graphics.Bitmap");  
        var thum=plus.android.invoke("android.media.ThumbnailUtils","createVideoThumbnail",path,1);  
        var result= plus.android.invoke(thum,"compress",Bitmap.CompressFormat.JPEG,100,outputStream);  
        if(!result)return null;  
        plus.android.invoke(thum,"recycle");  
        thum=null;  
        plus.android.invoke(outputStream,"flush");  
        plus.android.invoke(outputStream,"close");  
        return "file://"+plus.io.convertAbsoluteFileSystem(imgpath);  
}