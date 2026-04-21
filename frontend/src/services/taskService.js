import API from "./api";


// GET /api/tasks/
export const getAllTasks = async () => {
  const response = await API.get("/tasks/");
  return response.data.data; // returns array of tasks
};

// GET /api/tasks/:id/
export const getTask = async (id) => {
  const response = await API.get(`/tasks/${id}/`);
  return response.data.data; // returns single task
};

// POST /api/tasks/
export const createTask = async (taskData) => {
  // taskData = { title, description, status, remarks, due_date }
  const response = await API.post("/tasks/", taskData);
  return response.data.data; // returns created task
};

// PUT /api/tasks/:id/
export const updateTask = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}/`, taskData);
  return response.data.data; // returns { id, title, status, remarks, updated_at }
};

// PATCH /api/tasks/:id/status/
export const updateTaskStatus = async (id, status, remarks = "") => {
  const response = await API.patch(`/tasks/${id}/status/`, {
    status,
    remarks,
  });
  return response.data.data; // returns { id, status, completed_at }
};

// DELETE /api/tasks/:id/
export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}/`);
  return response.data.data; // returns { message: "Task deleted successfully" }
};