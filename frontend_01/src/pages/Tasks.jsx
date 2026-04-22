import { useEffect, useState } from 'react';
import {
  getAllTasks, createTask, updateTaskStatus, deleteTask,
} from '../services/taskService';
import { formatDate, getStatusBadgeClass } from '../utils/formatDate';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Tasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'pending', remarks: '', due_date: '',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempRemarks,   setTempRemarks]   = useState('');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) { toast.error('Title is required'); return; }
    try {
      const created = await createTask(newTask);
      setTasks((p) => [created, ...p]);
      setNewTask({ title: '', description: '', status: 'pending', remarks: '', due_date: '' });
      toast.success('Task created 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const handlePartialClick = (task) => {
    setEditingTaskId(task.id);
    setTempRemarks(task.remarks || '');
  };

  const handleSaveRemarks = async (id) => {
    if (!tempRemarks.trim()) { toast.error('Remarks required'); return; }
    try {
      await updateTaskStatus(id, 'partial', tempRemarks);
      setTasks((p) => p.map((t) =>
        t.id === id ? { ...t, status: 'partial', remarks: tempRemarks } : t
      ));
      setEditingTaskId(null);
      setTempRemarks('');
      toast.success('Updated with remarks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      setTasks((p) => p.map((t) => t.id === id ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((p) => p.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const set = (k, v) => setNewTask((p) => ({ ...p, [k]: v }));

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">My Tasks</h1>
        <p className="page-subtitle">Create and manage your tasks</p>
      </div>

      {/* Create task form */}
      <div className="card mb-8">
        <h2 className="card-title mb-5">Add New Task</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => set('title', e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              className="input-field"
              value={newTask.due_date}
              onChange={(e) => set('due_date', e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Remarks (optional)"
              value={newTask.remarks}
              onChange={(e) => set('remarks', e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
            + Add Task
          </button>
        </form>
      </div>

      {/* Task list */}
      {loading ? (
        <Loader text="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-primary font-medium">No tasks yet</p>
          <p className="text-secondary text-sm mt-1">Add your first task above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="card card-hover">
              {/* Title + badge */}
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-semibold text-primary text-base leading-snug flex-1">
                  {task.title}
                </h3>
                <span className={getStatusBadgeClass(task.status)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {task.status}
                </span>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-secondary text-sm mt-2">{task.description}</p>
              )}

              {/* Inline partial remarks editor */}
              {editingTaskId === task.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Enter remarks for partial completion..."
                    value={tempRemarks}
                    onChange={(e) => setTempRemarks(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveRemarks(task.id)} className="btn-success text-sm px-4 py-2">
                      Save Remarks
                    </button>
                    <button onClick={() => setEditingTaskId(null)} className="btn-secondary text-sm px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                task.remarks && (
                  <p className="text-muted text-sm mt-2 italic">📝 {task.remarks}</p>
                )
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted mt-3">
                <span>📅 Due: {formatDate(task.due_date)}</span>
                {task.created_at && (
                  <span>🕐 Created: {formatDate(task.created_at)}</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4"
                style={{ borderTop: '1px solid rgb(var(--surface-border))' }}>
                <button
                  onClick={() => handleStatusChange(task.id, 'pending')}
                  className="btn-secondary text-sm"
                  style={task.status === 'pending' ? {
                    borderColor: 'rgb(var(--status-danger) / 0.5)',
                    color: 'rgb(var(--status-danger))',
                  } : {}}
                >
                  Pending
                </button>
                <button
                  onClick={() => handlePartialClick(task)}
                  className="btn-secondary text-sm"
                  style={task.status === 'partial' ? {
                    borderColor: 'rgb(var(--status-warning) / 0.5)',
                    color: 'rgb(var(--status-warning))',
                  } : {}}
                >
                  Partial
                </button>
                <button
                  onClick={() => handleStatusChange(task.id, 'completed')}
                  className="btn-success text-sm"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="btn-danger text-sm ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
