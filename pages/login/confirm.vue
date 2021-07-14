<template>
  <view id="confirm">
    <view class="returnArea" @click="goRegiester">
      <image src="../../static/return.png" mode="" class="returnIcon"></image
      ><text class="returnText">Confirmation mnemonics</text>
    </view>
    <text class="tipsInfo"
      >Please choose the appropriate mnemonic words to ensure the correct
      order</text
    >
    <view class="writeArea">
      <view class="writeArea-item" v-for="item in writeArr" :key="item.id">
        <text>{{ item.id }}.</text>
        <view
          :class="
            item.content.length == 0
              ? 'writeArea-item-main'
              : 'writeArea-item-main-writed'
          "
          @click="deleteWrited(item)"
        >
          {{ item.content }}
        </view>
      </view>
    </view>
    <view class="chooseArea">
      <view
        v-for="item in chooseArr"
        :key="item.id"
        :class="
          item.isSlected == true
            ? 'chooseArea-item-selected'
            : 'chooseArea-item'
        "
        @click="choose(item)"
      >
        {{ item.content }}
      </view>
    </view>
    <view class="footerArea">
      <button type="primary" @click="login" class="login">Sign in</button>
      <text class="promptInfo" v-show="inputCheck"
        >The order of mnemonic words is wrong, please re-enter</text
      >
    </view>
  </view>
</template>

<script>
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const util = require("ethereumjs-util");

export default {
  data() {
    return {
      writeArr: [
        {
          id: 1,
          content: "",
        },
        {
          id: 2,
          content: "",
        },
        {
          id: 3,
          content: "",
        },
        {
          id: 4,
          content: "",
        },
        {
          id: 5,
          content: "",
        },
        {
          id: 6,
          content: "",
        },
        {
          id: 7,
          content: "",
        },
        {
          id: 8,
          content: "",
        },
        {
          id: 9,
          content: "",
        },
        {
          id: 10,
          content: "",
        },
        {
          id: 11,
          content: "",
        },
        {
          id: 12,
          content: "",
        },
      ],
      chooseArr: [],
      originMnemonicArr: [],
      mnemonic: "",
      loginInfo: {
        mnemonic: "",
        publicKey: "",
        address: "",
      },
      inputCheck: false,
    };
  },

  methods: {
    randomsort(a, b) {
      return Math.random() > 0.5 ? -1 : 1;
    },
    goRegiester() {
      uni.navigateBack({
        delta: 1,
      });
    },
    async login() {
      let pp = [];
      for (let i = 0; i < this.writeArr.length; i++) {
        pp.push(this.writeArr[i].content);
      }
      if (this.originMnemonicArr.toString() == pp.toString()) {
        let accountInfo = {};
        accountInfo.secret = "tuoyun";
        accountInfo.uid = this.vuex_register_info.address;
        accountInfo.name = "newUser";
        accountInfo.platform = 5;
        let _this = this;
        return uni.request({
          url: "http://47.112.160.66:10000/auth/user_register",
          method: "POST",
          data: accountInfo,
          success(res) {
            if (res.data.errCode == 0) {
              delete accountInfo.name;
              uni.request({
                url: "http://47.112.160.66:10000/auth/user_token",
                method: "POST",
                data: accountInfo,
                success(res) {
                  let userInfo = _this.vuex_register_info;
				  _this.$u.vuex('vuex_user_info',userInfo)
                  uni.setStorage({
                    key: "token",
                    data: res.data.data.token,
                    success: function () {
                      console.log("setsuccess");
                    },
                    fail: function () {
                      console.log("setfail");
                    },
                  });
                  _this.$openSdk.login(res.data.data.uid, res.data.data.token);
                },
                fail() {},
              });
            }
          },
          fail() {},
        });

        /* user_register(accountInfo).then((res) => {
					  if (res.data.errCode == 0) {
					    delete accountInfo.name;
					    user_token(accountInfo).then(async (res) => {
					      let userInfo = this.vuex_register_info;
						  _this.$u.vuex('vuex_user_info',userInfo)
					      await sessionStorage.setItem("token", res.data.data.token);
					      await uni.setStorage({
					        key: "token",
					        data: res.data.data.token,
					        success: function () {
					          console.log("setsuccess");
					        },
					        fail: function () {
					          console.log("setfail");
					        },
					      });
					      uni.switchTab({
					        url: "/pages/conversation/home",
					      });
					    });
					  }
					}); */
      } else {
        this.inputCheck = true;
        console.log(this.inputCheck);
        let _this = this;
        setTimeout(() => {
          _this.inputCheck = false;
        }, 5000);
      }
    },
    deleteWrited(e) {
      let deleteElement = e;
      for (let y = 0; y < this.chooseArr.length; y++) {
        if (this.chooseArr[y].content == deleteElement.content) {
          this.chooseArr[y].isSlected = false;
          deleteElement.content = "";
          break;
        }
      }
    },
    async choose(e) {
      await this.kk(e);
      for (let x = 0; x < this.writeArr.length; x++) {
        for (let y = 0; y < this.chooseArr.length; y++) {
          if (
            this.writeArr[x].length != 0 &&
            this.writeArr[x].content == this.chooseArr[y].content
          ) {
            this.chooseArr[y].isSlected = true;
          }
        }
      }
    },
    kk(e) {
      let chooseValue = e;
      chooseValue.isSlected = true;
      for (let i = 0; i < this.writeArr.length; i++) {
        if (this.writeArr[i].content.length == 0) {
          this.writeArr[i].content = chooseValue.content;
          break;
        }
      }
    },
  },
  computed: {},
  mounted() {
    this.originMnemonicArr = this.vuex_register_info.mnemonic.split(" ");
    // let randomArr = this.vuex_register_info.mnemonic.split(" ").sort(this.randomsort);
    let randomArr = this.vuex_register_info.mnemonic.split(" ");

    for (let i = 0; i < randomArr.length; i++) {
      let chooseArrItem = {};
      chooseArrItem.id = i;
      chooseArrItem.content = randomArr[i];
      this.chooseArr.push(chooseArrItem);
    }
  },
};
</script>

