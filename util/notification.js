//设为true代表常驻状态栏
// this.mNotificationBuild.setOngoing(false);
//设置通知栏标题
// this.mNotificationBuild.setContentTitle(defaultTitle);
//设置通知栏显示内容
// this.mNotificationBuild.setContentText(defaultContent);
//设置通知栏点击意图
// this.mNotificationBuild.setContentIntent(getDefalutIntent(Notification.FLAG_AUTO_CANCEL))
//通知首次出现在通知栏，带上升动画效果的
// this.mNotificationBuild.setTicker(defaultTicker);
//设置通知集合的数量
// this.mNotificationBuild.setNumber(defaultNumber)
//通知产生的时间，会在通知信息里显示，一般是系统获取到的时间
// this.mNotificationBuild.setWhen(System.currentTimeMillis());
//设置该通知优先级
// this.mNotificationBuild.setPriority(Notification.PRIORITY_DEFAULT);
//设置这个标志当用户单击面板就可以让通知将自动取消
// this.mNotificationBuild.setAutoCancel(true);
//向通知添加声音、闪灯和振动效果的最简单、最一致的方式是使用当前的用户默认设置，使用defaults属性，可以组合
//Notification.DEFAULT_ALL  Notification.DEFAULT_SOUND Notification.DEFAULT_VIBRATE
// console.log('默认:'+plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
// this.mNotificationBuild.setDefaults(plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
//默认的push图标
// this.mNotificationBuild.setSmallIcon(17301620);//设置小图标
//https://www.cnblogs.com/penghuster/p/4909930.html
// const R = plus.android.importClass("android.R");
// this.mNotificationBuild.setSmallIcon(R.drawable.stat_sys_download);
export default class NotificationUtil {
  notifyManager;
  mNotificationBuild;
  Notification;
  defaultTitle = "通知栏标题";
  defaultContent = "通知内容";
  defaultTicker = "通知提示";
  defaultNotifyId = 1000;

  constructor() {
    this.initNotification();
  }

