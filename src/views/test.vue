<template>
  <!-- 循环展示category -->
  <div>
    <div v-for="item in category" :key="item.id">{{ item.title }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getCategory } from '@/api/category'

// invoke('greet', { name: 'ning' }).then((res) => {
//   console.log(res)
// })

let category = ref([])

onMounted(async () => {
  category.value = await getCategory()
})
</script>
