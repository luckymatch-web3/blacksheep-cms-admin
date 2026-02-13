<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('testlocal')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || e.response?.data?.message || e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-logo">
        <i class="fas fa-bolt" style="font-size: 32px"></i>
      </div>
      <h2 class="login-title">BlackSheep Admin</h2>
      <p class="login-sub">Content Management System</p>

      <el-form @submit.prevent="handleLogin" style="text-align: left">
        <el-form-item>
          <el-input
            v-model="username"
            prefix-icon="User"
            placeholder="Username"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            prefix-icon="Lock"
            placeholder="Password"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          style="width: 100%; border-radius: 8px"
          @click="handleLogin"
        >
          <i v-if="!loading" class="fas fa-sign-in-alt" style="margin-right: 6px"></i>
          Login
        </el-button>
      </el-form>

      <p v-if="error" style="margin-top: 16px; font-size: 13px; color: var(--danger)">{{ error }}</p>
      <p style="margin-top: 16px; font-size: 12px; color: var(--text-light)">
        Account: testlocal / admin123
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg);
}
.login-box {
  width: 420px;
  padding: 48px 40px;
  text-align: center;
}
.login-logo {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #4e8cff, #6c5ce7);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  font-size: 30px;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(78, 140, 255, 0.3);
}
.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 8px;
}
.login-sub {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 36px;
}
</style>
