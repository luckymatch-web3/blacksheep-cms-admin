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
  <QuillEditor
    :content="model"
    content-type="html"
    theme="snow"
    :toolbar="toolbarOptions"
    placeholder="Write your article content here..."
    @update:content="model = $event"
    style="min-height: 350px"
  />
</template>

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
  min-height: 350px;
  border-radius: 0 0 var(--radius) var(--radius);
}
.ql-editor { min-height: 350px !important; line-height: 1.7; }
.ql-editor.ql-blank::before { color: var(--text-light) !important; }
.ql-snow .ql-stroke { stroke: var(--text) !important; }
.ql-snow .ql-fill { fill: var(--text) !important; }
.ql-snow .ql-picker-label { color: var(--text) !important; }
.ql-snow .ql-picker-options { background: var(--card) !important; border-color: var(--border) !important; }
</style>
