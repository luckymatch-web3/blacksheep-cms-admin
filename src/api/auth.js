import request from './request'

export function login(username, password) {
  return request.post(`/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
}

export function getUserInfo() {
  return request.get('/auth/user')
}
