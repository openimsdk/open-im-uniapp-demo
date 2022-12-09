import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
import contact from "./modules/contact";
import conversation from "./modules/conversation";
import message from "./modules/message";
import getters from "./getters";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
    contact,
    conversation,
    message,
  },
  getters
});

export default store;
