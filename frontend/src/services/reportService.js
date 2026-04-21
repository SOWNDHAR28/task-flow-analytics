import API from "./api";

// GET /api/reports/weekly/
export const getWeeklyReport = async () => {
  const response = await API.get("/reports/weekly/");
  return response.data.data; // { total_tasks, completed_tasks, completion_rate }
};

// GET /api/reports/monthly/
export const getMonthlyReport = async () => {
  const response = await API.get("/reports/monthly/");
  return response.data.data; // { total_tasks, completed_tasks, completion_rate }
};