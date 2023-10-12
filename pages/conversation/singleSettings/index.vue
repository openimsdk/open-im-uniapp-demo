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

    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
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
