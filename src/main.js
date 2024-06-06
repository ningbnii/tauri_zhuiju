import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VuePageStackPlugin } from 'vue-page-stack'
import store from './store'
import * as Phaser from 'phaser'

// import { Command } from '@tauri-apps/api/shell'
// alternatively, use `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` is the EXACT value specified on `tauri.conf.json > tauri > bundle > externalBin`
// notice that the args array matches EXACTLY what is specified on `tauri.conf.json`.
// const command = Command.sidecar('binaries/service')
// const output = await command.execute()

const app = createApp(App)
app.use(router)
app.use(VuePageStackPlugin, { router })
app.use(store)
// app.config.globalProperties.Phaser = Phaser
app.use(Phaser)
app.mount('#app')
