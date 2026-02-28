<script setup>
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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

// Expose a method to programmatically set HTML content (for Word import)
function setHtml(html) {
  const quill = editorRef.value?.getQuill()
  if (quill) {
    // Use Quill's clipboard to properly parse and insert HTML
    quill.root.innerHTML = ''
    quill.clipboard.dangerouslyPasteHTML(0, html)
    // Sync model
    model.value = quill.root.innerHTML
  }
}

defineExpose({ setHtml })
</script>

<template>
  <div class="quill-editor-wrapper">
    <QuillEditor
      ref="editorRef"
      :content="model"
      content-type="html"
      theme="snow"
      :toolbar="toolbarOptions"
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

/* Table styles for imported content */
.ql-editor table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}
.ql-editor table td,
.ql-editor table th {
  border: 1px solid var(--border, #444);
  padding: 8px 12px;
  min-width: 60px;
}
.ql-editor table th,
.ql-editor table tr:first-child td {
  font-weight: 600;
  background: rgba(78, 140, 255, 0.08);
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
