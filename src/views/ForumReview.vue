<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getForumPosts, getForumStats, approveForumPost, rejectForumPost } from '../api/forum'

const emit = defineEmits(['refresh-badges'])

const posts = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const activeTab = ref('pending')
const stats = ref({ pending: 0, published: 0, rejected: 0, total: 0 })

const tabStatusMap = { pending: 0, published: 1, rejected: 2, all: undefined }

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function categoryLabel(cat) {
  const map = { complaint: '投诉', fraud: '举报诈骗', scam: '举报诈骗', positive: '正面评价', experience: '经验分享' }
  return map[cat] || cat || '-'
}

async function loadStats() {
  try {
    const { data } = await getForumStats()
    stats.value = data || { pending: 0, published: 0, rejected: 0, total: 0 }
  } catch {}
}

async function loadPosts() {
  loading.value = true
  try {
    const statusVal = tabStatusMap[activeTab.value]
    const { data } = await getForumPosts({
      status: statusVal,
      page: currentPage.value,
      size: pageSize.value,
    })
    posts.value = data?.list || []
    total.value = data?.pagination?.total || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab) {
  activeTab.value = tab
  currentPage.value = 1
  loadPosts()
}

function handlePageChange(page) {
  currentPage.value = page
  loadPosts()
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm(`确定通过该帖子？`, '审核通过', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    })
    await approveForumPost(row.id)
    ElMessage.success('审核已通过')
    loadPosts()
    loadStats()
    emit('refresh-badges')
  } catch {}
}

async function handleReject(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回帖子', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '请描述驳回原因...',
      inputValidator: (v) => !!v?.trim() || '请输入驳回原因',
      type: 'warning',
    })
    await rejectForumPost(row.id, value)
    ElMessage.success('已驳回')
    loadPosts()
    loadStats()
    emit('refresh-badges')
  } catch {}
}

onMounted(() => {
  loadStats()
  loadPosts()
})
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-comments"></i> 帖子审核</div>
        <p class="section-desc">管理用户发布的论坛帖子，审核后方可公开显示</p>
      </div>
      <el-button @click="loadPosts(); loadStats()">
        <i class="fas fa-rotate" style="margin-right: 4px"></i> 刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="mini-stat" :class="{ active: activeTab === 'pending' }" @click="handleTabChange('pending')">
        <span class="mini-num warn">{{ stats.pending }}</span>
        <span class="mini-label">待审核</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'published' }" @click="handleTabChange('published')">
        <span class="mini-num success">{{ stats.published }}</span>
        <span class="mini-label">已发布</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'rejected' }" @click="handleTabChange('rejected')">
        <span class="mini-num danger">{{ stats.rejected }}</span>
        <span class="mini-label">已驳回</span>
      </div>
      <div class="mini-stat" :class="{ active: activeTab === 'all' }" @click="handleTabChange('all')">
        <span class="mini-num">{{ stats.total }}</span>
        <span class="mini-label">全部</span>
      </div>
    </div>

    <!-- 帖子列表 -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <el-table-column label="帖子" min-width="320">
          <template #default="{ row }">
            <div>
              <div style="color: var(--text-white); font-weight: 500; font-size: 13px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px">
                {{ row.title || row.contentPreview || '(无标题)' }}
              </div>
              <div style="font-size: 11px; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px">
                {{ row.content || row.contentPreview || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ categoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="交易所" width="100">
          <template #default="{ row }">
            <div v-if="row.exchange" style="display:flex;align-items:center;gap:5px">
              <img v-if="row.exchange.logoUrl" :src="row.exchange.logoUrl" style="width:16px;height:16px;border-radius:3px;object-fit:cover" />
              <span style="font-size:12px">{{ row.exchange.name }}</span>
            </div>
            <span v-else style="color:var(--text-light)">-</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <span style="font-size: 12px; color: var(--text-light)">{{ row.user?.nickname || row.user?.userId?.slice(0, 8) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning" size="small">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success" size="small">已发布</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger" size="small">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="60">
          <template #default="{ row }">
            <span v-if="row.images?.length" style="font-size:12px;color:var(--primary)">
              <i class="fas fa-image"></i> {{ row.images.length }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="135">
          <template #default="{ row }">
            <span style="font-size: 12px; color: var(--text-light)">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="success" size="small" @click="handleApprove(row)">
                <i class="fas fa-check" style="margin-right:3px"></i> 通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                <i class="fas fa-times" style="margin-right:3px"></i> 驳回
              </el-button>
            </template>
            <template v-else>
              <el-tag type="info" size="small">已处理</el-tag>
              <el-button v-if="row.status === 1" link type="warning" size="small" @click="handleReject(row)" style="margin-left:6px">驳回</el-button>
              <el-button v-if="row.status === 2" link type="success" size="small" @click="handleApprove(row)" style="margin-left:6px">恢复</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrap" v-if="total > pageSize">
      <span class="total-text">共 {{ total }} 条</span>
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

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 24px;
  border-radius: var(--radius);
  background: var(--card);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
}
.mini-stat:hover, .mini-stat.active {
  border-color: var(--primary);
  background: rgba(78,140,255,.06);
}
.mini-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-white);
  line-height: 1;
}
.mini-num.warn { color: var(--warning); }
.mini-num.success { color: var(--success); }
.mini-num.danger { color: var(--danger); }
.mini-label { font-size: 12px; color: var(--text-light); font-weight: 500; }

.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }
</style>
