<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  collapsed: Boolean,
  reviewCount: { type: Number, default: 0 },
  trashCount: { type: Number, default: 0 },
})

const route = useRoute()
const router = useRouter()

const menuItems = [
  { group: '总览' },
  { path: '/dashboard', title: '仪表盘', icon: 'fas fa-chart-pie' },
  { group: '内容管理' },
  { path: '/articles', title: '文章列表', icon: 'fas fa-newspaper' },
  { path: '/articles/create', title: '新建文章', icon: 'fas fa-pen-fancy' },
  { path: '/banners', title: '轮播管理', icon: 'fas fa-images' },
  { group: '审核' },
  { path: '/review', title: '内容审核', icon: 'fas fa-clipboard-check', badge: 'review' },
  { path: '/trash', title: '回收站', icon: 'fas fa-trash-alt', badge: 'trash' },
]

const isActive = (path) => {
  if (path === '/articles') return route.path === '/articles'
  return route.path.startsWith(path)
}

function navigate(path) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="logo-area">
      <div class="logo-icon"><i class="fas fa-bolt"></i></div>
      <div v-if="!collapsed" class="logo-text">
        <h1>BlackSheep</h1>
        <p>Content Admin</p>
      </div>
    </div>
    <nav class="sidebar-nav">
      <template v-for="(item, idx) in menuItems" :key="idx">
        <div v-if="item.group" v-show="!collapsed" class="menu-group-title">{{ item.group }}</div>
        <div
          v-else
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <span class="icon"><i :class="item.icon"></i></span>
          <span v-if="!collapsed" class="sidebar-text">{{ item.title }}</span>
          <span
            v-if="item.badge === 'review' && reviewCount > 0"
            class="nav-badge review-badge"
          >{{ reviewCount > 99 ? '99+' : reviewCount }}</span>
          <span
            v-if="item.badge === 'trash' && trashCount > 0"
            class="nav-badge trash-badge"
          >{{ trashCount > 99 ? '99+' : trashCount }}</span>
        </div>
      </template>
    </nav>
    <div class="sidebar-footer">
      <div class="menu-item" @click="$emit('toggle')">
        <span class="icon">
          <i :class="collapsed ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
        </span>
        <span v-if="!collapsed" class="sidebar-text">Collapse</span>
      </div>
      <a href="/" target="_blank" class="menu-item" style="color: var(--text-light)">
        <span class="icon"><i class="fas fa-external-link-alt"></i></span>
        <span v-if="!collapsed" class="sidebar-text">Back to Site</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
  height: 100vh;
}
.sidebar.collapsed { width: 68px; }

.logo-area {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4e8cff, #6c5ce7);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(78, 140, 255, 0.3);
}
.logo-text h1 { font-size: 15px; font-weight: 700; color: var(--text-white); line-height: 1.2; }
.logo-text p { font-size: 11px; color: var(--text-light); margin-top: 2px; }

.sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
.menu-group-title {
  font-size: 11px;
  color: var(--text-light);
  padding: 18px 14px 8px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  margin-bottom: 2px;
  user-select: none;
  position: relative;
}
.menu-item:hover { background: rgba(78, 140, 255, 0.08); color: var(--text-white); }
.menu-item.active {
  background: rgba(78, 140, 255, 0.15);
  color: var(--primary);
  font-weight: 600;
}
.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}
.menu-item .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.sidebar-footer { padding: 12px 10px; border-top: 1px solid var(--border); }

.collapsed .menu-item { justify-content: center; padding: 10px; }
.collapsed .menu-item .icon { margin: 0; }

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  margin-left: 6px;
  padding: 0 5px;
}
.review-badge {
  background: var(--danger);
  box-shadow: 0 1px 4px rgba(248, 81, 73, 0.4);
}
.trash-badge {
  background: var(--text-light);
}
</style>
