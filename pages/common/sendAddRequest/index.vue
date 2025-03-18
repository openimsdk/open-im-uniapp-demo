<template>
  <view class="request_join_container">
    <custom-nav-bar :title="isGroup ? '群聊验证' : '好友验证'">
      <view class="top_right_btn" slot="more">
        <u-button @click="sendRequest" text="发送" type="primary"></u-button>
      </view>
    </custom-nav-bar>

    <text class="title">{{ `发送${isGroup ? "入群" : "好友"}申请` }}</text>

    <view class="input_container">
      <u--textarea
        height="120"
        v-model="reason"
        border="none"
        placeholder="请输入内容"
        maxlength="20"
        count
      >
      </u--textarea>
    </view>
  </view>
</template>

<script>
import IMSDK, { GroupJoinSource } from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { navigateToDesignatedConversation } from "@/util/imCommon";

export default {
  components: {
    CustomNavBar,
  },
  data() {
    return {
      reason: "",
      sourceID: "",
      isGroup: false,
      isScan: false,
      notNeedVerification: false,
      sessionType: 0,
    };
  },
  onLoad(options) {
    const { isGroup, sourceID, isScan, notNeedVerification, sessionType } =
      options;
    this.isGroup = JSON.parse(isGroup);
    this.isScan = JSON.parse(isScan);
    this.sourceID = sourceID;
    this.notNeedVerification = JSON.parse(notNeedVerification);
    this.sessionType = sessionType ?? 0;
  },
  methods: {
    sendRequest() {
      let func;
      if (this.isGroup) {
        const joinSource = this.isScan
          ? GroupJoinSource.QrCode
          : GroupJoinSource.Search;
        func = IMSDK.asyncApi(IMSDK.IMMethods.JoinGroup, IMSDK.uuid(), {
          groupID: this.sourceID,
          reqMsg: this.reason,
          joinSource,
        });
      } else {
        func = IMSDK.asyncApi(IMSDK.IMMethods.AddFriend, IMSDK.uuid(), {
          toUserID: this.sourceID,
          reqMsg: this.reason,
        });
      }
      func
        .then(() => {
          uni.$u.toast(this.notNeedVerification ? "你已加入该群" : "发送成功");
          setTimeout(() => {
            if (this.notNeedVerification) {
              navigateToDesignatedConversation(
                this.sourceID,
                Number(this.sessionType),
              ).catch(() => this.showToast("获取会话信息失败"));
            } else {
              uni.navigateBack();
            }
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
          uni.$u.toast("发送失败");
        });
    },
    showToast(message) {
      this.$refs.uToast.show({
        message,
      });
    },
  },
};
</script>

<style lang="scss">
.request_join_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .top_right_btn {
    margin-right: 44rpx;

    .u-button {
      height: 48rpx;
    }
  }

  .title {
    font-size: 28rpx;
    color: #999;
    margin: 24rpx 44rpx;
  }

  .input_container {
    /deep/.u-textarea {
      padding: 24rpx 44rpx !important;
    }
  }
}
</style>
