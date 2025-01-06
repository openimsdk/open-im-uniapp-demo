<template>
  <view class="page_container">
    <custom-nav-bar :title="getTitle">
      <view class="nav_right_action" slot="more">
        <text v-show="!updateLoading" @click="comfirmUpdate">保存</text>
        <u-loading-icon v-show="updateLoading" />
        <!-- <u-button :loading="loading" @click="saveOrCopy" type="primary" :text="getConfirmText" /> -->
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
        <!-- <template slot="suffix">
					<u-button :loading="loading" @click="saveOrCopy" type="primary" :text="getConfirmText" />
				</template> -->
      </u-input>
    </view>

    <!-- <view class="desc_content">
      <view class="title">
        <text>{{ getTitle }}</text>
      </view>
      <view class="sub_title">
        <text>{{ getSubTitle }}</text>
      </view>
    </view> -->

    <!-- <view class="input_content">
      <my-avatar
        :src="sourceInfo.faceURL"
        :desc="sourceInfo.nickname"
        :isGroup="isGroup"
        size="42"
      />
      <u--input
        placeholder="请输入内容"
        border="none"
        v-model="content"
        maxlength="20"
        clearable
      ></u--input>
    </view> -->

    <!-- <view class="action_row">
      <u-button
        :loading="updateLoading"
        :disabled="!content && !isGroupMember"
        @click="comfirmUpdate"
        text="完成"
        type="primary"
      >
      </u-button>
    </view> -->
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
    isGroup() {
      return this.sourceInfo.nickname === undefined;
    },
    isGroupMember() {
      return this.sourceInfo.roleLevel !== undefined;
    },
    getTitle() {
      return this.isGroup ? "修改群聊名称" : "我在本群的昵称";
    },
    getSubTitle() {
      return this.isGroup
        ? "修改群名称后，将在群内通知其他成员"
        : "昵称修改后，只会在此群内显示，群内成员都可以看见。";
    },
  },
  onLoad(options) {
    const { sourceInfo } = options;
    this.sourceInfo = JSON.parse(sourceInfo);
    this.content = this.sourceInfo.nickname ?? this.sourceInfo.groupName;
  },
  methods: {
    comfirmUpdate() {
      this.updateLoading = true;
      let func;
      if (!this.isGroup) {
        func = IMSDK.asyncApi(
          IMSDK.IMMethods.SetGroupMemberInfo,
          IMSDK.uuid(),
          {
            groupID: this.sourceInfo.groupID,
            userID: this.sourceInfo.userID,
            nickname: this.content,
          },
        );
      } else {
        func = IMSDK.asyncApi(IMSDK.IMMethods.SetGroupInfo, IMSDK.uuid(), {
          groupID: this.sourceInfo.groupID,
          groupName: this.content,
        });
      }

      func
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
