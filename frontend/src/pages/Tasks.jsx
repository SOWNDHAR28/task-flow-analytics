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
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    remarks: "",
    due_date: "",
  });

  // 🔥 Track which task is editing remarks
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newTask.title) {
      toast.error("Title is required");
      return;
    }

    try {
      const created = await createTask(newTask);
      setTasks((prev) => [created, ...prev]);

      setNewTask({
        title: "",
        description: "",
        status: "pending",
        remarks: "",
        due_date: "",
      });

      toast.success("Task created 🚀");
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  // 🔥 Open inline input for partial
  const handlePartialClick = (task) => {
    setEditingTaskId(task.id);
    setTempRemarks(task.remarks || "");
  };

  // 🔥 Save remarks
  const handleSaveRemarks = async (id) => {
    if (!tempRemarks.trim()) {
      toast.error("Remarks required");
      return;
    }

    try {
      await updateTaskStatus(id, "partial", tempRemarks);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "partial", remarks: tempRemarks } : t,
        ),
      );

      setEditingTaskId(null);
      setTempRemarks("");

      toast.success("Updated with remarks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      );

      toast.success("Status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

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
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

      {/* Create Task */}
      <form onSubmit={handleCreate} className="space-y-3 mb-8">
        <input
          className="input-field w-full"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
        />

        <button className="btn-primary w-full">Add Task</button>
      </form>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 border border-surface-border rounded-xl bg-surface-card shadow-card"
          >
            {/* Title + Status */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">{task.title}</h3>

              <span
                className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                  task.status,
                )}`}
              >
                {task.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 mt-2">{task.description}</p>

            {/* 🔥 INLINE REMARKS INPUT */}
            {editingTaskId === task.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  className="input-field w-full"
                  placeholder="Enter remarks..."
                  value={tempRemarks}
                  onChange={(e) => setTempRemarks(e.target.value)}
                />

                <div className="flex gap-2">
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
            ) : (
              task.remarks && (
                <p className="text-gray-500 mt-2 text-sm italic">
                  📝 {task.remarks}
                </p>
              )
            )}

            {/* Dates */}
            <div className="text-sm text-gray-500 mt-3">
              <p>📅 Due: {task.due_date || "N/A"}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
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
    </div>
  );
}
