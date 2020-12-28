import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/home.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    }, {
        path: "/about",
        name: "Test",
        component: Home
    }
];

const router = new VueRouter({
    mode: "history",
    routes
});

export default router;