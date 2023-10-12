<template>
  <view class="tab_container">
    <!-- <view class="tabs_bar">
			<view @click="tabChange(item.idx)" v-for="item in tabs" :key="item.idx" class="tab_item">
				<img :src="activeTab === item.idx ? item.activeIcon : item.icon" alt="">
				<text>{{item.title}}</text>
			</view>
		</view> -->
    <template v-for="item in tabs">
      <setting-item
        v-if="
          !(!showGroup && item.idx === 2) &&
          !(!showConversation && item.idx === 0)
        "
        @click="tabChange(item.idx)"
        :key="item.idx"
        :title="item.title"
        :border="false"
      />
    </template>

    <view class="tab_pane" v-show="activeTab === 0">
      <choose-index-list
        @itemClick="userClick"
        :height="getListHeight"
        :indexList="indexList"
        :itemArr="itemArr"
        :showCheck="showCheck"
      />
    </view>

    <view class="tab_pane" v-show="activeTab === 1">
      <u-list class="member_list" :style="{ height: getListHeight }">
        <u-list-item v-for="(item, index) in indexList" :key="index">
          <user-item @itemClick="groupClick" :checkVisible="showCheck" />
        </u-list-item>
      </u-list>
    </view>

    <choose-index-footer v-if="showCheck" @confirm="confirm" />
  </view>
</template>

<script>
import { ContactChooseTypes } from "@/constant";
import UserItem from "@/components/UserItem/index.vue";
import ChooseIndexList from "@/components/ChooseIndexList/index.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";

export default {
  name: "",
  components: {
    UserItem,
    ChooseIndexFooter,
    ChooseIndexList,
    SettingItem,
  },
  props: {
    type: String,
  },
  data() {
    return {
      activeTab: 0,
      // card forward merge invite create_group create_work_group remove
      chooseType: "invite",
      tabs: [
        {
          idx: 0,
          title: "按好友选",
          icon: require("@/static/images/contact_choose_friend.png"),
          activeIcon: require("@/static/images/contact_choose_friend_active.png"),
        },
        {
          idx: 1,
          title: "按群聊选",
          icon: require("@/static/images/contact_choose_group.png"),
          activeIcon: require("@/static/images/contact_choose_group_active.png"),
        },
        // {
        // 	idx: 2,
        // 	title: '按架构选',
        // 	icon: require("@/static/images/contact_choose_company.png"),
        // 	activeIcon: require("@/static/images/contact_choose_company_active.png"),
        // },
      ],
    };
  },
  computed: {
    getListHeight() {
      const statusBar = uni.getWindowInfo().statusBarHeight;
      return (
        uni.getWindowInfo().safeArea.height -
        statusBar -
        58 -
        97 -
        (this.showCheck ? 72 : 0) -
        44 +
        "px"
      );
    },
    showCheck() {
      return this.type !== ContactChooseTypes.Card;
    },
  },
  methods: {
    tabChange(idx) {
      this.activeTab = idx;
    },
    groupClick() {},
    userClick() {},
    confirm() {
      // if (this.type === GroupMemberListTypes.Invite) {
      // 	IMSDK.asyncApi(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuid(), this.groupID, '', this
      // 			.choosedData.map(user => user.userID))
      // 		.then(() => this.showToast('操作成功', () => uni.navigateBack())).catch(() => this.showToast('操作失败'));
      // 	return;
      // }
    },
  },
};
</script>

<style lang="scss" scoped>
.tab_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;

  .tabs_bar {
    @include vCenterBox();
    justify-content: space-evenly;

    .tab_item {
      @include colBox(false);
      align-items: center;

      img {
        width: 50px;
        height: 50px;
      }
    }
  }

  .tab_pane {
    flex: 1;
    margin-top: 24px;

    .member_list {
      /deep/uni-scroll-view {
        max-height: 100% !important;
      }
    }

    .member_anchor {
      background-color: #f8f8f8 !important;
      border: none !important;
    }
  }
}
</style>
