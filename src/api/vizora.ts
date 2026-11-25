const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

type ApiResult<T> = { code: number; msg?: string; data: T; rows?: T; total?: number }

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('vizora-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL 未配置')
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  Object.entries(authHeaders()).forEach(([key, value]) => headers.set(key, value))
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })
  const result = await response.json() as ApiResult<T>
  if (!response.ok || result.code !== 200) throw new Error(result.msg || '请求失败')
  return result.data ?? (result.rows as T)
}

export const vizoraApi = {
  login: async (username: string, password: string, code?: string, uuid?: string) => {
    if (!API_BASE) throw new Error('VITE_API_BASE_URL 未配置')
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, code, uuid }),
    })
    const result = await response.json() as { code: number; msg?: string; token?: string }
    if (!response.ok || result.code !== 200 || !result.token) throw new Error(result.msg || '登录失败')
    localStorage.setItem('vizora-token', result.token)
    return { token: result.token }
  },

  templates: (category?: string, keyword?: string) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (keyword) params.set('keyword', keyword)
    return request<Array<Record<string, unknown>>>(`/api/templates?${params}`)
  },

  works: (status?: string) => request<Array<Record<string, unknown>>>(`/api/works${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  work: (id: number) => request<Record<string, unknown>>(`/api/works/${id}`),
  deleteWork: (id: number) => request<void>(`/api/works/${id}`, { method: 'DELETE' }),

  createTask: (payload: { type: string; prompt: string; inputFileIds?: string; optionsJson?: string }) =>
    request<Record<string, unknown>>('/api/creation/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  tasks: () => request<Array<Record<string, unknown>>>('/api/creation/tasks'),
  task: (id: number) => request<Record<string, unknown>>(`/api/creation/tasks/${id}`),
  cancelTask: (id: number) => request<void>(`/api/creation/tasks/${id}/cancel`, { method: 'POST' }),

  creditAccount: () => request<Record<string, unknown>>('/api/credits/account'),
  creditRecords: (type?: string) => request<Array<Record<string, unknown>>>(`/api/credits/records${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  notifications: (type?: string) => request<Array<Record<string, unknown>>>(`/api/notifications${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  readNotification: (id: number) => request<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
  readAllNotifications: () => request<void>('/api/notifications/read-all', { method: 'POST' }),

  uploadFile: async (file: File, usage = 'material', publicAsset = false) => {
    const ticket = await request<{ token: string; key: string; uploadHost: string; fileId: number }>('/api/files/upload-token', {
      method: 'POST',
      body: JSON.stringify({ originalName: file.name, mimeType: file.type, fileSize: file.size, usage, publicAsset }),
    })
    const form = new FormData()
    form.append('token', ticket.token)
    form.append('key', ticket.key)
    form.append('file', file)
    const upload = await fetch(ticket.uploadHost, { method: 'POST', body: form })
    if (!upload.ok) throw new Error('七牛云上传失败')
    return { ticket, result: await upload.json() }
  },

  fileUrl: (fileId: number, expiresSeconds = 1800) =>
    request<Record<string, unknown>>(`/api/files/${fileId}?expiresSeconds=${expiresSeconds}`),
}
