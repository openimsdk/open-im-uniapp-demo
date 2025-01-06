<template>
  <view class="page_container">
    <custom-nav-bar title="设置禁言">
      <view class="top_right_action" slot="more">
        <u-button
          v-show="canCancelMute || choosed || customValue"
          @click="confirmMute"
          :loading="loading"
          type="primary"
          text="完成"
          size="mini"
        ></u-button>
      </view>
    </custom-nav-bar>

    <view class="choose_area">
      <view
        @click="chooseItem(item)"
        v-for="item in chooseList.slice(canCancelMute ? 0 : 1, chooseList.length)"
        :key="item.title"
        class="choose_item"
      >
        <view>{{ item.title }}</view>
        <u-icon
          v-show="choosed === item.value && customValue === ''"
          name="checkbox-mark"
          color="#1D6BED"
        >
        </u-icon>
      </view>
      <view class="choose_item">
        <view>自定义</view>
        <view style="width: 70px">
          <u-input
            placeholder="请输入"
            border="none"
            type="number"
            v-model="customValue"
          >
            <template slot="suffix">
              <text>天</text>
            </template>
          </u-input>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
export default {
  components: {
    CustomNavBar,
  },
  data() {
    return {
      choosed: 0,
      loading: false,
      customValue: "",
      fromList: 0,
      sourceList: [],
      chooseList: [
        {
          title: "取消禁言",
          value: 0,
        },
        {
          title: "10分钟",
          value: 600,
        },
        {
          title: "1小时",
          value: 3600,
        },
        {
          title: "12小时",
          value: 43200,
        },
        {
          title: "1天",
          value: 86400,
        },
      ],
      canCancelMute: false
    };
  },
  onLoad(options) {
    const { sourceInfo, fromList } = options;
    this.sourceList = JSON.parse(sourceInfo);
    this.fromList = fromList ?? 0
    this.canCancelMute = this.sourceList.find(item => item.muteEndTime ?? 0 > Date.now())
  },
  methods: {
    confirmMute() {
      this.loading = true;
      let seconds = this.choosed;
      if (this.customValue !== "") {
        seconds = this.customValue * 86400;
      }
      const promiseArray = this.sourceList.map(async ({ userID, groupID }) => {
          await IMSDK.asyncApi(IMSDK.IMMethods.ChangeGroupMemberMute, IMSDK.uuid(), {
            groupID,
            userID,
            mutedSeconds: seconds,
          })
      })

      Promise.all(promiseArray)
        .then(() => {
          uni.$u.toast("设置成功");
          if(this.fromList){
            setTimeout(() => uni.navigateBack({ delta:2 }), 1000);
          }else{
            setTimeout(() => uni.navigateBack(), 1000);
          }
        })
        .catch(() => uni.$u.toast("设置失败"))
        .finally(() => (this.loading = false));
    },
    chooseItem({ value }) {
      this.choosed = value;
      this.customValue = "";
    },
  },
};
</script>

<style lang="scss">
.page_container {
  background-color: #f2f2f2;

  .top_right_action {
    margin-right: 44rpx;
  }

  .choose_area {
    background-color: #fff;

    .choose_item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 44rpx;
      border-bottom: 1px solid #f0f0f0;
    }
  }
}
</style>
