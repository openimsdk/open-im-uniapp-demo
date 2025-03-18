<template>
  <view class="chat_header">
    <view class="self_info">
      <my-avatar
        :src="storeSelfInfo.faceURL"
        :desc="storeSelfInfo.nickname"
        size="46"
      />
      <view class="self_info_desc">
        <view class="user_state">
          <text class="nickname">{{ storeSelfInfo.nickname }}</text>
          <view v-if="!storeReinstall">
            <view class="tag" v-if="storeIsSyncing">
              <img
                class="loading"
                style="height: 24rpx; width: 24rpx"
                src="static/images/loading.png"
                alt=""
              />
              <text class="status">同步中</text>
            </view>
            <view class="tag" v-if="connectStart == 0">
              <img
                class="loading"
                style="height: 24rpx; width: 24rpx"
                src="static/images/loading.png"
                alt=""
              />
              <text class="status">连接中</text>
            </view>
            <view class="err-tag" v-if="connectStart == -1">
              <img
                style="height: 24rpx; width: 24rpx"
                src="static/images/sync_error.png"
                alt=""
              />
              <text class="status">连接失败</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="right_action">
      <view class="call_icon"> </view>
      <view @click="showMore" class="more_icon">
        <image src="@/static/images/common_circle_add.png"></image>
      </view>
      <u-overlay
        :show="moreMenuVisible"
        @click="moreMenuVisible = false"
        opacity="0"
      >
        <view
          :style="{ top: popMenuPosition.top, right: popMenuPosition.right }"
          class="more_menu"
        >
          <view
            @click="clickMenu(item)"
            v-for="item in moreMenus"
            :key="item.idx"
            class="menu_item"
          >
            <image :src="item.icon" mode=""></image>
            <text>{{ item.title }}</text>
          </view>
        </view>
      </u-overlay>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import MyAvatar from "@/components/MyAvatar/index.vue";
import IMSDK from "openim-uniapp-polyfill";
export default {
  name: "ChatHeader",
  components: {
    MyAvatar,
  },
  props: {},
  data() {
    return {
      connectStart: -2,
      moreMenuVisible: false,
      popMenuPosition: {
        top: 0,
        right: 0,
      },
      moreMenus: [
        {
          idx: 1,
          title: "添加好友",
          icon: require("static/images/more_add_friend.png"),
        },
        {
          idx: 2,
          title: "添加群聊",
          icon: require("static/images/more_add_group.png"),
        },
        {
          idx: 3,
          title: "创建群聊",
          icon: require("static/images/more_create_group.png"),
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["storeSelfInfo", "storeIsSyncing", "storeReinstall"]),
  },
  mounted() {
    this.subscribeAll();
  },
  beforeDestroy() {
    this.unsubscribeAll();
  },
  methods: {
    setStateStart() {
      this.connectStart = 0;
    },
    setStateSuccess() {
      this.connectStart = 1;
    },
    setStateError() {
      this.connectStart = -1;
    },
    subscribeAll() {
      IMSDK.subscribe(IMSDK.IMEvents.OnConnecting, this.setStateStart);
      IMSDK.subscribe(IMSDK.IMEvents.OnConnectSuccess, this.setStateSuccess);
      IMSDK.subscribe(IMSDK.IMEvents.OnConnectFailed, this.setStateError);
    },
    unsubscribeAll() {
      IMSDK.unsubscribe(IMSDK.IMEvents.OnConnecting, this.setStateStart);
      IMSDK.unsubscribe(IMSDK.IMEvents.OnConnectSuccess, this.setStateSuccess);
      IMSDK.unsubscribe(IMSDK.IMEvents.OnConnectFailed, this.setStateError);
    },
    clickMenu({ idx }) {
      switch (idx) {
        case 1:
        case 2:
          uni.navigateTo({
            url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${
              idx === 2
            }`,
          });
          break;
        case 3:
          uni.navigateTo({
            url: `/pages/common/createGroup/index`,
          });
          break;
        default:
          break;
      }
    },
    async showMore() {
      const { right, bottom } = await this.getEl(".more_icon");
      this.popMenuPosition.right =
        uni.getWindowInfo().windowWidth - right + "px";
      this.popMenuPosition.top = bottom + "px";
      this.moreMenuVisible = true;
    },
    getEl(el) {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(el)
          .boundingClientRect((data) => {
            // 存在data，且存在宽和高，视为渲染完毕
            resolve(data);
          })
          .exec();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.chat_header {
  @include btwBox();
  padding: 36rpx 44rpx;
  margin-top: var(--status-bar-height);

  .self_info {
    @include btwBox();

    &_desc {
      @include colBox(true);
      margin-left: 24rpx;
      color: $uni-text-color;

      .company {
        @include nomalEllipsis();
        font-size: 24rpx;
        margin-bottom: 10rpx;
        max-width: 300rpx;
      }

      .user_state {
        @include vCenterBox();

        .nickname {
          @include nomalEllipsis();
          font-size: 26rpx;
          max-width: 240rpx;
        }

        .err-tag {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 152rpx;
          height: 44rpx;
          background: #ffe1dd;
          border-radius: 12rpx 12rpx 12rpx 12rpx;
          margin-left: 8rpx;
          .status {
            font-size: 24rpx;
            margin-left: 8rpx;
            font-weight: 400;
            color: #ff381f;
          }
        }

        .tag {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 152rpx;
          height: 44rpx;
          background: #f2f8ff;
          border-radius: 12rpx 12rpx 12rpx 12rpx;
          margin-left: 8rpx;

          .loading {
            animation: loading 1.5s infinite;
          }

          .status {
            font-size: 24rpx;
            margin-left: 8rpx;
            font-weight: 400;
            color: #0089ff;
          }
        }

        .online_state {
          @include vCenterBox();
          margin-left: 24rpx;
          font-size: 24rpx;

          .dot {
            background-color: #10cc64;
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            margin-right: 12rpx;
          }
        }
      }
    }
  }

  .right_action {
    display: flex;
    position: relative;

    .call_icon {
      margin-right: 24rpx;

      image {
        width: 56rpx;
        height: 56rpx;
      }
    }

    .more_icon {
      image {
        width: 56rpx;
        height: 56rpx;
      }
    }

    .more_menu {
      position: absolute;
      // bottom: 0;
      // left: 100%;
      z-index: 999;
      // transform: translate(-100%, 100%);
      box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
      width: max-content;
      border-radius: 12rpx;
      background-color: #fff;

      .menu_item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 20rpx 24rpx;
        font-size: 28rpx;
        color: $uni-text-color;
        border-bottom: 1px solid #f0f0f0;

        image {
          width: 24px;
          height: 24px;
          margin-right: 24rpx;
        }

        &:last-child {
          border: none;
        }
      }
    }
  }
}
</style>
