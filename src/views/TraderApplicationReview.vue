<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApplications, getApplicationStats, approveApplication, rejectApplication } from '../api/traders'

const emit = defineEmits(['refresh-badges'])

const applications = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const activeTab = ref('SUBMITTED')
const stats = ref({ submitted: 0, approved: 0, rejected: 0, draft: 0 })

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadStats() {
  try {
    const { data } = await getApplicationStats()
    stats.value = data || { submitted: 0, approved: 0, rejected: 0, draft: 0 }
  } catch {}
}

async function loadApplications() {
  loading.value = true
  try {
    const { data } = await getApplications({
      page: currentPage.value - 1,
      size: pageSize.value,
      status: activeTab.value === 'ALL' ? undefined : activeTab.value,
    })
    applications.value = data?.data || []
    total.value = data?.pageable?.totalElements || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab) {
  activeTab.value = tab
  currentPage.value = 1
  loadApplications()
}

function handlePageChange(page) {
  currentPage.value = page
  loadApplications()
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确定通过 "${row.displayName}" 的入驻申请？将自动创建交易员账号。`, '审核通过', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    })
    await approveApplication(row.id)
    ElMessage.success('已通过，交易员账号已创建')
    loadApplications()
    loadStats()
    emit('refresh-badges')
  } catch {}
}

async function handleReject(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝申请', {
      confirmButtonText: '拒绝',
      cancelButtonText: '取消',
      inputPlaceholder: '请描述拒绝原因...',
      inputValidator: (v) => !!v?.trim() || '请输入拒绝原因',
      type: 'warning',
    })
    await rejectApplication(row.id, value)
    ElMessage.success('已拒绝')
    loadApplications()
    loadStats()
    emit('refresh-badges')
  } catch {}
}

onMounted(() => {
  loadStats()
  loadApplications()
})
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-user-check"></i> 入驻审核</div>
        <p class="section-desc">审核交易员入驻申请，通过后自动创建交易员账号</p>
      </div>
      <el-button @click="loadApplications(); loadStats()">
        <i class="fas fa-rotate" style="margin-right:4px"></i> 刷新
      </el-button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="mini-stat" :class="{ active: activeTab === 'SUBMITTED' }" @click="handleTabChange('SUBMITTED')">
        <span class="mini-num warn">{{ stats.submitted }}</span>
        <span class="mini-label">待审核</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'APPROVED' }" @click="handleTabChange('APPROVED')">
        <span class="mini-num success">{{ stats.approved }}</span>
        <span class="mini-label">已通过</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'REJECTED' }" @click="handleTabChange('REJECTED')">
        <span class="mini-num danger">{{ stats.rejected }}</span>
        <span class="mini-label">已拒绝</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'ALL' }" @click="handleTabChange('ALL')">
        <span class="mini-num">{{ stats.submitted + stats.approved + stats.rejected + stats.draft }}</span>
        <span class="mini-label">全部</span>
      </div>
    </div>

    <!-- Table -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="applications" v-loading="loading" style="width: 100%">
        <el-table-column label="申请人" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="color:var(--text-white);font-weight:500;font-size:13px">{{ row.displayName }}</div>
              <div style="font-size:11px;color:var(--text-light)">{{ row.contactEmail || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Twitter" width="140">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:4px;font-size:12px">
              <span>{{ row.twitterHandle || '-' }}</span>
              <i v-if="row.twitterVerified" class="fas fa-check-circle" style="color:var(--primary);font-size:11px" title="已验证"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="专长" min-width="160">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ row.specialties || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'SUBMITTED'" type="warning" size="small">待审核</el-tag>
            <el-tag v-else-if="row.status === 'APPROVED'" type="success" size="small">已通过</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger" size="small">已拒绝</el-tag>
            <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="135">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'SUBMITTED'">
              <el-button type="success" size="small" @click="handleApprove(row)">
                <i class="fas fa-check" style="margin-right:3px"></i> 通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                <i class="fas fa-times" style="margin-right:3px"></i> 拒绝
              </el-button>
            </template>
            <template v-else>
              <el-tag type="info" size="small">已处理</el-tag>
            </template>
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
.stats-row { display: flex; gap: 12px; margin-bottom: 20px; }
.mini-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 24px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; min-width: 90px; }
.mini-stat:hover, .mini-stat.active { border-color: var(--primary); background: rgba(78,140,255,.06); }
.mini-num { font-size: 26px; font-weight: 700; color: var(--text-white); line-height: 1; }
.mini-num.warn { color: var(--warning); }
.mini-num.success { color: var(--success); }
.mini-num.danger { color: var(--danger); }
.mini-label { font-size: 12px; color: var(--text-light); font-weight: 500; }
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }
</style>
