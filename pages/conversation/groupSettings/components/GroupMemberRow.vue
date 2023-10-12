<template>
  <view @click="toMemberList" class="member_row">
    <view class="member_list">
      <view class="member_item" v-for="(member, index) in groupMemberList">
        <my-avatar
          :src="member.faceURL"
          :desc="member.nickname"
          :key="member.userID"
          size="48"
        />
        <view class="ower" v-if="member.roleLevel === 100">群主</view>
        <text class="member_item_name">{{ member.nickname }}</text>
      </view>
      <view class="member_item">
        <image
          style="width: 48px; height: 48px; min-width: 48px"
          @click.stop="inviteMember"
          src="@/static/images/group_setting_invite.png"
          alt=""
        />
        <text class="member_item_name">增加</text>
      </view>
      <view class="member_item" v-if="isAdmin || isOwner">
        <image
          style="width: 48px; height: 48px; min-width: 48px"
          @click.stop="kickMember"
          src="@/static/images/group_setting_remove.png"
          alt=""
        />
        <text class="member_item_name">移出</text>
      </view>
    </view>
    <view @click="toMemberList" class="more">
      <text>查看全部群成员({{ memberCount }})</text>
      <view class="more_right">
        <u-icon name="arrow-right" color="#999" size="18" />
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, { GroupMemberRole } from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import { ContactChooseTypes, GroupMemberListTypes } from "@/constant";
export default {
  name: "",
  components: {
    MyAvatar,
    SettingItem,
  },
  props: {
    isNomal: Boolean,
    memberCount: Number,
    groupID: String,
    groupMemberList: Array,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      "storeCurrentConversation",
      "storeCurrentMemberInGroup",
      "storeCurrentGroup",
    ]),
    isOwner() {
      return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Owner;
    },
    isAdmin() {
      return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Admin;
    },
  },
  methods: {
    toMemberList() {
      uni.navigateTo({
        url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Preview}&groupID=${this.groupID}`,
      });
    },
    inviteMember() {
      uni.navigateTo({
        url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Invite}&groupID=${this.groupID}`,
      });
    },
    kickMember() {
      uni.navigateTo({
        url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Kickout}&groupID=${this.groupID}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.member_row {
  @include colBox(false);
  padding: 36rpx 36rpx 0;
  margin: 24rpx;
  background-color: #fff;
  color: $uni-text-color;
  border-radius: 6px;
  overflow: hidden;

  .member_title {
    @include btwBox();

    .member_desc {
      @include vCenterBox();
      font-size: 26rpx;
    }
  }

  .member_list {
    @include vCenterBox();
    flex-wrap: wrap;

    .member_item {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 8rpx 14rpx;

      &_name {
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #8e9ab0;
        max-width: 48px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .ower{
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 34rpx;
    font-size: 24rpx;
    position: absolute;
    color: #0089FF;
    background: #E8EAEF;
    border-radius: 12rpx 12rpx 12rpx 12rpx;
  }

  .more {
    @include btwBox();
    margin-top: 20rpx;
    padding: 20rpx 0rpx 20rpx;
    border-top: 1px solid rgba(153, 153, 153, 0.2);

    .more_right {
      @include vCenterBox();
    }
  }
}
</style>
