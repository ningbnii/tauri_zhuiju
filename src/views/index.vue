<template>
  <van-sticky>
    <div class="container mx-auto p-4">
      <div class="flex flex-col space-y-4">
        <div class="flex space-x-4">
          <input type="text" v-model="searchQuery" @blur="searchMovies" placeholder="搜索" class="flex-1 p-2 rounded border border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300 ease-in-out" />
          <button @click="searchMovies" class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out px-4">搜索</button>
        </div>

        <!-- 第一行显示 firstLevel -->
        <div class="flex space-x-4 overflow-x-auto">
          <div v-for="(item, index) in firstLevelItems" :key="index" :class="{ 'bg-blue-500 text-white': selectedFirstLevel === index, 'bg-gray-200': selectedFirstLevel !== index }" class="cursor-pointer p-2 rounded inline-block whitespace-nowrap transition duration-200 ease-in-out transform hover:bg-blue-400 hover:text-white hover:shadow-md" @click="selectFirstLevel(index, item.id)">
            {{ item.name }}
          </div>
        </div>
        <!-- 第二行显示 secondLevel -->
        <div class="flex space-x-4 overflow-x-auto">
          <div v-for="(item, index) in secondLevelItems" :key="index" :class="{ 'bg-purple-500 text-white': selectedSecondLevel === index, 'bg-gray-200': selectedSecondLevel !== index }" class="cursor-pointer p-2 rounded inline-block whitespace-nowrap transition duration-200 ease-in-out transform hover:bg-purple-400 hover:text-white hover:shadow-md" @click="selectSecondLevel(index, item.id)">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </van-sticky>

  <!-- 电影列表 -->
  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="(item, index) in videoList" :key="index" class="bg-white shadow-md rounded-lg overflow-hidden" @click="goToDetail(item)">
        <img v-if="item.cover" :src="item.cover" alt="" class="w-full h-48 object-cover" />
        <div class="p-4">
          <div class="text-xl font-bold">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 分页 -->
  <van-sticky position="bottom">
    <div class="container mx-auto p-4">
      <MyPagination :total="totalPages" v-model:page="page" @update:page="getVideoList" />
    </div>
  </van-sticky>

  <van-back-top bottom="60" right="15" />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCategory } from '@/api/category'
import { getList, searchMoviesByQuery } from '@/api/video'
import MyPagination from '@/components/MyPagination.vue'
import { invoke } from '@tauri-apps/api/tauri'

const router = useRouter()

const firstLevelItems = ref([])
const selectedFirstLevel = ref(0)
const selectedSecondLevel = ref('')
let categoryId = ''
const videoList = ref([])
const page = ref(1)
const totalPages = ref(0)
const searchQuery = ref('')

// 鼠标一直显示
invoke('set_cursor_visibility', { visible: true })

onMounted(async () => {
  firstLevelItems.value = await getCategory()
  // 将第一个分类的 id 赋值给 categoryId
  categoryId = firstLevelItems.value[0].id
  getVideoList()
})

const getVideoList = async () => {
  // 获取视频列表
  let res = null
  if (searchQuery.value) {
    res = await searchMoviesByQuery(searchQuery.value, page.value)
  } else {
    res = await getList(categoryId, page.value)
  }

  videoList.value = res.movies
  totalPages.value = res.totalPages

  // 跳转到页面顶部
  window.scrollTo(0, 0)
}

const searchMovies = () => {
  page.value = 1
  getVideoList()
}

const secondLevelItems = computed(() => {
  return firstLevelItems.value[selectedFirstLevel.value]?.children || []
})

const selectFirstLevel = (index, id) => {
  selectedFirstLevel.value = index
  selectedSecondLevel.value = ''
  categoryId = id
  getVideoList()
}

const selectSecondLevel = (index, id) => {
  selectedSecondLevel.value = index
  categoryId = id
  getVideoList()
}

const goToDetail = (item) => {
  router.push({ path: '/detail', query: { id: item.id } })
}
</script>

<style scoped>
.van-search {
  padding: 0;
}
</style>
