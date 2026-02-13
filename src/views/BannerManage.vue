<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBanners, getArticles, setBanner } from '../api/articles'

const router = useRouter()

const banners = ref([])
const publishedArticles = ref([])
const selectedArticleId = ref('')
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [bannersRes, articlesRes] = await Promise.allSettled([
      getBanners(),
      getArticles({ status: 'PUBLISHED', size: 50 }),
    ])
    const bList = bannersRes.status === 'fulfilled' ? bannersRes.value.data : []
    banners.value = Array.isArray(bList) ? bList : []

    const aData = articlesRes.status === 'fulfilled' ? articlesRes.value.data : {}
    const allPub = aData.content || []
    const bannerIds = new Set(banners.value.map((b) => b.id))
    publishedArticles.value = allPub.filter((a) => !bannerIds.has(a.id))
  } catch {
    ElMessage.error('Load banners failed')
  } finally {
    loading.value = false
  }
}

async function addBanner() {
  if (!selectedArticleId.value) {
    ElMessage.warning('Select an article')
    return
  }
  if (banners.value.length >= 5) {
    ElMessage.warning('Maximum 5 banners')
    return
  }
  const maxSort = banners.value.length ? Math.max(...banners.value.map((b) => b.bannerSort || 0)) : 0
  try {
    await setBanner(selectedArticleId.value, true, maxSort + 1)
    ElMessage.success('Banner added')
    selectedArticleId.value = ''
    loadData()
  } catch {
    ElMessage.error('Add failed')
  }
}

async function removeBanner(id) {
  try {
    await setBanner(id, false, 0)
    ElMessage.success('Banner removed')
    loadData()
  } catch {
    ElMessage.error('Remove failed')
  }
}

async function moveBanner(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= banners.value.length) return
  const items = [...banners.value]
  ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
  try {
    for (let i = 0; i < items.length; i++) {
      await setBanner(items[i].id, true, i + 1)
    }
    ElMessage.success('Sort updated')
    loadData()
  } catch {
    ElMessage.error('Sort failed')
  }
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-images"></i> Banner Management</div>
        <p class="section-desc">Manage homepage carousel banners. Max 5.</p>
      </div>
    </div>

    <!-- Current Banners -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-light); display: flex; align-items: center; gap: 8px">
          <i class="fas fa-layer-group"></i> Current Banners ({{ banners.length }}/5)
        </span>
      </template>
      <div v-if="!banners.length" class="empty-text">
        <i class="fas fa-images" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.4"></i>
        No banners. Add one below.
      </div>
      <div v-for="(b, idx) in banners" :key="b.id" class="banner-item">
        <div class="banner-rank">{{ idx + 1 }}</div>
        <img v-if="b.coverImageUrl" :src="b.coverImageUrl" class="banner-thumb" />
        <div v-else class="banner-thumb placeholder"><i class="fas fa-image"></i></div>
        <div class="banner-info">
          <h4>{{ b.title }}</h4>
          <p>{{ b.category || '' }} &middot; Sort: {{ b.bannerSort }} &middot; <i class="fas fa-eye" style="font-size: 10px"></i> {{ b.viewCount || 0 }}</p>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0">
          <el-button size="small" :disabled="idx === 0" @click="moveBanner(idx, -1)"><i class="fas fa-arrow-up"></i></el-button>
          <el-button size="small" :disabled="idx === banners.length - 1" @click="moveBanner(idx, 1)"><i class="fas fa-arrow-down"></i></el-button>
          <el-button size="small" @click="router.push(`/articles/edit/${b.id}`)"><i class="fas fa-edit"></i></el-button>
          <el-button size="small" type="danger" @click="removeBanner(b.id)"><i class="fas fa-times"></i></el-button>
        </div>
      </div>
    </el-card>

    <!-- Add Banner -->
    <el-card shadow="never">
      <template #header>
        <span style="display: flex; align-items: center; gap: 8px">
          <i class="fas fa-plus-circle" style="color: var(--success)"></i> Add Banner
        </span>
      </template>
      <div style="display: flex; gap: 12px">
        <el-select v-model="selectedArticleId" placeholder="Select a published article..." style="flex: 1" filterable>
          <el-option v-for="a in publishedArticles" :key="a.id" :label="a.title" :value="a.id" />
        </el-select>
        <el-button type="primary" @click="addBanner"><i class="fas fa-plus" style="margin-right: 4px"></i> Add</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }

.empty-text { padding: 48px; text-align: center; color: var(--text-light); }

.banner-item {
  display: flex; align-items: center; gap: 16px; padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.banner-item:last-child { border-bottom: none; }
.banner-rank {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(78, 140, 255, 0.1); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
}
.banner-thumb {
  width: 120px; height: 68px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0; background: var(--bg);
}
.banner-thumb.placeholder {
  display: flex; align-items: center; justify-content: center;
  color: var(--text-light); font-size: 11px;
}
.banner-info { flex: 1; min-width: 0; }
.banner-info h4 {
  font-size: 14px; font-weight: 600; color: var(--text-white);
  margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.banner-info p { font-size: 12px; color: var(--text-light); }
</style>
