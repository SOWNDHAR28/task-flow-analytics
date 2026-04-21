import { formatDate, getStatusBadgeClass } from '../utils/formatDate';

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <span className={getStatusBadgeClass(task.status)}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(task.due_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 hover:bg-brand-500/15 transition-all"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.remarks && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 text-xs"><span className="font-semibold">Remark: </span>{task.remarks}</p>
        </div>
      )}
    </div>
  );
}
