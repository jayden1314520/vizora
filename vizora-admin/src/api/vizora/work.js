import request from '@/utils/request'

export function listWork(query) {
  return request({ url: '/vizora/work/list', method: 'get', params: query })
}

export function moderateWork(workId, data) {
  return request({ url: `/vizora/work/${workId}/status`, method: 'put', data })
}
