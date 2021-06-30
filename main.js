import Vue from 'vue'
import App from './App'
import store from './store'
import { openSdk,globalEvent } from 'utils/openSdk'
import uView from "uview-ui";
Vue.use(uView);

Vue.prototype.$store = store
Vue.prototype.$openSdk = openSdk
Vue.prototype.$globalEvent = globalEvent

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