<style lang="scss" scoped>
#confirm {
  background-image: url(../../static/confirmBackground.png);
  background-size: 100% 100%;
  padding: 0 48rpx;
  display: flex;
  flex-direction: column;

  .returnArea {
    display: flex;
    align-items: center;
    margin-top: 56rpx;

    .returnIcon {
      width: 28rpx;
      height: 50rpx;
    }

    .returnText {
      font-size: 48rpx;
      font-weight: 600;
      color: #1d6bed;
      margin-left: 20rpx;
    }
  }

  .tipsInfo {
    font-size: 32rpx;
    font-weight: 400;
    color: #333333;
    margin-top: 24rpx;
  }

  .writeArea {
    width: 590rpx;
    height: 550rpx;
    background-color: #fff;
    box-shadow: 0 4rpx 26rpx 0 rgba(0, 84, 223, 0.3);
    margin: 0 auto;
    margin-top: 44rpx;
    padding: 40rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .writeArea-item {
      display: flex;
      align-items: center;

      .writeArea-item-main {
        width: 200rpx;
        height: 56rpx;
        border: 1px dashed #999999;
        border-radius: 8rpx;
        margin-left: 12rpx;
      }

      .writeArea-item-main-writed {
        width: 200rpx;
        height: 56rpx;
        border: 1px solid #1d6bed;
        border-radius: 8rpx;
        margin-left: 12rpx;
        text-align: center;
        line-height: 56rpx;
      }
    }
  }

  .chooseArea {
    width: 660rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 60rpx;

    .chooseArea-item {
      width: 180rpx;
      height: 80rpx;
      margin-top: 20rpx;
      box-shadow: 0 2rpx 14rpx 0 rgba($color: #004ac6, $alpha: 0.46);
      border-radius: 8rpx;
      line-height: 80rpx;
      text-align: center;
    }

    .chooseArea-item-selected {
      width: 180rpx;
      height: 80rpx;
      margin-top: 20rpx;
      box-shadow: 0 2rpx 14rpx 0 rgba($color: #004ac6, $alpha: 0.46);
      border-radius: 8rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: skyblue;
      pointer-events: none;
      background-color: rgba($color: #004ac6, $alpha: 0.46);
    }
  }

  .footerArea {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 90rpx;
    margin-bottom: 180rpx;

    .login {
      width: 320rpx;
      height: 80rpx;
      padding: 0;
      font-size: 32rpx;
      font-weight: 600;
      color: #ffffff;
      line-height: 80rpx;
      margin-bottom: 60rpx;
    }

    .promptInfo {
      font-size: 36rpx;
      font-weight: 400;
      color: #ff0000;
    }
  }
}
</style>
