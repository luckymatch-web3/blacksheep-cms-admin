<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from '../api/withdrawal'

const emit = defineEmits(['refresh-badges'])

const withdrawals = ref([])
const loading = ref(false)
const activeTab = ref('PENDING')
const total = ref(0)

const tabs = [
  { key: 'PENDING', label: '待处理', type: 'warning' },
  { key: 'COMPLETED', label: '已完成', type: 'success' },
  { key: 'REJECTED', label: '已驳回', type: 'danger' },
  { key: '', label: '全部', type: 'info' },
]

function formatDate(s) {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatAmount(amount) {
  if (amount == null) return '0'
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await getWithdrawals(activeTab.value ? { status: activeTab.value } : {})
    withdrawals.value = data?.withdrawals || []
    total.value = data?.total || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(key) {
  activeTab.value = key
  loadData()
}

async function handleApprove(row) {
  try {
    const { value: txHash } = await ElMessageBox.prompt(
      '请输入链上交易哈希（txHash），确认后状态变为"已完成"',
      '确认打款',
      {
        confirmButtonText: '确认完成',
        cancelButtonText: '取消',
        inputPlaceholder: '0x... (可选，若已打款请填写)',
        type: 'success',
      }
    )
    await approveWithdrawal(row.id, txHash?.trim() || null)
    ElMessage.success('提现已审批通过')
    loadData()
    emit('refresh-badges')
  } catch {}
}

async function handleReject(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回提现', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '如：钱包地址有误、金额不符...',
      inputValidator: (v) => !!v?.trim() || '请输入驳回原因',
      type: 'warning',
    })
    await rejectWithdrawal(row.id, value)
    ElMessage.success('已驳回')
    loadData()
    emit('refresh-badges')
  } catch {}
}

function copyText(text) {
  if (!text) return
  navigator.clipboard?.writeText(text)
  ElMessage.success('已复制')
}

onMounted(loadData)
</script>

<template>
  <div>
    <div class="section-header">
      <div>
        <div class="section-title"><i class="fas fa-money-bill-transfer"></i> 提现管理</div>
        <p class="section-desc">管理用户的 USDT 提现申请，人工审核后打款并更新状态</p>
      </div>
      <el-button @click="loadData"><i class="fas fa-rotate" style="margin-right:4px"></i> 刷新</el-button>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table :data="withdrawals" v-loading="loading" style="width:100%">
        <el-table-column label="提现金额" width="130">
          <template #default="{ row }">
            <div>
              <span style="font-size:16px;font-weight:700;color:var(--success)">{{ formatAmount(row.amount) }}</span>
              <span style="font-size:11px;color:var(--text-light);margin-left:4px">{{ row.currency || 'USDT' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收款地址" min-width="200">
          <template #default="{ row }">
            <div v-if="row.walletAddress" style="display:flex;align-items:center;gap:6px">
              <span style="font-family:monospace;font-size:12px;color:var(--text)">
                {{ row.walletAddress.slice(0,6) }}...{{ row.walletAddress.slice(-6) }}
              </span>
              <i class="fas fa-copy" style="color:var(--primary);cursor:pointer;font-size:11px" @click="copyText(row.walletAddress)" title="复制完整地址"></i>
            </div>
            <span v-else style="color:var(--text-light)">-</span>
            <div v-if="row.network" style="font-size:11px;color:var(--text-light);margin-top:2px">{{ row.network }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户 ID" width="110">
          <template #default="{ row }">
            <span style="font-size:11px;color:var(--text-light);font-family:monospace">{{ row.userId?.slice(0, 8) }}...</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'PENDING'" type="warning" size="small">待处理</el-tag>
            <el-tag v-else-if="row.status === 'COMPLETED'" type="success" size="small">已完成</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger" size="small">已驳回</el-tag>
            <el-tag v-else type="info" size="small">{{ row.status || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="交易哈希" min-width="160">
          <template #default="{ row }">
            <div v-if="row.txHash" style="display:flex;align-items:center;gap:6px">
              <span style="font-family:monospace;font-size:11px;color:var(--success)">
                {{ row.txHash.slice(0,8) }}...{{ row.txHash.slice(-6) }}
              </span>
              <i class="fas fa-copy" style="color:var(--primary);cursor:pointer;font-size:11px" @click="copyText(row.txHash)"></i>
            </div>
            <span v-else style="color:var(--text-light);font-size:12px">-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="140">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="135">
          <template #default="{ row }">
            <span style="font-size:12px;color:var(--text-light)">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'PENDING'">
              <el-button type="success" size="small" @click="handleApprove(row)">
                <i class="fas fa-check" style="margin-right:3px"></i> 打款
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                <i class="fas fa-times" style="margin-right:3px"></i> 驳回
              </el-button>
            </template>
            <span v-else style="font-size:12px;color:var(--text-light)">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrap">
      <span class="total-text">共 {{ total }} 条记录</span>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && withdrawals.length === 0" class="empty-state">
      <i class="fas fa-inbox" style="font-size:40px;color:var(--text-light);margin-bottom:12px"></i>
      <p style="color:var(--text-light);font-size:14px">
        {{ activeTab === 'PENDING' ? '暂无待处理的提现申请' : '暂无记录' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }

.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px;
  width: fit-content;
}
.tab-item {
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.tab-item:hover { color: var(--text-white); }
.tab-item.active {
  background: var(--primary);
  color: #fff;
}

.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.total-text { font-size: 13px; color: var(--text-light); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}
</style>
