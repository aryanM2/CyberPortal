import api from './api';

export const reportService = {
  // Get all reports
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // Get single report
  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Create report
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Update report
  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Approve report
  approveReport: async (id) => {
    const response = await api.patch(`/reports/${id}/approve`);
    return response.data;
  },

  // Reject report
  rejectReport: async (id, reason) => {
    const response = await api.patch(`/reports/${id}/reject`, { reason });
    return response.data;
  },

  // Download PDF
  downloadPDF: async (id) => {
    const response = await api.get(`/reports/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;
