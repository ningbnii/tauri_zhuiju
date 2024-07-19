<template>
  <div ref="container" class="container mx-auto p-4" @mousemove="showCursor" @mousedown="showCursor" @keydown="showCursor">
    <MyBreadCrumb :items="[{ name: videoName }]" />
    <div id="player" class="mt-2"></div>

    <!-- 显示集数 -->
    <div class="mt-4">
      <div class="text-lg font-bold">剧集列表</div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mt-2">
        <div v-for="(item, index) in videoList" :key="index" class="text-center">
          <Button @click="chooseEpisode(item, index)" :class="playIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'" class="w-full min-w-[60px] truncate">
            {{ item.episode }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { getDetail } from '@/api/video'
import { Button } from '@/components/ui/button'
import { useRouter, useRoute } from 'vue-router'
import MyBreadCrumb from '@/components/MyBreadCrumb.vue'
import { invoke } from '@tauri-apps/api/tauri'

const router = useRouter()
const route = useRoute()
const id = route.query.id

const container = ref(null)
const videoList = ref([])
const playIndex = ref(0)
let videoName = ''
let isFullScreen = false

// 切换全屏模式
const toggleFullscreen = async () => {
  await appWindow.setFullscreen(!isFullScreen)
  isFullScreen = !isFullScreen
  if (!isFullScreen) {
    clearTimeout(hideCursorTimer)
  } else {
    showCursor()
  }
}

let hideCursorTimer = null
// 鼠标移动时显示鼠标
const showCursor = () => {
  // 只在全屏模式下隐藏鼠标
  if (!isFullScreen) return
  invoke('set_cursor_visibility', { visible: true })
  clearTimeout(hideCursorTimer)
  hideCursorTimer = setTimeout(() => {
    invoke('set_cursor_visibility', { visible: false })
    clearTimeout(hideCursorTimer)
  }, 2000)
}

let player = null
let playUrl = ''

const initPlayer = async () => {
  const width = container.value.getBoundingClientRect().width
  const style = window.getComputedStyle(container.value)
  const paddingLeft = parseFloat(style.paddingLeft)
  const paddingRight = parseFloat(style.paddingRight)
  const widthWithoutPadding = width - paddingLeft - paddingRight
  player = polyvPlayer({
    wrap: '#player',
    width: widthWithoutPadding,
    height: (widthWithoutPadding * 9) / 16,
    url: playUrl,
    autoplay: true,
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

  // 播放结束时播放下一集
  player.on('s2j_onPlayOver', async () => {
    if (playIndex.value < videoList.value.length - 1) {
      const nextIndex = playIndex.value + 1
      playUrl = videoList.value[nextIndex].url
      playIndex.value = nextIndex
      const options = {
        url: playUrl,
        autoplay: true,
      }
      player.changeVid(options)
    }
  })
}

const getVideoDetail = async () => {
  const res = await getDetail(id)
  videoList.value = res.episodes
  videoName = res.name

  // 将第一个视频的播放地址赋值给 playUrl
  playUrl = videoList.value[0].url
  playIndex.value = 0
}

const chooseEpisode = (item, index) => {
  playUrl = item.url
  playIndex.value = index
  const options = {
    url: playUrl,
    autoplay: true,
  }
  player.changeVid(options)
  // 跳转到页面顶部
  window.scrollTo(0, 0)
}

onMounted(async () => {
  await getVideoDetail()
  await initPlayer()
})

onUnmounted(() => {
  try {
    player.destroy()
    player = null
    playUrl = ''
    videoList.value = []
    playIndex.value = 0
    videoName = ''
    clearTimeout(hideCursorTimer)
    invoke('set_cursor_visibility', { visible: true })
  } catch (error) {}
})
</script>
<style scoped>
.hide-cursor {
  cursor: none;
}
</style>
