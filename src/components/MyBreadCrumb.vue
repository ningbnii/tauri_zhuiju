<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem class="cursor-pointer">
        <BreadcrumbLink @click="goBack"> Home </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>
        <Slash />
      </BreadcrumbSeparator>
      <BreadcrumbItem v-for="(item, index) in items" :key="index">
        <template v-if="index === items.length - 1">
          <BreadcrumbPage>{{ item.name }}</BreadcrumbPage>
        </template>
        <template v-else>
          <BreadcrumbLink @click="goToLink(item.href)"> {{ item.name }} </BreadcrumbLink>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
        </template>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { Slash } from 'lucide-vue-next'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const goToLink = (href) => {
  router.push(href)
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
/* 添加你的样式 */
</style>
