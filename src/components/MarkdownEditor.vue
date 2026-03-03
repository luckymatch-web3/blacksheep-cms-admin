<script setup>
import { ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const model = defineModel({ type: String, default: '' })
const editorId = 'md-editor-' + Math.random().toString(36).slice(2, 8)

// Expose a method to programmatically set content (for Word import)
function setContent(text) {
  model.value = text
}

defineExpose({ setContent })
</script>

<template>
  <div class="md-editor-wrapper">
    <MdEditor
      :editor-id="editorId"
      v-model="model"
      theme="dark"
      language="en-US"
      :preview="true"
      preview-theme="github"
      code-theme="github"
      :toolbars="[
        'bold', 'underline', 'italic', 'strikeThrough',
        '-',
        'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task',
        '-',
        'codeRow', 'code', 'link', 'image', 'table',
        '-',
        'revoke', 'next',
        '=',
        'pageFullscreen', 'preview', 'catalog',
      ]"
      placeholder="Write your article content in Markdown..."
      style="height: 600px"
    />
  </div>
</template>

<style scoped>
.md-editor-wrapper {
  width: 100%;
}
</style>

<style>
/* Dark theme overrides to match CMS admin style */
.md-editor-dark {
  --md-bk-color: var(--bg, #1a1a2e) !important;
  --md-border-color: var(--border, #2a2a4a) !important;
  --md-color: var(--text-white, #e0e0e0) !important;
}
</style>
