<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getForumPosts, approvePost, rejectPost } from '../api/forum'

const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const statusFilter = ref(0) // 0=pending, 1=published, 2=rejected

const statusMap = {
  0: { label: '待审核', type: 'warning' },
  1: { label: '已通过', type: 'success' },
  2: { label: '已驳回', type: 'danger' },
}

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await getForumPosts({
      status: statusFilter.value,
      page: currentPage.value,
      size: pageSize.value,
    })
    // API returns { list: [...], total, page, size } or { content: [...] }
    if (Array.isArray(data)) {
      posts.value = data
      total.value = data.length
    } else {
      posts.value = data.list || data.content || data.posts || []
      total.value = data.total || data.totalElements || posts.value.length
    }
  } catch (e) {
    console.error('Load forum posts failed:', e)
    ElMessage.error('加载帖子失败')
  } finally {
    loading.value = false
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确认通过该帖子？', '审核通过', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    })
    await approvePost(row.postId || row.id)
    ElMessage.success('已通过')
    loadData()
  } catch {}
}

async function handleReject(row) {
  try {
    const { value } = await ElMessageBox.prompt('驳回原因', '驳回帖子', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入驳回原因...',
      inputValidator: (v) => !!v?.trim() || '请输入驳回原因',
      type: 'warning',
    })
    await rejectPost(row.postId || row.id, value)
    ElMessage.success('已驳回')
    loadData()
  } catch {}
}

function handlePageChange(page) {
  currentPage.value = page
  loadData()
}

function handleStatusChange() {
  currentPage.value = 1
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-comments"></i> 帖子审核</div>
        <p class="section-desc">审核用户发布的帖子，通过后公开显示，驳回后用户可修改重新提交</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center">
        <el-select v-model="statusFilter" @change="handleStatusChange" style="width: 130px" size="default">
          <el-option :value="0" label="待审核" />
          <el-option :value="1" label="已通过" />
          <el-option :value="2" label="已驳回" />
        </el-select>
        <el-button @click="loadData"><i class="fas fa-rotate" style="margin-right: 4px"></i> 刷新</el-button>
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <el-table-column label="ID" width="180">
          <template #default="{ row }"><span style="color: var(--text-light); font-size: 12px">{{ row.postId || row.id }}</span></template>
        </el-table-column>
        <el-table-column label="标题" min-width="250">
          <template #default="{ row }">
            <div style="color: var(--text-white); font-weight: 500">{{ row.title || '(无标题)' }}</div>
            <div v-if="row.content" style="font-size: 11px; color: var(--text-light); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 350px">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">{{ row.categoryLabel || row.category || '-' }}</template>
        </el-table-column>
        <el-table-column label="交易所" width="140">
          <template #default="{ row }">
            <div v-if="row.exchange" style="display: flex; align-items: center; gap: 6px">
              <img v-if="row.exchange.logoUrl" :src="row.exchange.logoUrl" style="width: 20px; height: 20px; border-radius: 4px" />
              <span style="font-size: 12px">{{ row.exchange.name }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="120">
          <template #default="{ row }">{{ row.user?.nickname || row.authorName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status] || {}).type || 'info'" size="small">
              {{ (statusMap[row.status] || {}).label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="140">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)">{{ formatDate(row.createdAt) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="success" size="small" @click="handleApprove(row)">
                <i class="fas fa-check" style="margin-right: 4px"></i> 通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                <i class="fas fa-times" style="margin-right: 4px"></i> 驳回
              </el-button>
            </template>
            <span v-else style="color: var(--text-light); font-size: 12px">
              {{ row.status === 1 ? '已通过' : '已驳回' }}
              <span v-if="row.rejectReason"> — {{ row.rejectReason }}</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrap" v-if="total > pageSize">
      <span class="total-text">{{ total }} 条</span>
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