  initNotification = () => {
    if (plus.os.name != "Android") {
      return;
    }
    //当前版本号
    const SystemVersion = plus.os.version;
    const Context = plus.android.importClass("android.content.Context");
    const main = plus.android.runtimeMainActivity();
    const NotificationManager = plus.android.importClass(
      "android.app.NotificationManager",
    );
    const nm = main.getSystemService(Context.NOTIFICATION_SERVICE);
    // Notification build 要android api16以上才能使用(4.1.2以上)
    if (this.compareVersion("4.1.1", SystemVersion) == true) {
      this.Notification = plus.android.importClass("android.app.Notification");
    } else {
      this.Notification = plus.android.importClass(
        "android.support.v4.app.NotificationCompat",
      );
    }
    if (this.Notification) {
      const Build = plus.android.importClass("android.os.Build");
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        //android8.0及以上需设置通知渠道才能显示通知
        //创建通知渠道
        const name = "渠道名称1";
        const description = "渠道描述1";
        const channelId = "channelId1"; //渠道id
        // const importance = NotificationManager.IMPORTANCE_DEFAULT;//重要性级别
        // const importance = NotificationManager.IMPORTANCE_HIGH;//重要性级别
        const importance = NotificationManager.IMPORTANCE_LOW; //重要性级别
        const NotificationChannel = plus.android.importClass(
          "android.app.NotificationChannel",
        );
        const mChannel = new NotificationChannel(channelId, name, importance);
        mChannel.setDescription(description); //渠道描述
        mChannel.setDescription("渠道描述1"); //渠道描述
        mChannel.enableLights(false); //是否显示通知指示灯
        mChannel.enableVibration(false); //是否振动
        nm.createNotificationChannel(mChannel); //创建通知渠道

        this.notifyManager = nm;
        this.mNotificationBuild = new this.Notification.Builder(
          main,
          channelId,
        );
      } else {
        this.notifyManager = nm;
        this.mNotificationBuild = new this.Notification.Builder(main);
      }
    }
  };

  createNotification = (config) => {
    let { title, content, tickerTips, notifyId } = config;
    if (!this.mNotificationBuild || !this.notifyManager) {
      return;
    }
    notifyId = typeof notifyId == "number" ? notifyId : this.defaultNotifyId;
    title = title || this.defaultTitle;
    content = content || this.defaultContent;
    tickerTips = tickerTips || this.defaultTicker;
    this.mNotificationBuild.setContentTitle(title);
    this.mNotificationBuild.setContentText(content);
    this.mNotificationBuild.setTicker(tickerTips);
    //默认有声音
    this.mNotificationBuild.setDefaults(this.Notification.DEFAULT_SOUND);
    this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
  };

  createProgress = (config) => {
    let {
      progress,
      title,
      content,
      tickerTips,
      notifyId,
      intentList,
      isPause,
    } = config;
    if (!this.mNotificationBuild || !this.notifyManager) {
      return;
    }
    notifyId = typeof notifyId == "number" ? notifyId : this.defaultNotifyId;
    title = title || "APP更新包";
    content = content || `正在下载...${progress}%`;
    tickerTips = tickerTips || "进度提示";
    this.mNotificationBuild.setContentTitle(title);
    this.mNotificationBuild.setContentText(content);
    this.mNotificationBuild.setTicker(tickerTips);

    const R = plus.android.importClass("android.R");
    this.mNotificationBuild.setSmallIcon(
      isPause
        ? R.drawable.stat_sys_download_done
        : R.drawable.stat_sys_download,
    );

    if (intentList) {
      const pendingIntent = this.createIntent(notifyId, intentList);
      this.mNotificationBuild.setContentIntent(pendingIntent);
    }

    /*
	如果为确定的进度条：调用setProgress(max, progress, false)来设置通知，在更新进度的时候在此发起通知更新progress，并且在下载完成后要移除进度条，通过调用setProgress(0, 0, false)既可。
	如果为不确定（持续活动）的进度条，这是在处理进度无法准确获知时显示活动正在持续，所以调用setProgress(0, 0, true) ，操作结束时，调用setProgress(0, 0, false)并更新通知以移除指示条
	*/
    //进度条显示时,默认无声音
    this.mNotificationBuild.setDefaults(0);
    this.mNotificationBuild.setProgress(100, progress, false);
    this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
  };

  compProgressNotification = (config) => {
    let { title, content, notifyId, intentList } = config;
    if (!this.mNotificationBuild || !this.notifyManager) {
      return;
    }
    notifyId = typeof notifyId == "number" ? notifyId : this.defaultNotifyId;
    title = title || "APP更新包";
    content = content || "下载完毕!";

    const R = plus.android.importClass("android.R");
    this.mNotificationBuild.setSmallIcon(R.drawable.stat_sys_download_done);

    this.mNotificationBuild.setContentTitle(title);
    this.mNotificationBuild.setContentText(content);
    this.mNotificationBuild.setAutoCancel(true);
    this.mNotificationBuild.setProgress(0, 0, false); //移除进度条

    if (intentList) {
      const pendingIntent = this.createIntent(notifyId, intentList);
      this.mNotificationBuild.setContentIntent(pendingIntent);
    }

    //默认有声音
    // this.mNotificationBuild.setDefaults(plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
    this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
  };

  clearNotification = (notifyId) => {
    notifyId = typeof notifyId == "number" ? notifyId : this.defaultNotifyId;
    if (this.notifyManager) {
      this.notifyManager.cancel(notifyId);
    }
  };

  clearAllNotification = () => {
    if (this.notifyManager) {
      this.notifyManager.cancelAll();
    }
  };

  createIntent = (notifyId, intentList) => {
    const main = plus.android.runtimeMainActivity();
    const Intent = plus.android.importClass("android.content.Intent");
    const PendingIntent = plus.android.importClass("android.app.PendingIntent");
    const intent = new Intent(main, main.getClass());
    intentList.map((item) => {
      intent.putExtra(item[0], item[1]);
    });
    return PendingIntent.getActivity(
      main,
      notifyId,
      intent,
      PendingIntent.FLAG_CANCEL_CURRENT,
    );
  };
  compareVersion = (oldVersion, nowVersion) => {
    if (!oldVersion || !nowVersion || oldVersion == "" || nowVersion == "") {
      return false;
    }
    const oldVersionA = oldVersion.split(".", 4);
    const nowVersionA = nowVersion.split(".", 4);
    for (const i = 0; i < oldVersionA.length && i < nowVersionA.length; i++) {
      const strOld = oldVersionA[i];
      const numOld = parseInt(strOld);
      const strNow = nowVersionA[i];
      const numNow = parseInt(strNow);
      if (numNow > numOld /*||strNow.length>strOld.length*/) {
        return true;
      } else if (numNow < numOld) {
        return false;
      }
    }
    if (
      nowVersionA.length > oldVersionA.length &&
      0 == nowVersion.indexOf(oldVersion)
    ) {
      return true;
    }
  };
}
