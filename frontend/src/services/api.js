import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const logService = {
  checkHealth: async () => {
    const { data } = await api.get('/health')
    return data
  },

  analyzeLogFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/logs/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  analyzeSampleLog: async () => {
    const { data } = await api.post('/logs/sample')
    return data
  },

  getSampleLogText: async () => {
    const { data } = await api.get('/logs/sample')
    return data
  },

  getReports: async () => {
    const { data } = await api.get('/reports')
    return data
  },

  getReportById: async (id) => {
    const { data } = await api.get(`/reports/${id}`)
    return data
  },

  getLatestReport: async () => {
    const { data } = await api.get('/reports/latest')
    return data
  },

  getStatistics: async (reportId) => {
    const { data } = await api.get('/statistics', {
      params: reportId ? { reportId } : {},
    })
    return data
  },

  getSummaryText: async (id) => {
    const { data } = await api.get(`/reports/${id}/summary`, {
      responseType: 'text',
    })
    return data
  },

  getCsvDownloadUrl: (id) => `${API_BASE_URL}/reports/${id}/csv`,
  getSummaryDownloadUrl: (id) => `${API_BASE_URL}/reports/${id}/summary`,
}

