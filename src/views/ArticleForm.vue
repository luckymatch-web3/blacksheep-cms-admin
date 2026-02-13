<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QuillEditor from '../components/QuillEditor.vue'
import {
  getArticle, createArticle, updateArticle,
  publishArticle, submitReview, setBanner,
  getCategories, uploadFile,
} from '../api/articles'

const route = useRoute()
const router = useRouter()

const editId = computed(() => route.params.id)
const isEdit = computed(() => !!editId.value)
const pageTitle = computed(() => isEdit.value ? `编辑文章 #${editId.value}` : '新建文章')

const form = ref({
  title: '',
  subtitle: '',
  summary: '',
  content: '',
  authorName: '',
  category: '',
  tags: '',
  coverImageUrl: '',
  isBanner: false,
  bannerSort: 0,
})
const articleStatus = ref('')
const rejectNotes = ref('')
const categories = ref([])
const loading = ref(false)
const coverUrlInput = ref('')

onMounted(async () => {
  loadCategories()
  if (isEdit.value) {
    loading.value = true
    try {
      const { data } = await getArticle(editId.value)
      const a = data.content ? data.content[0] : (data.data || data)
      form.value.title = a.title || ''
      form.value.subtitle = a.subtitle || ''
      form.value.summary = a.summary || ''
      form.value.content = a.content || ''
      form.value.authorName = a.authorName || ''
      form.value.category = a.category || ''
      form.value.tags = a.tags || ''
      form.value.coverImageUrl = a.coverImageUrl || ''
      form.value.isBanner = a.isBanner || false
      form.value.bannerSort = a.bannerSort || 0
      coverUrlInput.value = a.coverImageUrl || ''
      articleStatus.value = a.status || ''
      if (a.status === 'REJECTED' && a.reviewNotes) {
        rejectNotes.value = a.reviewNotes + (a.reviewerName ? ' — ' + a.reviewerName : '')
      }
    } catch {
      ElMessage.error('Failed to load article')
    } finally {
      loading.value = false
    }
  }
})

async function loadCategories() {
  try {
    const { data } = await getCategories()
    categories.value = Array.isArray(data) ? data : []
  } catch {}
}

async function handleSave(targetStatus) {
  if (!form.value.title.trim()) {
    ElMessage.error('请输入标题')
    return
  }
  loading.value = true
  try {
    const body = {
      ...form.value,
      coverImageUrl: form.value.coverImageUrl || coverUrlInput.value || null,
      subtitle: form.value.subtitle || null,
      summary: form.value.summary || null,
      authorName: form.value.authorName || null,
      category: form.value.category || null,
      tags: form.value.tags || null,
      status: targetStatus,
    }

    let savedId
    if (isEdit.value) {
      await updateArticle(editId.value, body)
      savedId = editId.value
    } else {
      const { data } = await createArticle(body)
      savedId = data.content?.[0]?.id || data.data?.id || data.id
    }

    if (targetStatus === 'PUBLISHED' && savedId) {
      await publishArticle(savedId)
    }
    if (form.value.isBanner && savedId) {
      await setBanner(savedId, true, form.value.bannerSort)
    }

    ElMessage.success(isEdit.value ? '文章已更新' : '文章已创建')
    router.push('/articles')
  } catch (e) {
    ElMessage.error('保存失败: ' + (e.response?.data?.message || e.message || ''))
  } finally {
    loading.value = false
  }
}

async function handleSubmitReview() {
  if (!form.value.title.trim()) {
    ElMessage.error('请输入标题')
    return
  }
  loading.value = true
  try {
    const body = {
      ...form.value,
      coverImageUrl: form.value.coverImageUrl || coverUrlInput.value || null,
      subtitle: form.value.subtitle || null,
      summary: form.value.summary || null,
      authorName: form.value.authorName || null,
      category: form.value.category || null,
      tags: form.value.tags || null,
    }

    let id = editId.value
    if (!id) {
      const { data } = await createArticle(body)
      id = data.content?.[0]?.id
      if (!id) throw new Error('Failed to get article ID')
    } else {
      await updateArticle(id, body)
    }
    await submitReview(id)
    ElMessage.success('已提交审核')
    router.push('/articles')
  } catch (e) {
    ElMessage.error('提交失败: ' + (e.response?.data?.message || e.message || ''))
  } finally {
    loading.value = false
  }
}

async function handleCoverUpload(file) {
  try {
    const { data } = await uploadFile(file.raw)
    const url = data.publicUrl || data.url || data.fileUrl
    if (url) {
      form.value.coverImageUrl = url
      coverUrlInput.value = url
      ElMessage.success('Cover uploaded')
    }
  } catch {
    ElMessage.warning('Upload API unavailable')
  }
  return false
}

function handleCoverUrlInput() {
  const url = coverUrlInput.value.trim()
  if (url && (url.startsWith('http') || url.startsWith('/'))) {
    form.value.coverImageUrl = url
  }
}

