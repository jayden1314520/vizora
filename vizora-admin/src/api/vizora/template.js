import request from '@/utils/request'

export function listTemplate(query) {
  return request({ url: '/vizora/template/list', method: 'get', params: query })
}

export function getTemplate(id) {
  return request({ url: `/vizora/template/${id}`, method: 'get' })
}

export function addTemplate(data) {
  return request({ url: '/vizora/template', method: 'post', data })
}

export function updateTemplate(data) {
  return request({ url: '/vizora/template', method: 'put', data })
}

export function delTemplate(ids) {
  return request({ url: `/vizora/template/${ids}`, method: 'delete' })
}
