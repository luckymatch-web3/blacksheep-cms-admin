import request from './request'

// Admin article APIs
export function getArticles(params) {
  return request.get('/admin/articles', { params })
}

export function getArticle(id) {
  return request.get(`/v1/articles/${id}`)
}

export function createArticle(data) {
  return request.post('/admin/articles', data)
}

export function updateArticle(id, data) {
  return request.put(`/admin/articles/${id}`, data)
}

export function deleteArticle(id) {
  return request.delete(`/admin/articles/${id}`)
}

export function publishArticle(id) {
  return request.post(`/admin/articles/${id}/publish`)
}

export function unpublishArticle(id) {
  return request.post(`/admin/articles/${id}/unpublish`)
}

export function setBanner(id, isBanner, bannerSort = 0) {
  return request.post(`/admin/articles/${id}/set-banner?isBanner=${isBanner}&bannerSort=${bannerSort}`)
}

export function submitReview(id) {
  return request.post(`/admin/articles/${id}/submit-review`)
}

export function approveArticle(id, notes = '') {
  return request.post(`/admin/articles/${id}/approve?notes=${encodeURIComponent(notes)}`)
}

export function rejectArticle(id, notes = '') {
  return request.post(`/admin/articles/${id}/reject?notes=${encodeURIComponent(notes)}`)
}

// Trash
export function getTrash(params) {
  return request.get('/admin/articles/trash', { params })
}

export function restoreArticle(id) {
  return request.post(`/admin/articles/${id}/restore`)
}

export function permanentDeleteArticle(id) {
  return request.delete(`/admin/articles/${id}/permanent`)
}

// Public APIs
export function getBanners() {
  return request.get('/v1/articles/banners')
}

export function getCategories() {
  return request.get('/v1/articles/categories')
}

// File upload
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPublic', 'true')
  return request.post('/files/upload', formData)
}
