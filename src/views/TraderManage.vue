<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTraders, createTrader, updateTrader, deleteTrader, setTraderVerified } from '../api/traders'

const emit = defineEmits(['refresh-badges'])

const traders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const keyword = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('创建交易员')
const form = ref({})

const traderTypes = ['稳健型', '进取型', '前沿型']
const riskLevels = ['低', '中', '高']

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadTraders() {
  loading.value = true
  try {
    const { data } = await getTraders({
      page: currentPage.value - 1,
      size: pageSize.value,
      keyword: keyword.value || undefined,
    })
    traders.value = data?.content || data?.data || []
    total.value = data?.pageable?.totalElements || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  loadTraders()
}

function handlePageChange(page) {
  currentPage.value = page
  loadTraders()
}

function handleCreate() {
  dialogTitle.value = '创建交易员'
  form.value = { traderType: '稳健型', riskLevel: '中' }
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑交易员'
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.displayName) {
    ElMessage.warning('请填写显示名称')
    return
  }
  try {
    if (form.value.id) {
      await updateTrader(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createTrader(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadTraders()
  } catch (e) {
    ElMessage.error('操作失败: ' + (e.response?.data?.error || e.message))
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除交易员 "${row.displayName}"？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTrader(row.id)
    ElMessage.success('已删除')
    loadTraders()
  } catch {}
}

async function handleToggleVerify(row) {
  const newVal = !row.verified
  try {
    await setTraderVerified(row.id, newVal)
    ElMessage.success(newVal ? '已认证' : '已取消认证')
    loadTraders()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadTraders()
})
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-user-tie"></i> 交易员管理</div>
        <p class="section-desc">管理交易员资料、认证状态</p>
      </div>
      <div style="display:flex;gap:8px">
        <el-input v-model="keyword" placeholder="搜索名称..." style="width:200px" clearable @clear="handleSearch" @keyup.enter="handleSearch">
          <template #prefix><i class="fas fa-search"></i></template>
        </el-input>
        <el-button type="primary" @click="handleCreate">
          <i class="fas fa-plus" style="margin-right:4px"></i> 新建交易员
        </el-button>
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="traders" v-loading="loading" style="width: 100%">
        <el-table-column label="交易员" min-width="220">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:10px">
              <img v-if="row.avatarUrl" :src="row.avatarUrl" style="width:36px;height:36px;border-radius:50%;object-fit:cover" />
              <div v-else style="width:36px;height:36px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-light)"><i class="fas fa-user"></i></div>
              <div>
                <div style="color:var(--text-white);font-weight:500;font-size:13px;display:flex;align-items:center;gap:4px">
                  {{ row.displayName }}
                  <i v-if="row.verified" class="fas fa-check-circle" style="color:var(--primary);font-size:12px" title="官方认证"></i>
                </div>
                <div style="font-size:11px;color:var(--text-light)">{{ row.title || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.traderType || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="粉丝" width="80" prop="followerCount" />
        <el-table-column label="文章" width="80" prop="articleCount" />
        <el-table-column label="年化" width="80">
          <template #default="{ row }">
            <span style="color:var(--success);font-weight:600">{{ row.annualReturn || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="胜率" width="80">
          <template #default="{ row }">
            <span>{{ row.winRate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'ACTIVE'" type="success" size="small">活跃</el-tag>
            <el-tag v-else-if="row.status === 'SUSPENDED'" type="danger" size="small">暂停</el-tag>
            <el-tag v-else type="warning" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="135">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.verified ? 'warning' : 'success'" size="small" @click="handleToggleVerify(row)">
              {{ row.verified ? '取消认证' : '认证' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrap" v-if="total > pageSize">
      <span class="total-text">共 {{ total }} 条</span>
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="显示名称" required>
              <el-input v-model="form.displayName" placeholder="交易员名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头衔">
              <el-input v-model="form.title" placeholder="如：资深分析师" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="form.traderType" placeholder="选择类型" style="width:100%">
                <el-option v-for="t in traderTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险等级">
              <el-select v-model="form.riskLevel" placeholder="选择等级" style="width:100%">
                <el-option v-for="r in riskLevels" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Twitter">
              <el-input v-model="form.twitterHandle" placeholder="@handle" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱">
              <el-input v-model="form.contactEmail" placeholder="email@example.com" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="年化收益">
              <el-input v-model="form.annualReturn" placeholder="如：+85%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="胜率">
              <el-input v-model="form.winRate" placeholder="如：72%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="夏普比率">
              <el-input v-model="form.sharpeRatio" placeholder="如：2.1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="头像URL">
          <el-input v-model="form.avatarUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="form.coverImageUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="交易员简介..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
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
