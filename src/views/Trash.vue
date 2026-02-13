<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTrash, restoreArticle, permanentDeleteArticle } from '../api/articles'

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
    const { data } = await getTrash({ page: currentPage.value - 1, size: pageSize.value })
    articles.value = data.content || []
    total.value = data.pageable?.totalElements || 0
  } catch {
    ElMessage.error('Load trash failed')
  } finally {
    loading.value = false
  }
}

async function handleRestore(row) {
  try {
    await restoreArticle(row.id)
    ElMessage.success('文章已恢复')
    loadData()
    emit('refresh-badges')
  } catch (e) {
    ElMessage.error('恢复失败: ' + (e.response?.data?.message || e.message || ''))
  }
}

async function handlePermanentDelete(row) {
  await ElMessageBox.confirm(
    `确定永久删除文章 #${row.id}？此操作不可恢复！`,
    '永久删除',
    { type: 'error', confirmButtonText: '永久删除', cancelButtonText: '取消' }
  )
  try {
    await permanentDeleteArticle(row.id)
    ElMessage.success('已永久删除')
    loadData()
    emit('refresh-badges')
  } catch (e) {
    ElMessage.error('删除失败: ' + (e.response?.data?.message || e.message || ''))
  }
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
        <div class="section-title"><i class="fas fa-trash-alt"></i> 回收站</div>
        <p class="section-desc">已删除的文章保存在这里，可以恢复或永久删除</p>
      </div>
      <el-button @click="loadData"><i class="fas fa-rotate" style="margin-right: 4px"></i> 刷新</el-button>
    </div>

    <div class="trash-info">
      <i class="fas fa-info-circle" style="font-size: 16px; color: var(--warning)"></i>
      <span>永久删除的文章不可恢复。恢复的文章将变为草稿状态。</span>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="articles" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="65">
          <template #default="{ row }"><span style="color: var(--text-light); font-weight: 500">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="文章" min-width="280">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <img v-if="row.coverImageUrl" :src="row.coverImageUrl" style="width: 48px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; opacity: 0.6" />
              <div style="min-width: 0">
                <div style="color: var(--text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; text-decoration: line-through; opacity: 0.7">{{ row.title }}</div>
                <div v-if="row.category" style="font-size: 11px; color: var(--text-light); margin-top: 2px">{{ row.category }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">{{ row.category || '-' }}</template>
        </el-table-column>
        <el-table-column label="删除时间" width="140">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)">{{ formatDate(row.deletedAt) }}</span></template>
        </el-table-column>
        <el-table-column label="删除人" width="100">
          <template #default="{ row }"><span style="font-size: 12px; color: var(--text-light)">{{ row.deletedBy || '-' }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleRestore(row)">
              <i class="fas fa-undo" style="margin-right: 4px"></i> 恢复
            </el-button>
            <el-button type="danger" size="small" @click="handlePermanentDelete(row)">
              <i class="fas fa-fire" style="margin-right: 4px"></i> 永久删除
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
.trash-info {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  background: rgba(118, 131, 144, 0.06); border: 1px solid var(--border);
  border-radius: var(--radius); margin-bottom: 16px; font-size: 13px; color: var(--text-light);
}
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }
</style>
