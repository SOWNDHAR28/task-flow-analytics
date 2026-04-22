import API from './api';

export const getWeeklyReport = async () => {
  const res = await API.get('/reports/weekly/');
  return res.data.data;
};

export const getMonthlyReport = async () => {
  const res = await API.get('/reports/monthly/');
  return res.data.data;
};
