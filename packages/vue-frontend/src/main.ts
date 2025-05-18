import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import HighchartsVue from 'highcharts-vue'
import VueMaplibreGl from '@indoorequal/vue-maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(HighchartsVue)
app.use(VueMaplibreGl)

app.mount('#app')
