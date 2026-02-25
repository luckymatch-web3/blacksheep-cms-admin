import request from './request'

export function getForumStats() {
  return request.get('/admin/forum/stats')
}

export function getForumPosts(params) {
  return request.get('/admin/forum/posts', { params })
}

export function approveForumPost(postId) {
  return request.post(`/admin/forum/posts/${postId}/approve`)
}

export function rejectForumPost(postId, reason) {
  return request.post(`/admin/forum/posts/${postId}/reject`, null, { params: { reason } })
}
