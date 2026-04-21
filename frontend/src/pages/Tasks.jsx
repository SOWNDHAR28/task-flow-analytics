import { useEffect, useState } from "react";
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../services/taskService";
import toast from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  // 🔥 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔥 Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title) return toast.error("Title required");

    const created = await createTask(newTask);
    setTasks((prev) => [created, ...prev]);
    setShowModal(false);
    setNewTask({ title: "", description: "", due_date: "" });
  };

  const handleStatusChange = async (id, status) => {
    await updateTaskStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handlePartialClick = (task) => {
    setEditingTaskId(task.id);
    setTempRemarks(task.remarks || "");
  };

  const handleSaveRemarks = async (id) => {
    if (!tempRemarks.trim()) return toast.error("Remarks required");

    await updateTaskStatus(id, "partial", tempRemarks);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "partial", remarks: tempRemarks } : t,
      ),
    );

    setEditingTaskId(null);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // 🔥 PROCESS TASKS
  let processedTasks = [...tasks];

  processedTasks = processedTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (filter !== "all") {
    processedTasks = processedTasks.filter((t) => t.status === filter);
  }

  if (sort === "due") {
    processedTasks.sort(
      (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0),
    );
  }

  // 🔥 PAGINATION LOGIC
  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = processedTasks.slice(
    startIndex,
    startIndex + tasksPerPage,
  );
  const totalPages = Math.ceil(processedTasks.length / tasksPerPage);

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-400";
      case "partial":
        return "bg-amber-500/15 text-amber-400";
      default:
        return "bg-red-500/15 text-red-400";
    }
  };

  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-4 py-2 shadow-lg"
        >
          + Add Task
        </button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          placeholder="Search tasks..."
          className="bg-surface-card border border-surface-border text-gray-300 
                     px-4 py-2 rounded-xl w-64
                     focus:outline-none focus:ring-2 focus:ring-brand-500 
                     hover:bg-surface-hover transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER */}
        <div className="relative">
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="bg-surface-card border border-surface-border px-4 py-2 rounded-xl w-32"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)} ▼
          </button>

          {openFilter && (
            <div className="absolute mt-2 min-w-[160px] w-max bg-surface-card border border-surface-border rounded-xl shadow-lg z-50">
              {["all", "completed", "pending", "partial"].map((f) => (
                <div
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setOpenFilter(false);
                  }}
                  className="px-4 py-2 hover:bg-surface-hover cursor-pointer capitalize"
                >
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SORT */}
        <div className="relative">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="bg-surface-card border border-surface-border px-4 py-2 rounded-xl w-36"
          >
            {sort === "latest" ? "Latest" : "Due Date"} ▼
          </button>

          {openSort && (
            <div className="absolute mt-2 min-w-[160px] w-max bg-surface-card border border-surface-border rounded-xl shadow-lg z-50">
              {[
                { key: "latest", label: "Latest" },
                { key: "due", label: "Due Date" },
              ].map((s) => (
                <div
                  key={s.key}
                  onClick={() => {
                    setSort(s.key);
                    setOpenSort(false);
                  }}
                  className="px-4 py-2 hover:bg-surface-hover cursor-pointer"
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create Task</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                className="input-field w-full"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              <input
                className="input-field w-full"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />

              <input
                type="date"
                className="input-field w-full"
                value={newTask.due_date}
                onChange={(e) =>
                  setNewTask({ ...newTask, due_date: e.target.value })
                }
              />

              <div className="flex gap-2 mt-4">
                <button className="btn-primary w-full">Create</button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK LIST */}
      <div className="grid gap-4">
        {paginatedTasks.map((task) => (
          <div key={task.id} className="card p-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${getStatusStyle(task.status)}`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-gray-400 mt-2">{task.description}</p>

            {editingTaskId === task.id && (
              <div className="mt-3">
                <textarea
                  className="input-field w-full"
                  value={tempRemarks}
                  onChange={(e) => setTempRemarks(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSaveRemarks(task.id)}
                    className="btn-success"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleStatusChange(task.id, "pending")}
                className="btn-secondary"
              >
                Pending
              </button>
              <button
                onClick={() => handlePartialClick(task)}
                className="btn-secondary"
              >
                Partial
              </button>
              <button
                onClick={() => handleStatusChange(task.id, "completed")}
                className="btn-success"
              >
                Completed
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION UI */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 rounded bg-surface-card"
        >
          ←
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-brand-500 text-white"
                : "bg-surface-card"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 rounded bg-surface-card"
        >
          →
        </button>
      </div>
    </div>
  );
}
