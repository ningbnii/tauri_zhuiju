<template>
  <div id="player"></div>
  <Button @click="goToTest">Button</Button>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { getCategory } from '@/api/category'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

const router = useRouter()
function goToTest() {
  router.push('/test')
}

// 切换全屏模式
const toggleFullscreen = async () => {
  const isFullscreen = await appWindow.isFullscreen()
  await appWindow.setFullscreen(!isFullscreen)
}

let player = null

const initPlayer = async () => {
  player = polyvPlayer({
    wrap: '#player',
    width: document.body.clientWidth,
    height: (document.body.clientWidth * 9) / 16,
    url: 'https://vip.ffzy-play2.com/20240604/60153_449c866d/index.m3u8',
    autoplay: false,
    forceH5: true,
    // 播放倍速，最小0.5，最大3
    speed: [0.5, 1, 1.5, 2, 2.5, 3],
    df: 1,
    hideSwitchPlayer: true,
    // toggleFullPageScreen: true,
  })

  // 全屏切换事件
  player.on('s2j_onFullScreen', async () => {
    await toggleFullscreen()
  })

  player.on('s2j_onNormalScreen', async () => {
    await toggleFullscreen()
  })
}
onMounted(async () => {
  await initPlayer()
  const res = await getCategory()
  console.log(res)
})

onUnmounted(() => {})
</script>
<style lang="less"></style>
