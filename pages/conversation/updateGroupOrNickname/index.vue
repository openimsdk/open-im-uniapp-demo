<template>
  <view class="page_container">
    <custom-nav-bar :title="getTitle">
      <view class="nav_right_action" slot="more">
        <text v-show="!updateLoading" @click="comfirmUpdate">保存</text>
        <u-loading-icon v-show="updateLoading" />
      </view>
    </custom-nav-bar>

    <view class="content_row">
      <u-input
        v-model="content"
        disabledColor="transparent"
        maxlength="16"
        placeholder="请输入内容"
        clearable
      >
      </u-input>
    </view>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
  components: {
    CustomNavBar,
    MyAvatar,
  },
  data() {
    return {
      sourceInfo: {},
      content: "",
      updateLoading: false,
    };
  },
  computed: {
    getTitle() {
      return "修改群聊名称";
    },
    getSubTitle() {
      return "修改群名称后，将在群内通知其他成员";
    },
  },
  onLoad(options) {
    const { sourceInfo } = options;
    this.sourceInfo = JSON.parse(sourceInfo);
    this.content = this.sourceInfo.groupName;
  },
  methods: {
    comfirmUpdate() {
      this.updateLoading = true;
      IMSDK.asyncApi(IMSDK.IMMethods.SetGroupInfo, IMSDK.uuid(), {
          groupID: this.sourceInfo.groupID,
          groupName: this.content,
        })
        .then(() => {
          uni.$u.toast("修改成功");
          setTimeout(() => uni.navigateBack(), 250);
        })
        .catch(() => uni.$u.toast("修改失败"))
        .finally(() => (this.updateLoading = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.page_container {
  @include colBox(false);
  height: 100vh;

  .nav_right_action {
    margin-right: 36rpx;
  }

  .content_row {
    margin-top: 96rpx;
    margin: 72rpx 44rpx 0;

    .u-input {
      background-color: #e8eaef;
    }

    .u-button {
      height: 60rpx;
    }
  }
}
</style>
