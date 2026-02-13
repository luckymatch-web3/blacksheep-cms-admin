<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles, getBanners, getTrash } from '../api/articles'

const router = useRouter()

const stats = ref({
  total: 0,
  published: 0,
  draft: 0,
  pending: 0,
  banners: 0,
  trash: 0,
})
const recentArticles = ref([])
const loading = ref(true)

const emit = defineEmits(['refresh-badges'])

const statCards = [
  { key: 'total', label: '全部文章', icon: 'fas fa-file-alt', gradient: 'rgba(78,140,255,.2), rgba(78,140,255,.05)', color: 'var(--primary)' },
  { key: 'published', label: '已发布', icon: 'fas fa-check-circle', gradient: 'rgba(63,185,80,.2), rgba(63,185,80,.05)', color: 'var(--success)' },
  { key: 'draft', label: '草稿', icon: 'fas fa-file-pen', gradient: 'rgba(118,131,144,.2), rgba(118,131,144,.05)', color: 'var(--text-light)' },
  { key: 'pending', label: '待审核', icon: 'fas fa-clock', gradient: 'rgba(210,153,34,.2), rgba(210,153,34,.05)', color: 'var(--warning)' },
  { key: 'banners', label: '轮播', icon: 'fas fa-star', gradient: 'rgba(210,153,34,.2), rgba(210,153,34,.05)', color: 'var(--warning)' },
  { key: 'trash', label: '回收站', icon: 'fas fa-trash', gradient: 'rgba(118,131,144,.2), rgba(118,131,144,.05)', color: 'var(--text-light)' },
]

const quickActions = [
  { label: '新建文章', icon: 'fas fa-pen-fancy', color: 'var(--primary)', path: '/articles/create' },
  { label: '轮播管理', icon: 'fas fa-images', color: 'var(--warning)', path: '/banners' },
  { label: '内容审核', icon: 'fas fa-clipboard-check', color: 'var(--success)', path: '/review' },
  { label: '查看前台', icon: 'fas fa-external-link-alt', color: 'var(--info)', external: true },
]

function statusLabel(s) {
  const map = { DRAFT: '草稿', PUBLISHED: '已发布', PENDING_REVIEW: '审核中', REJECTED: '已驳回' }
  return map[s] || s || '-'
}

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function handleQuickAction(action) {
  if (action.external) {
    window.open('/news/', '_blank')
  } else {
    router.push(action.path)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      getArticles({ size: 1 }),
      getArticles({ status: 'PUBLISHED', size: 1 }),
      getArticles({ status: 'DRAFT', size: 1 }),
      getBanners(),
      getArticles({ status: 'PENDING_REVIEW', size: 1 }),
      getArticles({ size: 5 }),
      getTrash({ size: 1 }),
    ])
    const val = (i) => results[i].status === 'fulfilled' ? results[i].value.data : null
    stats.value.total = val(0)?.pageable?.totalElements || 0
    stats.value.published = val(1)?.pageable?.totalElements || 0
    stats.value.draft = val(2)?.pageable?.totalElements || 0
    const bannerData = val(3)
    stats.value.banners = Array.isArray(bannerData) ? bannerData.length : 0
    stats.value.pending = val(4)?.pageable?.totalElements || 0
    recentArticles.value = val(5)?.content || []
    stats.value.trash = val(6)?.pageable?.totalElements || 0
    emit('refresh-badges')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-chart-pie"></i> Dashboard</div>
        <p class="section-desc">Content overview and quick actions</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.key" class="stat-card">
        <div
          class="stat-icon"
          :style="{ background: `linear-gradient(135deg, ${card.gradient})`, color: card.color }"
        >
          <i :class="card.icon"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats[card.key] }}</h3>
          <p>{{ card.label }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="bottom-grid">
      <!-- Recent Articles -->
      <div class="card panel">
        <h3 class="panel-title">
          <i class="fas fa-clock-rotate-left" style="color: var(--primary); font-size: 14px"></i>
          最近文章
        </h3>
        <div v-if="recentArticles.length">
          <div
            v-for="a in recentArticles"
            :key="a.id"
            class="recent-item"
            @click="router.push(`/articles/edit/${a.id}`)"
          >
            <div class="recent-info">
              <div class="recent-title">{{ a.title }}</div>
              <div class="recent-meta">{{ a.category || '-' }} &middot; {{ formatDate(a.createdAt) }}</div>
            </div>
            <span :class="['badge', `badge-${(a.status || 'draft').toLowerCase()}`]">{{ statusLabel(a.status) }}</span>
          </div>
        </div>
        <p v-else class="empty-text">暂无文章</p>
      </div>

      <!-- Quick Actions -->
      <div class="card panel">
        <h3 class="panel-title">
          <i class="fas fa-bolt" style="color: var(--warning); font-size: 14px"></i>
          快捷操作
        </h3>
        <div class="quick-grid">
          <div
            v-for="action in quickActions"
            :key="action.label"
            class="quick-action"
            @click="handleQuickAction(action)"
          >
            <i :class="action.icon" :style="{ color: action.color }"></i>
            <span>{{ action.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--border-light); }
.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.stat-info h3 { font-size: 26px; font-weight: 700; color: var(--text-white); line-height: 1; }
.stat-info p { font-size: 12px; color: var(--text-light); margin-top: 5px; font-weight: 500; }

.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.panel { padding: 22px; }
.panel-title {
  font-size: 15px; font-weight: 600; color: var(--text-white);
  margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}

.recent-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer;
}
.recent-item:last-child { border-bottom: none; }
.recent-item:hover .recent-title { color: var(--primary); }
.recent-info { min-width: 0; flex: 1; }
.recent-title {
  font-size: 13px; color: var(--text-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;
  transition: color 0.15s;
}
.recent-meta { font-size: 11px; color: var(--text-light); margin-top: 3px; }

.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  margin-left: 12px; flex-shrink: 0;
}
.badge-published { background: rgba(63,185,80,.12); color: var(--success); }
.badge-draft { background: rgba(118,131,144,.12); color: var(--text-light); }
.badge-pending_review { background: rgba(210,153,34,.12); color: var(--warning); }
.badge-rejected { background: rgba(248,81,73,.12); color: var(--danger); }

.empty-text { color: var(--text-light); font-size: 13px; padding: 20px 0; text-align: center; }

.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.quick-action {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px; border-radius: var(--radius);
  background: var(--card); border: 1px solid var(--border);
  cursor: pointer; transition: all 0.2s; text-align: center;
}
.quick-action:hover { border-color: var(--primary); background: rgba(78,140,255,.05); transform: translateY(-1px); }
.quick-action i { font-size: 24px; }
.quick-action span { font-size: 13px; font-weight: 500; color: var(--text); }
</style>
