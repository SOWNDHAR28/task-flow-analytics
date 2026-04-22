export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const isOverdue = (dueDateStr, status) => {
  if (!dueDateStr || status === 'completed') return false;
  return new Date(dueDateStr) < new Date();
};

export const completionRate = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export const getStatusBadgeClass = (status) => {
  const map = {
    completed: 'badge-completed',
    pending:   'badge-pending',
    partial:   'badge-partial',
  };
  return map[status] || 'badge-pending';
};
