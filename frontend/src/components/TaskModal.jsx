import { useState, useEffect } from 'react';
import Modal from './Modal';

const INITIAL = { title: '', description: '', due_date: '', status: 'pending', remarks: '' };

export default function TaskModal({ isOpen, onClose, onSave, task, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date || '',
        status: task.status || 'pending',
        remarks: task.remarks || '',
      });
    } else {
      setForm(INITIAL);
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.status === 'partial' && !form.remarks.trim()) e.remarks = 'Remarks required for partial status';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave(form);
  };

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
          <input
            id="task-title"
            className="input-field"
            placeholder="Enter task title..."
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea
            id="task-description"
            className="input-field resize-none"
            rows={3}
            placeholder="Enter description..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            className="input-field"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
          <div className="flex gap-3">
            {['pending', 'partial', 'completed'].map((s) => (
              <label
                key={s}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer transition-all text-sm font-medium capitalize
                  ${form.status === s
                    ? s === 'completed' ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                      : s === 'partial' ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                      : 'bg-red-500/15 border-red-500/50 text-red-400'
                    : 'border-surface-border text-gray-500 hover:border-gray-500'}`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="status"
                  value={s}
                  checked={form.status === s}
                  onChange={() => set('status', s)}
                />
                <span className={`w-2 h-2 rounded-full ${form.status === s ? 'bg-current' : 'bg-gray-600'}`} />
                {s}
              </label>
            ))}
          </div>
        </div>

        {form.status === 'partial' && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Remarks *</label>
            <textarea
              id="task-remarks"
              className="input-field resize-none"
              rows={2}
              placeholder="Why is this partial?"
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
            />
            {errors.remarks && <p className="text-red-400 text-xs mt-1">{errors.remarks}</p>}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button type="submit" id="task-save-btn" className="btn-primary flex-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (task ? 'Update Task' : 'Add Task')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
