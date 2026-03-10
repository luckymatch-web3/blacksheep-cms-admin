<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTraderArticle, createTraderArticle, updateTraderArticle, getTraders, uploadFile } from '../api/traders'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const traderList = ref([])

const form = ref({
  traderId: null,
  title: '',
  titleZh: '',
  summary: '',
  summaryZh: '',
  content: '',
  contentZh: '',
  coverImageUrl: '',
  category: '',
  tags: '',
})

const categories = ['行情分析', '策略拆解', '交易复盘', '市场观点']

async function loadTraderList() {
  try {
    const { data } = await getTraders({ size: 100 })
    traderList.value = data?.content || data?.data || []
  } catch {}
}

async function loadArticle() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const { data } = await getTraderArticle(route.params.id)
    const article = data?.data || data
    form.value = {
      traderId: article.traderId,
      title: article.title || '',
      titleZh: article.titleZh || '',
      summary: article.summary || '',
      summaryZh: article.summaryZh || '',
      content: article.content || '',
      contentZh: article.contentZh || '',
      coverImageUrl: article.coverImageUrl || '',
      category: article.category || '',
      tags: article.tags || '',
    }
  } catch (e) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.value.traderId) {
    ElMessage.warning('请选择所属交易员')
    return
  }
  if (!form.value.title) {
    ElMessage.warning('请填写英文标题')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await updateTraderArticle(route.params.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createTraderArticle(form.value)
      ElMessage.success('创建成功')
    }
    router.push('/trader-articles')
  } catch (e) {
    ElMessage.error('保存失败: ' + (e.response?.data?.error || e.message))
  } finally {
    saving.value = false
  }
}

async function handleUploadCover(file) {
  try {
    const { data } = await uploadFile(file.file)
    form.value.coverImageUrl = data?.url || data?.data?.url
    ElMessage.success('封面上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

onMounted(() => {
  loadTraderList()
  loadArticle()
})
</script>

<template>
  <div v-loading="loading">
    <div class="section-header">
      <div>
        <div class="section-title">
          <i class="fas fa-pen-to-square"></i>
          {{ isEdit ? '编辑文章' : '新建文章' }}
        </div>
        <p class="section-desc">交易员专栏文章，支持中英文双语</p>
      </div>
      <div style="display:flex;gap:8px">
        <el-button @click="router.push('/trader-articles')">
          <i class="fas fa-arrow-left" style="margin-right:4px"></i> 返回
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          <i class="fas fa-save" style="margin-right:4px"></i> 保存
        </el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-form :model="form" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属交易员" required>
              <el-select v-model="form.traderId" placeholder="选择交易员" style="width:100%" filterable>
                <el-option v-for="t in traderList" :key="t.id" :label="t.displayName" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.category" placeholder="选择分类" style="width:100%" clearable>
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">英文内容</el-divider>

        <el-form-item label="标题 (EN)" required>
          <el-input v-model="form.title" placeholder="Article title" />
        </el-form-item>

        <el-form-item label="摘要 (EN)">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="Brief summary..." />
        </el-form-item>

        <el-form-item label="正文 (EN)">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="Article content (Markdown supported)..." />
        </el-form-item>

        <el-divider content-position="left">中文内容</el-divider>

        <el-form-item label="标题 (ZH)">
          <el-input v-model="form.titleZh" placeholder="文章标题" />
        </el-form-item>

        <el-form-item label="摘要 (ZH)">
          <el-input v-model="form.summaryZh" type="textarea" :rows="2" placeholder="文章摘要..." />
        </el-form-item>

        <el-form-item label="正文 (ZH)">
          <el-input v-model="form.contentZh" type="textarea" :rows="10" placeholder="文章正文 (支持 Markdown)..." />
        </el-form-item>

        <el-divider content-position="left">其他</el-divider>

        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="封面图片">
              <div style="display:flex;gap:8px;width:100%">
                <el-input v-model="form.coverImageUrl" placeholder="https://..." style="flex:1" />
                <el-upload :show-file-list="false" :http-request="handleUploadCover" accept="image/*">
                  <el-button><i class="fas fa-upload" style="margin-right:4px"></i> 上传</el-button>
                </el-upload>
              </div>
              <img v-if="form.coverImageUrl" :src="form.coverImageUrl" style="max-width:200px;max-height:120px;margin-top:8px;border-radius:8px;border:1px solid var(--border)" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标签">
              <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }
.section-desc { font-size: 12px; color: var(--text-light); margin-top: 4px; }
</style>
