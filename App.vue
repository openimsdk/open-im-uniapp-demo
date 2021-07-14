<script>
import store from "store/index.js";
export default {
  data() {
    return {
      flag: false,
      dbDir: "",
    };
  },
  methods: {
    fileInfo() {
      let _this = this;
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function (fs) {
        fs.root.getDirectory(
          "user",
          {
            create: true,
          },
          (entry) => {
            _this.initAsync(entry.fullPath);
          },
          (error) => {
            console.log(error);
          }
        );
      });
    },
    initAsync(dbDir) {
      const obj = {
        platform: 1,
        ipApi: "https://open-im.rentsoft.cn",
        ipWs: "wss://open-im.rentsoft.cn/wss",
        dbDir,
      };
      this.flag = this.$openSdk.initSDK(JSON.stringify(obj));
    },
    initFriendListener() {
      this.$openSdk.setFriendListener();
    },
    setFriendListener() {
      this.$globalEvent.addEventListener("onBlackListAdd", (params) => {
        console.log(params);
      });
      this.$globalEvent.addEventListener("onBlackListDeleted", (params) => {
        console.log(params);
      });
      this.$globalEvent.addEventListener(
        "onFriendApplicationListDeleted",
        (params) => {
          console.log(params);
        }
      );
    },
  },
  onLaunch: function () {
    this.$openSdk.setConversationListener();
    this.$openSdk.addAdvancedMsgListener();
	this.$openSdk.setGroupListener()
    this.fileInfo();
    this.initFriendListener();
    this.setFriendListener();
  },
};
</script>

<style lang="scss">
@import "uview-ui/index.scss";

page {
  height: 100% !important;
}

.uni-navbar,
.u-navbar{
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
}
</style>
