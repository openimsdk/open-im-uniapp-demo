<template>
  <view class="member_checked_desc">
    <view @click="showSelected = true" class="left_info">
      <view class="select_num">
        <text class="text">{{ `已选择(${choosedData.length})` }}</text>
        <u-icon name="arrow-up" size="14" color="#007aff" />
      </view>
      <view class="select_list">{{ selectedStr }}</view>
    </view>
    <view class="">
      <u-button
        :loading="comfirmLoading"
        @click="clickComfirm"
        :disabled="choosedData.length === 0"
        type="primary"
        :text="
          isRemove
            ? '移除'
            : `确定(${choosedData.length}${
                maxLength > 0 ? `/${maxLength}` : ``
              })`
        "
      />
      <u-popup round="24" :show="showSelected" mode="bottom" @close="close">
        <view class="selected_container">
          <view class="top_desc">
            <text>{{ `已选择(${choosedData.length})` }}</text>
            <text @click="close" class="comfirm_text">确认</text>
          </view>
          <u-list class="selected_list">
            <u-list-item
              v-for="item in choosedData"
              :key="item.userID || item.groupID"
            >
              <selected-member @removeItem="removeItem(item)" :source="item" />
            </u-list-item>
          </u-list>
        </view>
      </u-popup>
    </view>
  </view>
</template>

<script>
import SelectedMember from "./SelectedMember.vue";
export default {
  name: "ChooseIndexFooter",
  components: {
    SelectedMember,
  },
  props: {
    isRemove: Boolean,
    choosedData: Array,
    comfirmLoading: Boolean,
    maxLength: Number,
  },
  data() {
    return {
      showSelected: false,
      showConfirmModal: false,
    };
  },
  computed: {
    selectedStr() {
      return this.choosedData
        .map((item) => item.nickname || item.showName || item.groupName)
        .join("、");
    },
  },
  methods: {
    close() {
      this.showSelected = false;
    },
    removeItem(item) {
      this.$emit("removeItem", item);
    },
    clickComfirm() {
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="scss" scoped>
.member_checked_desc {
  @include btwBox();
  background-color: #fff;
  align-items: flex-start;
  padding: 24rpx 44rpx 0;
  height: 60px;
  max-height: 60px;
  box-shadow: 0px -1px 4px 1px rgba(0, 0, 0, 0.04);

  .left_info {
    @include colBox(false);

    .select_num {
      display: flex;
      align-items: center;
      color: $uni-color-primary;
    }

    .select_list {
      font-size: 24rpx;
      color: #8e9ab0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 50vw;
    }

    .text {
      font-size: 30rpx;
      margin-right: 24rpx;
    }
  }

  .u-button {
    background-color: #0089ff;
    height: 40px;
    margin: 0;
  }
}

.selected_container {
  padding: 44rpx;

  .top_desc {
    @include btwBox();
    margin-bottom: 20rpx;

    .comfirm_text {
      color: $uni-color-primary;
      margin-right: 24rpx;
    }
  }

  .selected_list {
    height: 60vh !important;
    overflow-y: auto;
  }
}
</style>
