<template>
  <view class="single_settings_container">
    <custom-nav-bar title="好友设置" />

    <view class="row_wrap">
      <view class="setting_row info_row">
        <view @click="toUserCard" class="user_info">
          <my-avatar
            :src="storeCurrentConversation.faceURL"
            :desc="storeCurrentConversation.showName"
            size="46"
          />
        </view>
        <view @click="invite2group" class="action">
          <image
            style="width: 46px; height: 46px"
            src="@/static/images/single_setting_add.png"
            alt=""
          />
        </view>
      </view>

      <view class="setting_row">
        <setting-item
          title="置顶联系人"
          :loading="switchLoading.pin"
          @switch="changePin"
          :switchValue="storeCurrentConversation.isPinned"
          is_switch
          :border="false"
        />
        <setting-item
          title="消息免打扰"
          :loading="switchLoading.opt"
          @switch="changeOpt($event, 2)"
          :switchValue="storeCurrentConversation.recvMsgOpt === 2"
          is_switch
          :border="false"
        />
      </view>

      <view class="setting_row" style="margin-bottom: 10vh">
        <setting-item
          @click="() => (showConfirm = true)"
          title="清空聊天记录"
          :border="false"
        />
      </view>

      <u-modal
        content="确定要清空聊天记录吗？"
        asyncClose
        :show="showConfirm"
        showCancelButton
        @confirm="confirmClear"
        @cancel="() => (showConfirm = false)"
      ></u-modal>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, { MessageReceiveOptType } from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
    SettingItem,
  },
  props: {},
  data() {
    return {
      switchLoading: {
        pin: false,
        opt: false,
        readLimit: false,
      },
      showConfirm: false,
    };
  },
  computed: {
    ...mapGetters(["storeCurrentConversation"]),
  },
  methods: {
    toUserCard() {
      uni.navigateTo({
        url: `/pages/common/userCard/index?sourceID=${this.storeCurrentConversation.userID}`,
      });
    },
    invite2group() {
      const checkedMemberList = JSON.stringify([
        {
          userID: this.storeCurrentConversation.userID,
          faceURL: this.storeCurrentConversation.faceURL,
          nickname: this.storeCurrentConversation.showName,
        },
      ]);
      uni.navigateTo({
        url: `/pages/common/createGroup/index?checkedMemberList=${checkedMemberList}`,
      });
    },
    changePin(isPinned) {
      this.switchLoading.pin = true;
      IMSDK.asyncApi(IMSDK.IMMethods.PinConversation, IMSDK.uuid(), {
        conversationID: this.storeCurrentConversation.conversationID,
        isPinned,
      })
        .then(() => uni.$u.toast("操作成功"))
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.switchLoading.pin = false));
    },
    changeOpt(notNomal, type) {
      this.switchLoading.opt = true;
      IMSDK.asyncApi(
        IMSDK.IMMethods.SetConversationRecvMessageOpt,
        IMSDK.uuid(),
        {
          conversationID: this.storeCurrentConversation.conversationID,
          opt: notNomal ? type : MessageReceiveOptType.Nomal,
        },
      )
        .then(() => uni.$u.toast("操作成功"))
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.switchLoading.opt = false));
    },
    changeReadLimit(isLimit) {
      this.switchLoading.readLimit = true;
      IMSDK.asyncApi(IMSDK.IMMethods.SetConversationPrivateChat, IMSDK.uuid(), {
        conversationID: this.storeCurrentConversation.conversationID,
        isPrivate: isLimit,
      })
        .then(() => uni.$u.toast("操作成功"))
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.switchLoading.readLimit = false));
    },
    confirmClear() {
      IMSDK.asyncApi(
        IMSDK.IMMethods.ClearConversationAndDeleteAllMsg,
        IMSDK.uuid(),
        this.storeCurrentConversation.conversationID,
      )
        .then(() => {
          uni.$u.toast("操作成功");
          this.$store.commit("message/SET_HISTORY_MESSAGE_LIST", []);
          this.$store.commit("message/SET_PREVIEW_IMAGE_LIST", []);
        })
        .catch(() => uni.$u.toast("操作失败"))
        .finally(() => (this.showConfirm = false));
    },
    chooseReadLimitTime() {
      uni.showActionSheet({
        itemList: ["1天", "1小时", "5分钟", "30s"],
        success: ({ tapIndex }) => {
          let sec = 30;
          if (tapIndex === 0) {
            sec = 86400;
          }
          if (tapIndex === 1) {
            sec = 3600;
          }
          if (tapIndex === 2) {
            sec = 300;
          }
          IMSDK.asyncApi(
            IMSDK.IMMethods.SetConversationBurnDuration,
            IMSDK.uuid(),
            {
              conversationID: this.storeCurrentConversation.conversationID,
              burnDuration: sec,
            },
          )
            .then((res) => {
              console.log(res);
            })
            .catch(() => uni.$u.toast("操作失败"));
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.single_settings_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .row_wrap {
    flex: 1;
    overflow-y: auto;
  }

  .setting_row {
    margin: 24rpx 24rpx 0 24rpx;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
  }

  .info_row {
    display: flex;
    align-items: center;
    padding: 44rpx;

    .user_info {
      @include colBox(false);
      margin-right: 36rpx;

      .user_name {
        margin-top: 20rpx;
        color: #666;
      }
    }
  }
}
</style>
