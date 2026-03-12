<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getTraderArticles, deleteTraderArticle, publishTraderArticle, unpublishTraderArticle, approveTraderArticle, rejectTraderArticle, getTraders } from '../api/traders'

const router = useRouter()
const emit = defineEmits(['refresh-badges'])

const articles = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const keyword = ref('')
const statusFilter = ref('')
const traderFilter = ref(null)
const traderList = ref([])

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadTraderList() {
  try {
    const { data } = await getTraders({ size: 100 })
    traderList.value = data?.content || data?.data || []
  } catch {}
}

async function loadArticles() {
  loading.value = true
  try {
    const { data } = await getTraderArticles({
      page: currentPage.value - 1,
      size: pageSize.value,
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
      traderId: traderFilter.value || undefined,
    })
    articles.value = data?.content || data?.data || []
    total.value = data?.pageable?.totalElements || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  loadArticles()
}

function handlePageChange(page) {
  currentPage.value = page
  loadArticles()
}

function handleCreate() {
  router.push('/trader-articles/create')
}

function handleEdit(row) {
  router.push(`/trader-articles/edit/${row.id}`)
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除文章 "${row.title}"？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTraderArticle(row.id)
    ElMessage.success('已删除')
    loadArticles()
  } catch {}
}

async function handlePublish(row) {
  try {
    await publishTraderArticle(row.id)
    ElMessage.success('已发布')
    loadArticles()
  } catch (e) {
    ElMessage.error('发布失败')
  }
}

async function handleUnpublish(row) {
  try {
    await unpublishTraderArticle(row.id)
    ElMessage.success('已下架')
    loadArticles()
  } catch (e) {
    ElMessage.error('下架失败')
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确定通过文章 "${row.title}" 的审核？`, '审核通过', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    })
    await approveTraderArticle(row.id)
    ElMessage.success('已通过审核并发布')
    loadArticles()
  } catch {}
}

async function handleReject(row) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回理由', '驳回文章', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      type: 'warning',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回理由不能为空',
      inputPlaceholder: '请输入驳回原因...',
    })
    await rejectTraderArticle(row.id, reason)
    ElMessage.success('已驳回')
    loadArticles()
  } catch {}
}

function getTraderName(traderId) {
  const t = traderList.value.find(x => x.id === traderId)
  return t ? t.displayName : `#${traderId}`
}

onMounted(() => {
  loadTraderList()
  loadArticles()
})
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-file-lines"></i> 交易员文章管理</div>
        <p class="section-desc">管理交易员专栏文章，发布/下架/编辑</p>
      </div>
      <div style="display:flex;gap:8px">
        <el-select v-model="traderFilter" placeholder="所有交易员" clearable style="width:150px" @change="handleSearch">
          <el-option v-for="t in traderList" :key="t.id" :label="t.displayName" :value="t.id" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="所有状态" clearable style="width:120px" @change="handleSearch">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="审核中" value="PENDING_REVIEW" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已驳回" value="REJECTED" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索标题..." style="width:180px" clearable @clear="handleSearch" @keyup.enter="handleSearch">
          <template #prefix><i class="fas fa-search"></i></template>
        </el-input>
        <el-button type="primary" @click="handleCreate">
          <i class="fas fa-plus" style="margin-right:4px"></i> 新建文章
        </el-button>
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="articles" v-loading="loading" style="width: 100%">
        <el-table-column label="文章" min-width="280">
          <template #default="{ row }">
            <div>
              <div style="color:var(--text-white);font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px">
                {{ row.title || '(无标题)' }}
              </div>
              <div style="font-size:11px;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px">
                {{ row.summary || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易员" width="120">
          <template #default="{ row }">
            <span style="font-size:12px">{{ getTraderName(row.traderId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.category || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'PUBLISHED'" type="success" size="small">已发布</el-tag>
            <el-tag v-else-if="row.status === 'PENDING_REVIEW'" type="warning" size="small">审核中</el-tag>
            <el-tooltip v-else-if="row.status === 'REJECTED'" :content="row.rejectReason || '无驳回原因'" placement="top">
              <el-tag type="danger" size="small">已驳回</el-tag>
            </el-tooltip>
            <el-tag v-else type="info" size="small">草稿</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阅读" width="70" prop="viewCount" />
        <el-table-column label="点赞" width="70" prop="likeCount" />
        <el-table-column label="时间" width="135">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ formatDate(row.publishedAt || row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <template v-if="row.status === 'PENDING_REVIEW'">
              <el-button link type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button link type="warning" size="small" @click="handleReject(row)">驳回</el-button>
            </template>
            <template v-else>
              <el-button v-if="row.status !== 'PUBLISHED'" link type="success" size="small" @click="handlePublish(row)">发布</el-button>
              <el-button v-else link type="warning" size="small" @click="handleUnpublish(row)">下架</el-button>
            </template>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrap" v-if="total > pageSize">
      <span class="total-text">共 {{ total }} 条</span>
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }
</style>
