<template>
  <view class="group_card_container">
    <custom-nav-bar title="" />
    <u-toast ref="uToast"></u-toast>

    <view class="main">
      <view class="base_info">
        <my-avatar :src="sourceGroupInfo.faceURL" :isGroup="true" size="48" />
        <view>
          <view class="group_name">
            <text>{{ sourceGroupInfo.groupName }}</text>
            <text v-if="!!sourceGroupInfo.memberCount"
              >（{{ sourceGroupInfo.memberCount }}）</text
            >
          </view>
          <view class="create_time">
            <u-icon name="clock" color="#999" size="14"></u-icon>
            <text>{{ getCreateTime }}</text>
          </view>
        </view>
      </view>

      <view
        v-if="!!sourceGroupInfo.memberCount"
        @click="toMemberList"
        class="member_row info_row"
      >
        <view class="member_desc">
          <text>群成员</text>
          <text class="member_count">{{
            `${sourceGroupInfo.memberCount}人`
          }}</text>
          <u-icon name="arrow-right" color="#999" size="18"></u-icon>
        </view>
        <view class="member_list">
          <my-avatar
            v-for="member in getRenderMemberList"
            :key="member.userID"
            class="member_item"
            size="42"
            :src="member.faceURL"
            :desc="member.nickname"
          ></my-avatar>
          <u-avatar
            bgColor="#5496EB"
            icon="more-dot-fill"
            shape="square"
            size="42"
          ></u-avatar>
        </view>
      </view>

      <view class="info_row">
        <user-info-row-item lable="群ID号" :content="sourceGroupInfo.groupID" />
      </view>
    </view>

    <view class="action_row">
      <u-button type="primary" v-if="!isJoinedGroup" @click="joinGroup"
        >申请加入该群</u-button
      >
      <u-button type="primary" v-else @click="chatingInGroup">发消息</u-button>
    </view>
  </view>
</template>

<script>
import { GroupMemberListTypes } from "@/constant";
import { navigateToDesignatedConversation } from "@/util/imCommon";
import IMSDK, {
  GroupVerificationType,
  SessionType,
} from "openim-uniapp-polyfill";
import dayjs from "dayjs";
import MyAvatar from "@/components/MyAvatar/index.vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserInfoRowItem from "../userCard/components/UserInfoRowItem.vue";

import userIcon from "static/images/contact_my_friend.png";

export default {
  components: {
    CustomNavBar,
    MyAvatar,
    UserInfoRowItem,
  },
  data() {
    return {
      sourceID: "",
      isScan: false,
      sourceGroupInfo: {},
      groupMemberList: [],
    };
  },
  computed: {
    isJoinedGroup() {
      return (
        this.$store.getters.storeGroupList.findIndex(
          (group) => group.groupID === this.sourceID,
        ) !== -1
      );
    },
    getCreateTime() {
      return dayjs(this.sourceGroupInfo.createTime).format("YYYY-MM-DD");
    },
    getRenderMemberList() {
      if (this.isJoinedGroup) {
        this.groupMemberList;
        return this.groupMemberList;
      }
      const memberCount = this.sourceGroupInfo.memberCount ?? 0;
      return new Array(memberCount >= 6 ? 6 : memberCount)
        .fill(1)
        .map((item, idx) => ({
          userID: idx,
          src: userIcon,
        }));
    },
  },
  onLoad(options) {
    const { sourceID, sourceInfo, isScan } = options;
    this.isScan = !!isScan;
    if (sourceID) {
      this.sourceID = sourceID;
      this.getSourceGroupInfo();
    } else {
      const info = JSON.parse(sourceInfo);
      this.sourceID = info.groupID;
      this.sourceGroupInfo = {
        ...info,
      };
    }
    this.getGroupMemberList();
  },
  methods: {
    toMemberList() {
      if (this.isJoinedGroup) {
        this.$store.dispatch("conversation/getCurrentGroup", this.sourceID);
        this.$store.dispatch(
          "conversation/getCurrentMemberInGroup",
          this.sourceID,
        );
        uni.navigateTo({
          url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Preview}&groupID=${this.sourceID}`,
        });
      }
    },
    joinGroup() {
      uni.$u.route("/pages/common/sendAddRequest/index", {
        isGroup: true,
        sourceID: this.sourceID,
        isScan: this.isScan,
        notNeedVerification:
          this.sourceGroupInfo.needVerification ===
          GroupVerificationType.AllNot,
        sessionType: SessionType.WorkingGroup,
      });
    },
    chatingInGroup() {
      navigateToDesignatedConversation(
        this.sourceID,
        SessionType.WorkingGroup,
      ).catch(() => this.showToast("获取会话信息失败"));
    },
    async getSourceGroupInfo() {
      let info = null;
      if (this.isJoinedGroup) {
        info = this.$store.getters.storeGroupList.find(
          (group) => group.groupID === this.sourceID,
        );
      } else {
        try {
          const { data } = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetSpecifiedGroupsInfo,
            IMSDK.uuid(),
            [this.sourceID],
          );
          info = data[0] ?? {};
        } catch (e) {
          info = {};
        }
      }
      this.sourceGroupInfo = {
        ...info,
      };
    },
    getGroupMemberList() {
      if (this.isJoinedGroup) {
        IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
          groupID: this.sourceID,
          filter: 0,
          offset: 0,
          count: 6,
        }).then(({ data }) => {
          this.groupMemberList = [...data];
        });
      }
    },
    showToast(message) {
      this.$refs.uToast.show({
        message,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.group_card_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .base_info {
    @include vCenterBox();
    background-color: #fff;
    padding: 44rpx;
    margin-bottom: 18rpx;

    .u-avatar {
      margin-right: 24rpx;
    }

    .group_name {
      display: flex;
      margin-bottom: 12rpx;
    }

    .create_time {
      @include vCenterBox();
      justify-content: center;
      color: #adadad;
      font-size: 26rpx;

      .u-icon {
        margin-right: 12rpx;
      }
    }
  }

  .member_row {
    padding: 24rpx 44rpx;

    .member_desc {
      margin-bottom: 24rpx;
      position: relative;

      .member_count {
        font-size: 28rpx;
        color: #adadad;
        margin-left: 24rpx;
      }

      .u-icon {
        position: absolute;
        right: 0;
        top: 0;
      }
    }

    .member_list {
      display: flex;

      .member_item {
        margin-right: 12rpx;

        &:nth-child(7) {
          margin-right: 0;
        }
      }
    }
  }

  .info_row {
    background-color: #fff;
    margin-bottom: 24rpx;

    /deep/ .content {
      color: #adadad;
    }
  }

  .action_row {
    background-color: #fff;
    padding: 44rpx 44rpx;
  }

  .online_state {
    @include vCenterBox();
    margin-left: 24rpx;
    font-size: 24rpx;
    color: #999;

    .dot {
      background-color: #10cc64;
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin-right: 12rpx;
    }
  }
}
</style>
