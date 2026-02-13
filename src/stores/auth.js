import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo } from '../api/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('cms_token') || '')
  const user = ref(null)

  async function login(username, password) {
    const { data } = await loginApi(username, password)
    if (!data.accessToken) {
      throw new Error(data.error || data.message || 'Login failed')
    }
    const authorities = data.user?.authorities || []
    if (!authorities.includes('ROLE_ADMIN')) {
      throw new Error('This account does not have admin privileges')
    }
    token.value = data.accessToken
    localStorage.setItem('cms_token', data.accessToken)
    user.value = data.user || { displayName: username }
  }

  async function fetchUser() {
    try {
      const { data } = await getUserInfo()
      user.value = data
      return true
    } catch {
      return false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('cms_token')
    router.push('/login')
  }

  const displayName = () => {
    if (!user.value) return 'Admin'
    return user.value.displayName || user.value.nickname || user.value.email || user.value.username || 'Admin'
  }

  return { token, user, login, fetchUser, logout, displayName }
})
