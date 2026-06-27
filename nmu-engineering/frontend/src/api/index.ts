import { apiClient } from './client'
import type {
  Program, NewsArticle, FacultyMember, Event, ResearchProject,
  Laboratory, Download, HomepageContent, ContactInfo, Department,
  PaginatedResponse, User,
} from '@/types'

// Re-export authApi so all API modules are available from a single '@/api' import
export { authApi } from './auth'

// ── Generic CRUD factory ──────────────────────────────────────────────────────
function makeCrud<T>(base: string) {
  return {
    list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<T>> => {
      // Strip undefined values so they don't get sent as "undefined" strings
      const cleanParams: Record<string, unknown> = {}
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) cleanParams[k] = v
        })
      }
      const { data } = await apiClient.get<PaginatedResponse<T>>(base, { params: cleanParams })
      return data
    },
    get: async (id: string): Promise<T> => {
      const { data } = await apiClient.get<T>(`${base}/${id}`)
      return data
    },
    create: async (payload: Partial<T>): Promise<T> => {
      const { data } = await apiClient.post<T>(base, payload)
      return data
    },
    update: async (id: string, payload: Partial<T>): Promise<T> => {
      const { data } = await apiClient.put<T>(`${base}/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`${base}/${id}`)
    },
  }
}

// ── Programs ──────────────────────────────────────────────────────────────────
export const programsApi = {
  ...makeCrud<Program>('/programs'),
  getBySlug: async (slug: string): Promise<Program> => {
    const { data } = await apiClient.get<Program>(`/programs/slug/${slug}`)
    return data
  },
  uploadStudyPlan: async (programId: string, file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<{ url: string }>(
      `/programs/${programId}/study-plan`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },
}

// ── Departments ───────────────────────────────────────────────────────────────
export const departmentsApi = makeCrud<Department>('/departments')

// ── Faculty Members ───────────────────────────────────────────────────────────
export const facultyApi = {
  ...makeCrud<FacultyMember>('/faculty'),
  uploadPhoto: async (memberId: string, file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<{ url: string }>(
      `/faculty/${memberId}/photo`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },
}

// ── News ─────────────────────────────────────────────────────────────────────
export const newsApi = {
  ...makeCrud<NewsArticle>('/news'),
  // Admin: list all articles regardless of published status
  listAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<NewsArticle>> => {
    const cleanParams: Record<string, unknown> = { limit: 100, ...(params || {}) }
    const { data } = await apiClient.get<PaginatedResponse<NewsArticle>>('/news', { params: cleanParams })
    return data
  },
  uploadImage: async (articleId: string, file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<{ url: string }>(
      `/news/${articleId}/image`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },
}

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  ...makeCrud<Event>('/events'),
  // Admin: list all events regardless of published status
  listAll: async (): Promise<PaginatedResponse<Event>> => {
    const { data } = await apiClient.get<PaginatedResponse<Event>>('/events', {
      params: { limit: 100 }
    })
    return data
  },
}

// ── Research ──────────────────────────────────────────────────────────────────
export const researchApi = {
  ...makeCrud<ResearchProject>('/research'),
  listAll: async (): Promise<PaginatedResponse<ResearchProject>> => {
    const { data } = await apiClient.get<PaginatedResponse<ResearchProject>>('/research', {
      params: { limit: 100 }
    })
    return data
  },
}

export const laboratoriesApi = {
  ...makeCrud<Laboratory>('/laboratories'),
  listAll: async (): Promise<PaginatedResponse<Laboratory>> => {
    const { data } = await apiClient.get<PaginatedResponse<Laboratory>>('/laboratories', {
      params: { limit: 100 }
    })
    return data
  },
  uploadImage: async (labId: string, file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<{ url: string }>(
      `/laboratories/${labId}/image`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },
}

// ── Downloads ─────────────────────────────────────────────────────────────────
export const downloadsApi = {
  ...makeCrud<Download>('/downloads'),
  listAll: async (): Promise<PaginatedResponse<Download>> => {
    const { data } = await apiClient.get<PaginatedResponse<Download>>('/downloads', {
      params: { limit: 100 }
    })
    return data
  },
  uploadFile: async (file: File, meta: { title_en: string; title_ar: string; category: string; program_id?: string }): Promise<Download> => {
    const form = new FormData()
    form.append('file', file)
    form.append('title_en', meta.title_en)
    form.append('title_ar', meta.title_ar || meta.title_en)
    form.append('category', meta.category)
    if (meta.program_id) form.append('program_id', meta.program_id)
    const { data } = await apiClient.post<Download>('/downloads/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

// ── Homepage ──────────────────────────────────────────────────────────────────
export const homepageApi = {
  get: async (): Promise<HomepageContent> => {
    const { data } = await apiClient.get<HomepageContent>('/homepage')
    return data
  },
  update: async (payload: Partial<HomepageContent>): Promise<HomepageContent> => {
    const { data } = await apiClient.put<HomepageContent>('/homepage', payload)
    return data
  },
  uploadDeanPhoto: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<{ url: string }>('/homepage/dean-photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactApi = {
  get: async (): Promise<ContactInfo> => {
    const { data } = await apiClient.get<ContactInfo>('/contact')
    return data
  },
  update: async (payload: Partial<ContactInfo>): Promise<ContactInfo> => {
    const { data } = await apiClient.put<ContactInfo>('/contact', payload)
    return data
  },
  sendMessage: async (payload: {
    name: string; email: string; subject: string; message: string
  }): Promise<void> => {
    await apiClient.post('/contact/message', payload)
  },
}

// ── Users (Super Admin) ───────────────────────────────────────────────────────
export const usersApi = {
  ...makeCrud<User>('/users'),
  resetPassword: async (userId: string, new_password: string): Promise<void> => {
    await apiClient.put(`/users/${userId}/reset-password`, { new_password })
  },
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  programs: number
  faculty: number
  news: number
  events: number
  downloads: number
  recent_activity: {
    action: string
    user: string
    time: string
    type: 'create' | 'update' | 'delete' | 'upload' | 'login'
  }[]
}

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
    return data
  },
}
