<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getArticles, deleteArticle, publishArticle, unpublishArticle,
  submitReview, approveArticle, rejectArticle,
} from '../api/articles'

const router = useRouter()
const emit = defineEmits(['refresh-badges'])

const articles = ref([])
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'DRAFT' },
  { label: '审核中', value: 'PENDING_REVIEW' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已驳回', value: 'REJECTED' },
]

function statusLabel(s) {
  const map = { DRAFT: '草稿', PUBLISHED: '已发布', PENDING_REVIEW: '审核中', REJECTED: '已驳回' }
  return map[s] || s || '-'
}

function statusType(s) {
  const map = { PUBLISHED: 'success', DRAFT: 'info', PENDING_REVIEW: 'warning', REJECTED: 'danger' }
  return map[s] || 'info'
}

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: currentPage.value - 1, size: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (statusFilter.value) params.status = statusFilter.value
    const { data } = await getArticles(params)
    articles.value = data.content || []
    total.value = data.pageable?.totalElements || 0
  } catch (e) {
    ElMessage.error('Load failed: ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  keyword.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  loadData()
}

function handlePageChange(page) {
  currentPage.value = page
  loadData()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定将文章 #${row.id} 移至回收站？`, '删除文章', { type: 'warning' })
  await deleteArticle(row.id)
  ElMessage.success('已移至回收站')
  loadData()
  emit('refresh-badges')
}

async function handlePublish(row) {
  await publishArticle(row.id)
  ElMessage.success('文章已发布')
  loadData()
  emit('refresh-badges')
}

async function handleUnpublish(row) {
  await unpublishArticle(row.id)
  ElMessage.success('文章已下架')
  loadData()
}

async function handleSubmitReview(row) {
  await submitReview(row.id)
  ElMessage.success('已提交审核')
  loadData()
  emit('refresh-badges')
}

async function handleApprove(row) {
  const { value } = await ElMessageBox.prompt('审核备注 (可选)', '通过审核', {
    confirmButtonText: '通过',
    cancelButtonText: '取消',
    inputPlaceholder: '可选备注...',
    type: 'success',
  })
  await approveArticle(row.id, value || '')
  ElMessage.success('审核已通过')
  loadData()
  emit('refresh-badges')
}

async function handleReject(row) {
  const { value } = await ElMessageBox.prompt('驳回原因', '驳回文章', {
    confirmButtonText: '驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入驳回原因...',
    inputValidator: (v) => !!v?.trim() || '请输入驳回原因',
    type: 'warning',
  })
  await rejectArticle(row.id, value)
  ElMessage.success('已驳回')
  loadData()
  emit('refresh-badges')
}

onMounted(loadData)
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-newspaper"></i> 文章列表</div>
      </div>
      <el-button type="primary" @click="router.push('/articles/create')">
        <i class="fas fa-plus" style="margin-right: 4px"></i> 新建文章
      </el-button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索标题..."
        style="width: 240px"
        clearable
        @clear="loadData"
        @keyup.enter="loadData"
      >
        <template #prefix><i class="fas fa-search"></i></template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态" style="width: 140px" @change="currentPage = 1; loadData()">
        <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-button type="primary" @click="currentPage = 1; loadData()">
        <i class="fas fa-search" style="margin-right: 4px"></i> 搜索
      </el-button>
      <el-button @click="resetSearch">
        <i class="fas fa-rotate" style="margin-right: 4px"></i> 重置
      </el-button>
    </div>

    <!-- Table -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="articles" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="65">
          <template #default="{ row }"><span style="color: var(--text-light); font-weight: 500">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="文章" min-width="260">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <img v-if="row.coverImageUrl" :src="row.coverImageUrl" style="width: 48px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0" />
              <div style="min-width: 0">
                <div class="article-title">{{ row.title }}</div>
                <div v-if="row.subtitle" class="article-subtitle">{{ row.subtitle }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">{{ row.category || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="dark">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="轮播" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.isBanner" style="color: var(--warning)"><i class="fas fa-star"></i> {{ row.bannerSort || 0 }}</span>
            <span v-else style="color: var(--text-light)">-</span>
          </template>
        </el-table-column>
        <el-table-column label="浏览" width="80">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)"><i class="fas fa-eye" style="margin-right: 3px; font-size: 10px"></i>{{ row.viewCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="日期" width="140">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)">{{ formatDate(row.createdAt) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="router.push(`/articles/edit/${row.id}`)">
              <i class="fas fa-edit"></i> 编辑
            </el-button>
            <template v-if="row.status === 'DRAFT'">
              <el-button link type="warning" size="small" @click="handleSubmitReview(row)"><i class="fas fa-paper-plane"></i></el-button>
              <el-button link type="success" size="small" @click="handlePublish(row)"><i class="fas fa-rocket"></i></el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)"><i class="fas fa-trash"></i></el-button>
            </template>
            <template v-else-if="row.status === 'PENDING_REVIEW'">
              <el-button link type="success" size="small" @click="handleApprove(row)"><i class="fas fa-check"></i></el-button>
              <el-button link type="danger" size="small" @click="handleReject(row)"><i class="fas fa-times"></i></el-button>
            </template>
            <template v-else-if="row.status === 'PUBLISHED'">
              <el-button link type="warning" size="small" @click="handleUnpublish(row)"><i class="fas fa-eye-slash"></i></el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)"><i class="fas fa-trash"></i></el-button>
            </template>
            <template v-else-if="row.status === 'REJECTED'">
              <el-button link type="warning" size="small" @click="handleSubmitReview(row)"><i class="fas fa-redo"></i></el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)"><i class="fas fa-trash"></i></el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Pagination -->
    <div class="pagination-wrap" v-if="total > pageSize">
      <span class="total-text">{{ total }} items</span>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.search-bar {
  display: flex; gap: 12px; padding: 16px 20px; background: var(--card);
  border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 16px;
  flex-wrap: wrap; align-items: center; box-shadow: var(--shadow);
}
.article-title {
  color: var(--text-white); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;
}
.article-subtitle { font-size: 11px; color: var(--text-light); margin-top: 2px; }
.pagination-wrap {
  display: flex; align-items: center; justify-content: space-between; padding: 14px 0;
}
.total-text { font-size: 13px; color: var(--text-light); }
</style>
