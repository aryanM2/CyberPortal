import api from './api';

// Get all assessments
export const getAssessments = async (params = {}) => { // e.g., { status: 'pending', limit: 5 }
  const response = await api.get('/assessments', { params });
  return response.data;
};

// Get single assessment
export const getAssessment = async (id) => {
  const response = await api.get(`/assessments/${id}`);
  return response.data;
};

// Create assessment
export const createAssessment = async (assessmentData) => {
  const response = await api.post('/assessments', assessmentData);
  return response.data;
};

// Update assessment
export const updateAssessment = async (id, assessmentData) => {
  const response = await api.put(`/assessments/${id}`, assessmentData);
  return response.data;
};

// Delete assessment
export const deleteAssessment = async (id) => {
  const response = await api.delete(`/assessments/${id}`);
  return response.data;
};

// Get dashboard stats
export const getStats = async () => {
  const response = await api.get('/assessments/stats');
  return response.data;
};

const assessmentService = {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getStats,
};

export default assessmentService;
