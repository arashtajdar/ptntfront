import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Dropdown from 'primevue/dropdown'
import Paginator from 'primevue/paginator'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './assets/base.css'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
	theme: {
		preset: Aura
	}
})
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Menubar', Menubar)
app.component('Dropdown', Dropdown)
app.component('Paginator', Paginator)
app.mount('#app')
