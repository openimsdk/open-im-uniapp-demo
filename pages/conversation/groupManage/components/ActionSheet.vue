<template>
  <u-action-sheet
    safeAreaInsetBottom
    closeOnClickOverlay
    @close="onClose"
    @select="onSelect"
    round="24"
    :actions="joinGroupActions"
    :show="visible"
    cancelText="取消"
  />
</template>

<script>
import IMSDK, { GroupVerificationType } from "openim-uniapp-polyfill";
export default {
  name: "",
  components: {},
  props: {
    visible: Boolean,
    groupID: String,
  },
  data() {
    return {
      joinGroupActions: [
        {
          name: "允许任何人加群",
          type: GroupVerificationType.AllNot,
        },
        {
          name: "群成员邀请无需验证",
          type: GroupVerificationType.ApplyNeedInviteNot,
        },
        {
          name: "需要发送验证消息",
          type: GroupVerificationType.AllNeed,
        },
      ],
    };
  },
  methods: {
    onClose() {
      this.$emit("update:visible", false);
    },
    onSelect({ type }) {
      IMSDK.asyncApi(IMSDK.IMMethods.SetGroupVerification, IMSDK.uuid(), {
        groupID: this.groupID,
        verification: type,
      })
        .then(() => uni.$u.toast("操作成功"))
        .catch(() => uni.$u.toast("操作失败"));
    },
  },
};
</script>

<style lang="scss"></style>
