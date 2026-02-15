import request from './request'

// Forum admin APIs
export function getForumPosts(params) {
  return request.get('/admin/forum/posts', { params })
}

export function approvePost(postId) {
  return request.post(`/admin/forum/posts/${postId}/approve`)
}

export function rejectPost(postId, reason = '') {
  return request.post(`/admin/forum/posts/${postId}/reject?reason=${encodeURIComponent(reason)}`)
}

export function getForumStats() {
  return request.get('/admin/forum/stats')
}
