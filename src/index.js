import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import Vue from "vue";
import Vuex from 'vuex'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from "./views/main.vue";
import router from "./router";
import Cytoscape from "cytoscape";
import contextMenus from "cytoscape-context-menus";
import VueRx from "vue-rx";

Vue.use(Vuex);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueRx);
Cytoscape.use(contextMenus);

new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");