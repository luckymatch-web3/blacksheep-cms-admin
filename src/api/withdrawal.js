import request from './request'

export function getWithdrawals(params) {
  return request.get('/admin/withdrawals', { params })
}

export function approveWithdrawal(id, txHash = null) {
  return request.post(`/admin/withdrawals/${id}/approve`, txHash ? { txHash } : {})
}

export function rejectWithdrawal(id, reason) {
  return request.post(`/admin/withdrawals/${id}/reject`, null, { params: { reason } })
}
