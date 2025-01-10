import IMSDK, { MessageStatus, MessageType } from "openim-uniapp-polyfill";
import { v4 as uuidv4 } from "uuid";
import { UpdateMessageTypes } from "@/constant";

const state = {
  historyMessageList: [],
  previewImageList: [],
  hasMoreMessage: true,
  quoteMessage: undefined,
};

const mutations = {
  SET_HISTORY_MESSAGE_LIST(state, list) {
    state.historyMessageList = [...list];
  },
  SET_PREVIEW_IMAGE_LIST(state, list) {
    state.previewImageList = [...list];
  },
  SET_HAS_MORE_MESSAGE(state, hasMore) {
    state.hasMoreMessage = hasMore;
  },
  SET_QUOTE_MESSAGE(state, message) {
    state.quoteMessage = message;
  },
};

const actions = {
  async getHistoryMesageList({ commit, state }, params) {
    let emptyFlag = true;
    try {
      console.log("getHistoryMesageList:::");
      console.log(params);
      const { data } = await IMSDK.asyncApi(
        IMSDK.IMMethods.GetAdvancedHistoryMessageList,
        uuidv4(),
        params,
      );
      console.log(data);
      const isFistPage = !params.startClientMsgID
      const messages = data.messageList ?? [];
      if (!params.conversationID.includes("sn_")) {
        const imageList = filterPreviewImage([...messages]);
        commit("SET_PREVIEW_IMAGE_LIST", [
          ...imageList,
          ...(isFistPage ? [] : state.previewImageList),
        ]);
      }
      emptyFlag = messages.length === 0;
      commit("SET_HISTORY_MESSAGE_LIST", [
        ...messages,
        ...(isFistPage ? [] : state.historyMessageList),
      ]);
      commit("SET_HAS_MORE_MESSAGE", !data.isEnd && messages.length === 20);
    } catch (e) {
      commit("SET_HISTORY_MESSAGE_LIST", []);
    }
    return {
      emptyFlag,
    };
  },
  pushNewPreviewImage({ state, commit }, url) {
    commit("SET_PREVIEW_IMAGE_LIST", [...state.previewImageList, url]);
  },
  pushNewMessage({ commit, state }, message) {
    if (
      message.contentType === MessageType.PictureMessage &&
      message.status === MessageStatus.Succeed
    ) {
      const imageList = filterPreviewImage([message]);
      if (imageList.length > 0) {
        commit("SET_PREVIEW_IMAGE_LIST", [
          ...state.previewImageList,
          ...imageList,
        ]);
      }
    }

    commit("SET_HISTORY_MESSAGE_LIST", [...state.historyMessageList, message]);
  },
  updateOneMessage(
    { commit, state },
    {
      message,
      type = UpdateMessageTypes.Overall,
      keyWords = [],
      isSuccess = false,
    },
  ) {
    const tmpList = state.historyMessageList;
    const idx = tmpList.findIndex(
      (msg) => msg.clientMsgID === message.clientMsgID,
    );
    if (idx !== -1) {
      if (type === UpdateMessageTypes.Overall) {
        if (message.contentType === MessageType.PictureMessage && isSuccess) {
          const imageList = filterPreviewImage([message]);
          if (imageList.length > 0) {
            commit("SET_PREVIEW_IMAGE_LIST", [
              ...state.previewImageList,
              ...imageList,
            ]);
          }
        }

        tmpList[idx] = {
          ...message,
        };
      } else if (type === UpdateMessageTypes.KeyWords) {
        const updateFields = Array.isArray(keyWords) ? keyWords : [keyWords];
        updateFields.forEach(
          (field) => (tmpList[idx][field.key] = field.value),
        );
      }
      commit("SET_HISTORY_MESSAGE_LIST", tmpList);
    }
  },
  deleteMessages({ commit, state }, messages) {
    const tmpList = [...state.historyMessageList];
    messages.map((message) => {
      const idx = tmpList.findIndex(
        (msg) => msg.clientMsgID === message.clientMsgID,
      );
      if (idx !== -1) {
        tmpList.splice(idx, 1);
      }
    });
    commit("SET_HISTORY_MESSAGE_LIST", tmpList);
  },
  resetMessageState({ commit }) {
    commit("SET_HISTORY_MESSAGE_LIST", []);
    commit("SET_PREVIEW_IMAGE_LIST", []);
    commit("SET_HAS_MORE_MESSAGE", true);
    commit("SET_QUOTE_MESSAGE", undefined);
  },
  updateMessageNicknameAndFaceUrl(
    { commit, state },
    { sendID, senderFaceUrl, senderNickname },
  ) {
    const tmpList = [...state.historyMessageList].map((message) => {
      if (message.sendID === sendID) {
        message.senderFaceUrl = senderFaceUrl;
        message.senderNickname = senderNickname;
      }
      return message;
    });
    commit("SET_HISTORY_MESSAGE_LIST", [...tmpList]);
  },
  updateQuoteMessageRevoke(
    { dispatch, state },
    { clientMsgID }
  ) {
    [...state.historyMessageList].map((message) => {
      if (message.contentType === MessageType.QuoteMessage && clientMsgID === message.quoteElem.quoteMessage.clientMsgID) {
        dispatch('updateOneMessage', {
          message: {
            ...message,
            quoteElem: {
              ...message.quoteElem,
              quoteMessage: {
                ...message.quoteElem.quoteMessage,
                contentType: 2101
              }
            }
          }
        })
      }
      return null;
    });
  }
};

function filterPreviewImage(messages) {
  return messages
    .filter((message) => {
      if (message.contentType === MessageType.PictureMessage) {
        return true;
      }
      if (message.contentType === MessageType.OANotification) {
        let notificationData = {};
        try {
          notificationData = JSON.parse(message.notificationElem.detail);
        } catch (error) {}
        if (notificationData.mixType === 1) {
          message.pictureElem.snapshotPicture.url =
            notificationData.pictureElem.sourcePicture.url;
          return true;
        }
        return false;
      }
      return false;
    })
    .map((item) => item.pictureElem.sourcePicture.url);
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
