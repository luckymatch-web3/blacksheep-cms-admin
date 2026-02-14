<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const model = defineModel({ type: String, default: '' })

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]
</script>

<template>
  <div class="quill-editor-wrapper">
    <QuillEditor
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

/* 滚动条样式优化 */
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
