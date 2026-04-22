import API from './api';

export const getAllTasks = async () => {
  const res = await API.get('/tasks/');
  return res.data.data;
};

export const getTask = async (id) => {
  const res = await API.get(`/tasks/${id}/`);
  return res.data.data;
};

export const createTask = async (taskData) => {
  const res = await API.post('/tasks/', taskData);
  return res.data.data;
};

export const updateTask = async (id, taskData) => {
  const res = await API.put(`/tasks/${id}/`, taskData);
  return res.data.data;
};

export const updateTaskStatus = async (id, status, remarks = '') => {
  const res = await API.patch(`/tasks/${id}/status/`, { status, remarks });
  return res.data.data;
};

export const deleteTask = async (id) => {
  const res = await API.delete(`/tasks/${id}/`);
  return res.data.data;
};
