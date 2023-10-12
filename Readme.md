<p align="center">
    <a href="https://www.openim.online">
        <img src="./doc/openim-logo.gif" width="60%" height="30%"/>
    </a>
</p>

# OpenIM Uniapp Demo 💬

<p>
  <a href="https://doc.rentsoft.cn/">OpenIM Docs</a>
  •
  <a href="https://github.com/openimsdk/open-im-server">OpenIM Server</a>
  •
  <a href="https://github.com/openimsdk/open-im-sdk-uniapp">open-im-sdk-uniapp</a>
  •
  <a href="https://github.com/openimsdk/openim-sdk-core">openim-sdk-core</a>
</p>

<br>

OpenIM Uniapp Demo 是一个基于本地插件、OpenIM Server 和 Uniapp 的开源即时通讯应用程序。它演示了如何使用 OpenIM 将即时消息功能快速集成到任何单一应用程序中。

## 技术栈 🛠️

- 这是一个 [`Uniapp`](https://uniapp.dcloud.net.cn/) 项目， 依赖于 [`HBuilderX`](https://www.dcloud.io/hbuilderx.html)。

## 在线体验 🌐

前往 [下载](https://www.xcxwo.com/IM-UCER) APP 并体验。 

## 本地开发 🛠️

> 推荐使用Hbuilder X 3.8.12.20230817

按照以下步骤设置本地开发环境 :

1. 运行 `npm install` 安装所有依赖项。

2. 在以下文件中将配置文件修改为您自己的 AppID :
    > 使用Hbuilder打开manifest.json

    ![](./doc/config.png)

3. 如果你想使用定位功能，在以下文件中将配置文件修改为您自己的高德地图 appkey :
   > 使用Hbuilder打开manifest.json

    ![](./doc/config2.png)

4. 在以下文件中将请求地址修改为您自己的OpenIM Server IP:
   > 注意: 需要先 [部署](https://github.com/openimsdk/open-im-server#rocket-quick-start) OpenIM Server, OpenIM Server 默认端口为 10001、10002、10008。
   - `common -> config.js`

     ```js
      const wsUrl = "ws://your-server-ip:10001"
      const apiUrl = "http://your-server-ip:10002"
      const registerUrl = "http://your-server-ip:10008"
     ```

5. 选择云插件或本地插件

    > 由于是基于原生插件开发的，所以只支持 Android 和 iOS。

    ![](./doc/select.png)

    > 选择云插件需要选择您的项目 Appid 和输入 Android 包名称。

    ![](./doc/plugin.png)

6. 云打包自定义调试基座

  - 菜单 -> 运行 -> 运行到手机或模拟器 -> 制作自定义调试基座

  ![](./doc/dev.png)
  

7. 在真实的机器或模拟器上运行

  > 建议优先使用真实的机器进行开发。

  - 菜单 -> 运行 -> 运行到手机或模拟器 -> 运行到Android App基座

  ![](./doc/run_dev.png)

## 打包发布 🚀

### 使用原生App 云打包

  - 菜单 -> 发行 -> 原生App-云打包

  ![](./doc/build.png)


## 社区参与 :busts_in_silhouette:

- 📚 [OpenIM 社区](https://github.com/OpenIMSDK/community)
- 💕 [OpenIM 兴趣小组](https://github.com/Openim-sigs)
- 🚀 [加入我们的Slack社区](https://join.slack.com/t/openimsdk/shared_invite/zt-22720d66b-o_FvKxMTGXtcnnnHiMqe9Q)
- :eyes: [加入我们的微信社区](https://openim-1253691595.cos.ap-nanjing.myqcloud.com/WechatIMG20.jpeg)

## 社区会议 :calendar:

我们希望任何人都能参与到我们的社区并贡献代码，我们提供礼物和奖励，我们欢迎您每周四晚上加入我们。

我们的会议在 [OpenIM Slack](https://join.slack.com/t/openimsdk/shared_invite/zt-22720d66b-o_FvKxMTGXtcnnnHiMqe9Q) 🎯, 然后你可以搜索 Open-IM-Server 频道加入。

我们把每一次 [双周会](https://github.com/orgs/OpenIMSDK/discussions/categories/meeting) 记录在 [GitHub discussions](https://github.com/openimsdk/open-im-server/discussions/categories/meeting), 我们的历史会议记录以及会议回放可以在 [Google Docs :bookmark_tabs:](https://docs.google.com/document/d/1nx8MDpuG74NASx081JcCpxPgDITNTpIIos0DS6Vr9GU/edit?usp=sharing)。

## 谁在使用OpenIM :eyes:

查看我们的 [用户案例](https://github.com/OpenIMSDK/community/blob/main/ADOPTERS.md)。 不要犹豫，留下 [评论](https://github.com/openimsdk/open-im-server/issues/379) 并分享您的用例。

## 授权许可 :page_facing_up:

OpenIM 是在 Apache 2.0 许可下授权的. 查看 [LICENSE](https://github.com/openimsdk/open-im-server/tree/main/LICENSE) 获取完整的许可文本。