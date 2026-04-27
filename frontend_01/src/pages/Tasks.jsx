import { useEffect, useState } from "react";
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../services/taskService";
import { formatDate, getStatusBadgeClass } from "../utils/formatDate";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    remarks: "",
    due_date: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const [tempProgress, setTempProgress] = useState(50);

  const [openStatusId, setOpenStatusId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenStatusId(null);
      setOpenFilter(false);
      setOpenSort(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return toast.error("Title required");

    const created = await createTask(newTask);
    setTasks((prev) => [created, ...prev]);

    setShowModal(false);
    setNewTask({
      title: "",
      description: "",
      status: "pending",
      remarks: "",
      due_date: "",
    });
  };

  const handleStatusChange = async (id, status) => {
    await updateTaskStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handlePartialClick = (task) => {
    setEditingTaskId(task.id);
    setTempRemarks(task.remarks || "");
    setTempProgress(task.progress || 50);
    setOpenStatusId(null);
  };

  const handleSaveRemarks = async (id) => {
    if (!tempRemarks.trim()) return toast.error("Remarks required");

    await updateTaskStatus(id, "partial", tempRemarks, tempProgress);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "partial",
              remarks: tempRemarks,
              progress: tempProgress,
            }
          : t,
      ),
    );

    setEditingTaskId(null);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const set = (k, v) => setNewTask((p) => ({ ...p, [k]: v }));

  // PROCESSING
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

  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = processedTasks.slice(
    startIndex,
    startIndex + tasksPerPage,
  );

  const totalPages = Math.ceil(processedTasks.length / tasksPerPage);

  const getProgressColor = (p) => {
    if (p < 30) return "bg-red-500";
    if (p < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Create and manage your tasks</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-4 py-2"
        >
          + Add Task
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md p-6">
            <h2 className="card-title mb-4">Create Task</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                className="input-field w-full"
                placeholder="Title *"
                value={newTask.title}
                onChange={(e) => set("title", e.target.value)}
              />

              <input
                className="input-field w-full"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => set("description", e.target.value)}
              />

              <input
                type="date"
                className="input-field w-full"
                value={newTask.due_date}
                onChange={(e) => set("due_date", e.target.value)}
              />

              <input
                className="input-field w-full"
                placeholder="Remarks"
                value={newTask.remarks}
                onChange={(e) => set("remarks", e.target.value)}
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

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          placeholder="Search tasks..."
          className="input-field w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenFilter(!openFilter);
            }}
            className="btn-secondary px-4 py-2 capitalize"
          >
            {filter}
          </button>

          {openFilter && (
            <div className="absolute mt-2 card p-2 z-50">
              {["all", "completed", "pending", "partial"].map((f) => (
                <div
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setOpenFilter(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
            onClick={(e) => {
              e.stopPropagation();
              setOpenSort(!openSort);
            }}
            className="btn-secondary px-4 py-2"
          >
            {sort === "latest" ? "Latest" : "Due Date"}
          </button>

          {openSort && (
            <div className="absolute mt-2 card p-2 z-50">
              {["latest", "due"].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setOpenSort(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TASK LIST */}
      {loading ? (
        <Loader text="Loading tasks..." />
      ) : paginatedTasks.length === 0 ? (
        <div className="card text-center py-16">No tasks found</div>
      ) : (
        <div className="space-y-4">
          {paginatedTasks.map((task) => (
            <div key={task.id} className="card p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>

                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                  )}

                  <p className="text-xs">Due: {formatDate(task.due_date)}</p>
                </div>

                <span className={getStatusBadgeClass(task.status)}>
                  {task.status}
                </span>
              </div>

              {task.status === "partial" && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className={`${getProgressColor(task.progress || 0)} h-2 rounded`}
                      style={{ width: `${task.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {task.progress || 0}% • {task.remarks}
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-4">
                {editingTaskId !== task.id ? (
                  <>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStatusId(
                            openStatusId === task.id ? null : task.id,
                          );
                        }}
                        className={`px-3 py-1 rounded text-sm capitalize ${getStatusBadgeClass(
                          task.status,
                        )}`}
                      >
                        {task.status} ▼
                      </button>

                      {openStatusId === task.id && (
                        <div className="absolute mt-2 card p-2 z-50">
                          {["pending", "partial", "completed"].map((s) => (
                            <div
                              key={s}
                              onClick={() => {
                                if (s === "partial") handlePartialClick(task);
                                else handleStatusChange(task.id, s);
                                setOpenStatusId(null);
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <div className="w-full flex flex-col gap-2">
                    <input
                      className="input-field w-full"
                      value={tempRemarks}
                      onChange={(e) => setTempRemarks(e.target.value)}
                    />

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tempProgress}
                      onChange={(e) => setTempProgress(e.target.value)}
                    />

                    <p>{tempProgress}%</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveRemarks(task.id)}
                        className="btn-primary text-sm"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="btn-secondary px-3 py-1"
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
                : "btn-secondary"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="btn-secondary px-3 py-1"
        >
          →
        </button>
      </div>
    </div>
  );
}
