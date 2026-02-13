<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
</script>

<template>
  <header class="header">
    <div class="breadcrumb">
      <i class="fas fa-home" style="font-size: 12px"></i>
      <span class="sep">/</span>
      <span class="current">{{ route.meta.title || 'Dashboard' }}</span>
    </div>
    <div class="header-right">
      <div class="user-badge">
        <span class="avatar">{{ authStore.displayName().charAt(0).toUpperCase() }}</span>
        <span>{{ authStore.displayName() }}</span>
      </div>
      <el-button size="small" @click="authStore.logout()">
        <i class="fas fa-sign-out-alt" style="margin-right: 4px"></i> Logout
      </el-button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background: var(--sidebar);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-light);
}
.breadcrumb .sep { color: var(--border-light); }
.breadcrumb .current { color: var(--text-white); font-weight: 500; }
.header-right { display: flex; align-items: center; gap: 16px; }
.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 5px;
  border-radius: 24px;
  background: rgba(78, 140, 255, 0.08);
  border: 1px solid rgba(78, 140, 255, 0.15);
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
}
.user-badge .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e8cff, #6c5ce7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
</style>
