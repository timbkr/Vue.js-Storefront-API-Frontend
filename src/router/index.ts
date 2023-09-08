import { createRouter, createWebHistory } from "vue-router";
import CartView from "../views/CartView.vue";
import ProductsView from "../views/ProductsView.vue";
import ProductDetailsView from "../views/ProductDetailsView.vue";
import PathNotFound from "../views/PathNotFound.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: ProductsView,
        },
        {
            path: "/products",
            name: "products",
            component: ProductsView,
        },

        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/AboutView.vue"),
        },
        {
            path: "/cart",
            name: "cart",
            component: CartView,
        },
        {
            path: "/products/:handle",
            name: "productDetails",
            component: ProductDetailsView,
        },
        {
            path: "/:catchAll(.*)",
            name: "pathNotFound",
            component: PathNotFound,
        },
    ],
});

export default router;
