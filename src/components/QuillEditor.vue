<script setup>
import { ref } from 'vue'
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import QuillBetterTable from 'quill-better-table'
import 'quill-better-table/dist/quill-better-table.css'

// Register table module globally (before any editor instance is created)
Quill.register({ 'modules/better-table': QuillBetterTable }, true)

const model = defineModel({ type: String, default: '' })
const editorRef = ref(null)

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]

const modules = [
  {
    name: 'better-table',
    module: QuillBetterTable,
    options: {
      operationMenu: {
        items: {
          insertColumnRight: { text: '右侧插入列' },
          insertColumnLeft: { text: '左侧插入列' },
          insertRowUp: { text: '上方插入行' },
          insertRowDown: { text: '下方插入行' },
          deleteColumn: { text: '删除列' },
          deleteRow: { text: '删除行' },
          deleteTable: { text: '删除表格' },
        },
      },
    },
  },
]

function insertTable() {
  const quill = editorRef.value?.getQuill()
  if (quill) {
    const tableModule = quill.getModule('better-table')
    if (tableModule) {
      tableModule.insertTable(3, 3)
    }
  }
}
</script>

<template>
  <div class="quill-editor-wrapper">
    <div class="table-insert-bar">
      <button type="button" class="table-insert-btn" @click="insertTable" title="插入表格 (3x3)">
        <i class="fas fa-table"></i> 插入表格
      </button>
    </div>
    <QuillEditor
      ref="editorRef"
      :content="model"
      content-type="html"
      theme="snow"
      :toolbar="toolbarOptions"
      :modules="modules"
      placeholder="Write your article content here..."
      @update:content="model = $event"
    />
  </div>
</template>

<style scoped>
.quill-editor-wrapper {
  width: 100%;
  height: 100%;
}
.table-insert-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}
.table-insert-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}
.table-insert-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: rgba(78, 140, 255, 0.05);
}
</style>

<style>
.ql-toolbar.ql-snow {
  background: var(--card) !important;
  border-color: var(--border) !important;
  border-radius: var(--radius) var(--radius) 0 0;
}
.ql-container.ql-snow {
  background: var(--bg) !important;
  border-color: var(--border) !important;
  color: var(--text-white) !important;
  min-height: 500px;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  border-radius: 0 0 var(--radius) var(--radius);
  resize: vertical;
}
.ql-editor {
  min-height: 500px !important;
  line-height: 1.7;
  font-size: 15px;
  padding: 16px;
}
.ql-editor.ql-blank::before { color: var(--text-light) !important; }
.ql-snow .ql-stroke { stroke: var(--text) !important; }
.ql-snow .ql-fill { fill: var(--text) !important; }
.ql-snow .ql-picker-label { color: var(--text) !important; }
.ql-snow .ql-picker-options { background: var(--card) !important; border-color: var(--border) !important; }

/* Table styles in editor */
.ql-editor table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}
.ql-editor table td {
  border: 1px solid var(--border, #444);
  padding: 8px 12px;
  min-width: 60px;
  min-height: 32px;
}
.ql-editor table td[data-row="row-0"] {
  font-weight: 600;
  background: rgba(78, 140, 255, 0.08);
}

/* quill-better-table context menu styling */
.qlbt-operation-menu {
  background: var(--card, #1e1e2e) !important;
  border: 1px solid var(--border, #333) !important;
  color: var(--text, #ccc) !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}
.qlbt-operation-menu .qlbt-operation-menu-item {
  color: var(--text, #ccc) !important;
}
.qlbt-operation-menu .qlbt-operation-menu-item:hover {
  background: rgba(78, 140, 255, 0.1) !important;
  color: var(--primary, #4e8cff) !important;
}

/* Scrollbar */
.ql-container.ql-snow::-webkit-scrollbar {
  width: 8px;
}
.ql-container.ql-snow::-webkit-scrollbar-track {
  background: var(--bg);
}
.ql-container.ql-snow::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
.ql-container.ql-snow::-webkit-scrollbar-thumb:hover {
  background: var(--text-light);
}
</style>
