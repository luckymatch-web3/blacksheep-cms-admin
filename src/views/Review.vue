<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticles, approveArticle, rejectArticle } from '../api/articles'

const router = useRouter()
const emit = defineEmits(['refresh-badges'])

const articles = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await getArticles({
      status: 'PENDING_REVIEW',
      page: currentPage.value - 1,
      size: pageSize.value,
    })
    articles.value = data.content || []
    total.value = data.pageable?.totalElements || 0
  } catch (e) {
    ElMessage.error('Load failed')
  } finally {
    loading.value = false
  }
}

async function handleApprove(row) {
  try {
    const { value } = await ElMessageBox.prompt('审核备注 (可选)', '通过审核', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      inputPlaceholder: '可选备注...',
      type: 'success',
    })
    await approveArticle(row.id, value || '')
    ElMessage.success('审核已通过，文章已发布')
    loadData()
    emit('refresh-badges')
  } catch {}
}

async function handleReject(row) {
  try {
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
  } catch {}
}

function handlePageChange(page) {
  currentPage.value = page
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-clipboard-check"></i> 内容审核</div>
        <p class="section-desc">审核提交的文章，通过后自动发布，驳回后作者可修改重新提交</p>
      </div>
      <el-button @click="loadData"><i class="fas fa-rotate" style="margin-right: 4px"></i> 刷新</el-button>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="articles" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="65">
          <template #default="{ row }"><span style="color: var(--text-light); font-weight: 500">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="文章" min-width="280">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <img v-if="row.coverImageUrl" :src="row.coverImageUrl" style="width: 48px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0" />
              <div style="min-width: 0">
                <div style="color: var(--text-white); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px">{{ row.title }}</div>
                <div v-if="row.summary" style="font-size: 11px; color: var(--text-light); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px">{{ row.summary }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">{{ row.category || '-' }}</template>
        </el-table-column>
        <el-table-column label="作者" width="100">
          <template #default="{ row }">{{ row.authorName || '-' }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="140">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)">{{ formatDate(row.updatedAt || row.createdAt) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="router.push(`/articles/edit/${row.id}`)">
              <i class="fas fa-eye"></i> 查看
            </el-button>
            <el-button type="success" size="small" @click="handleApprove(row)">
              <i class="fas fa-check" style="margin-right: 4px"></i> 通过
            </el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">
              <i class="fas fa-times" style="margin-right: 4px"></i> 驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }
</style>
