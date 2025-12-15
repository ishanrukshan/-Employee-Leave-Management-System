import api from './api';

export const leaveService = {
  // Employee: Apply for leave
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  // Employee: Get my leaves
  getMyLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  // Admin: Get all leaves
  getAllLeaves: async (status = '') => {
    const response = await api.get(`/leaves/all${status ? `?status=${status}` : ''}`);
    return response.data;
  },

  // Admin: Approve leave
  approveLeave: async (leaveId, comment = '') => {
    const response = await api.put(`/leaves/${leaveId}/approve`, { comment });
    return response.data;
  },

  // Admin: Reject leave
  rejectLeave: async (leaveId, comment = '') => {
    const response = await api.put(`/leaves/${leaveId}/reject`, { comment });
    return response.data;
  },

  // Admin: Get audit logs
  getAuditLogs: async () => {
    const response = await api.get('/leaves/audit-logs');
    return response.data;
  },
};
