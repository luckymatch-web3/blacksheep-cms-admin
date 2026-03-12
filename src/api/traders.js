import request from './request'

// ==================== Trader Admin APIs ====================

export function getTraders(params) {
  return request.get('/admin/traders', { params })
}

export function createTrader(data) {
  return request.post('/admin/traders', data)
}

export function updateTrader(id, data) {
  return request.put(`/admin/traders/${id}`, data)
}

export function deleteTrader(id) {
  return request.delete(`/admin/traders/${id}`)
}

export function setTraderVerified(id, verified) {
  return request.post(`/admin/traders/${id}/verify?verified=${verified}`)
}

// ==================== Application Admin APIs ====================

export function getApplications(params) {
  return request.get('/admin/traders/applications', { params })
}

export function getApplicationStats() {
  return request.get('/admin/traders/applications/stats')
}

export function approveApplication(appId) {
  return request.post(`/admin/traders/applications/${appId}/approve`)
}

export function rejectApplication(appId, reason = '') {
  return request.post(`/admin/traders/applications/${appId}/reject?reason=${encodeURIComponent(reason)}`)
}

// ==================== Trader Article Admin APIs ====================

export function getTraderArticles(params) {
  return request.get('/admin/trader-articles', { params })
}

export function getTraderArticle(id) {
  return request.get(`/admin/trader-articles/${id}`)
}

export function createTraderArticle(data) {
  return request.post('/admin/trader-articles', data)
}

export function updateTraderArticle(id, data) {
  return request.put(`/admin/trader-articles/${id}`, data)
}

export function deleteTraderArticle(id) {
  return request.delete(`/admin/trader-articles/${id}`)
}

export function publishTraderArticle(id) {
  return request.post(`/admin/trader-articles/${id}/publish`)
}

export function unpublishTraderArticle(id) {
  return request.post(`/admin/trader-articles/${id}/unpublish`)
}

export function approveTraderArticle(id) {
  return request.post(`/admin/trader-articles/${id}/approve`)
}

export function rejectTraderArticle(id, reason) {
  return request.post(`/admin/trader-articles/${id}/reject?reason=${encodeURIComponent(reason)}`)
}

// File upload (reuse from articles.js)
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPublic', 'true')
  return request.post('/files/upload', formData)
}
