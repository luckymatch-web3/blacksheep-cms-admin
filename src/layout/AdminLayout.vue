<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import { useAuthStore } from '../stores/auth'
import { getArticles, getTrash } from '../api/articles'

const authStore = useAuthStore()
const collapsed = ref(false)
const reviewCount = ref(0)
const trashCount = ref(0)

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
  loadBadgeCounts()
})

async function loadBadgeCounts() {
  try {
    const [pendingRes, trashRes] = await Promise.allSettled([
      getArticles({ status: 'PENDING_REVIEW', size: 1 }),
      getTrash({ size: 1 }),
    ])
    if (pendingRes.status === 'fulfilled') {
      reviewCount.value = pendingRes.value.data?.pageable?.totalElements || 0
    }
    if (trashRes.status === 'fulfilled') {
      trashCount.value = trashRes.value.data?.pageable?.totalElements || 0
    }
  } catch {}
}

// Expose to child views
defineExpose({ loadBadgeCounts })
</script>

<template>
  <div class="layout">
    <Sidebar
      :collapsed="collapsed"
      :review-count="reviewCount"
      :trash-count="trashCount"
      @toggle="collapsed = !collapsed"
    />
    <div class="main-wrap">
      <Header />
      <main class="content">
        <router-view @refresh-badges="loadBadgeCounts" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}
</style>