const showRejectBox = computed(() => articleStatus.value === 'REJECTED' && rejectNotes.value)
const hideSubmitReview = computed(() => articleStatus.value === 'PUBLISHED' || articleStatus.value === 'PENDING_REVIEW')
</script>

<template>
  <div v-loading="loading">
    <div class="section-header">
      <div>
        <div class="section-title">
          <i :class="isEdit ? 'fas fa-edit' : 'fas fa-pen-fancy'"></i>
          {{ pageTitle }}
        </div>
      </div>
      <div style="display: flex; gap: 8px">
        <el-button @click="router.push('/articles')"><i class="fas fa-times" style="margin-right: 4px"></i> 取消</el-button>
        <el-button @click="handleSave('DRAFT')"><i class="fas fa-save" style="margin-right: 4px"></i> 保存草稿</el-button>
        <el-button v-if="!hideSubmitReview" type="warning" @click="handleSubmitReview"><i class="fas fa-paper-plane" style="margin-right: 4px"></i> 提交审核</el-button>
        <el-button type="success" @click="handleSave('PUBLISHED')"><i class="fas fa-rocket" style="margin-right: 4px"></i> 直接发布</el-button>
      </div>
    </div>

    <!-- Reject Notice -->
    <div v-if="showRejectBox" class="reject-reason">
      <h4><i class="fas fa-exclamation-triangle"></i> 驳回原因</h4>
      <p>{{ rejectNotes }}</p>
    </div>

    <!-- Two Column Layout -->
    <div class="form-grid">
      <!-- Left: Content -->
      <div>
        <el-card shadow="never" style="margin-bottom: 16px">
          <el-form label-position="top">
            <el-form-item label="Title" required>
              <el-input v-model="form.title" placeholder="Enter article title..." size="large" />
            </el-form-item>
            <el-form-item label="Subtitle">
              <el-input v-model="form.subtitle" placeholder="Optional subtitle" />
            </el-form-item>
            <el-form-item label="Summary">
              <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="Brief summary for list display" />
            </el-form-item>
            <el-form-item label="Content">
              <QuillEditor v-model="form.content" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Right: Metadata -->
      <div>
        <!-- Cover Image -->
        <el-card shadow="never" style="margin-bottom: 12px">
          <template #header><span><i class="fas fa-image" style="margin-right: 4px"></i> Cover Image</span></template>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleCoverUpload"
          >
            <div v-if="!form.coverImageUrl" class="upload-area">
              <i class="fas fa-cloud-upload-alt" style="font-size: 28px; color: var(--text-light)"></i>
              <p style="color: var(--text-light); font-size: 13px; margin-top: 4px">Click to upload</p>
              <p style="color: var(--text-light); font-size: 11px; margin-top: 2px">Recommended: 800x450</p>
            </div>
            <img v-else :src="form.coverImageUrl" class="cover-preview" />
          </el-upload>
          <div style="margin-top: 10px">
            <label style="font-size: 12px; color: var(--text-light)">Or enter image URL</label>
            <el-input v-model="coverUrlInput" placeholder="https://..." @input="handleCoverUrlInput" style="margin-top: 4px" />
          </div>
        </el-card>

        <!-- Author / Category / Tags -->
        <el-card shadow="never" style="margin-bottom: 12px">
          <el-form label-position="top">
            <el-form-item label="Author">
              <el-input v-model="form.authorName" placeholder="Author name">
                <template #prefix><i class="fas fa-user-pen"></i></template>
              </el-input>
            </el-form-item>
            <el-form-item label="Category">
              <el-autocomplete
                v-model="form.category"
                :fetch-suggestions="(q, cb) => cb(categories.filter(c => c.toLowerCase().includes(q.toLowerCase())).map(c => ({ value: c })))"
                placeholder="e.g. News, Market"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="Tags">
              <el-input v-model="form.tags" placeholder="Comma separated: bitcoin,defi">
                <template #prefix><i class="fas fa-tags"></i></template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Banner Settings -->
        <el-card shadow="never">
          <template #header><span><i class="fas fa-star" style="margin-right: 4px; color: var(--warning)"></i> Banner Settings</span></template>
          <el-checkbox v-model="form.isBanner" label="Set as homepage banner" />
          <el-form-item label="Sort order (lower = first)" style="margin-top: 12px">
            <el-input-number v-model="form.bannerSort" :min="0" />
          </el-form-item>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--text-white); display: flex; align-items: center; gap: 10px; }
.section-title i { font-size: 18px; color: var(--primary); }

.reject-reason {
  background: rgba(248, 81, 73, 0.06);
  border: 1px solid rgba(248, 81, 73, 0.15);
  border-radius: var(--radius);
  padding: 14px 18px;
  margin-bottom: 16px;
}
.reject-reason h4 {
  font-size: 13px; color: var(--danger); margin-bottom: 6px;
  display: flex; align-items: center; gap: 6px;
}
.reject-reason p { font-size: 13px; color: var(--text); line-height: 1.5; }

.form-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }

.upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}
.upload-area:hover { border-color: var(--primary); background: rgba(78, 140, 255, 0.03); }
.cover-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius);
  cursor: pointer;
}
</style>
