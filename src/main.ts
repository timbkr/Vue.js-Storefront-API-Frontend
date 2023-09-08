
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

//TailwindCSS + Custom Base Styles
import "./index.css";
import "./assets/main.css";

const app = createApp(App);

app.use(router);

app.mount("#app");

