import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import TaskBoard from "../components/tasks/TaskBoard";
import { useSocket } from "../hooks/useSocket";
import ConnectionStatus from "../components/common/ConnectionStatus";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [memberError, setMemberError] = useState("");

  // Move useSocket hook to top level
  const {
    socket,
    isConnected,
    joinProject,
    leaveProject,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
  } = useSocket();

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
      setLoading(false);
    } catch (err) {
      console.error("Fetch project error:", err);
      navigate("/projects");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data.tasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  // Join project room on mount
  useEffect(() => {
    if (id && isConnected) {
      joinProject(id);

      return () => {
        leaveProject(id);
      };
    }
  }, [id, isConnected]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Task created by another user
    socket.on("task-created", (task) => {
      setTasks((prev) => [task, ...prev]);
    });

    // Task updated by another user
    socket.on("task-updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    // Task deleted by another user
    socket.on("task-deleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    // Task status changed by another user
    socket.on("task-status-changed", ({ taskId, newStatus }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    });

    // Cleanup
    return () => {
      socket.off("task-created");
      socket.off("task-updated");
      socket.off("task-deleted");
      socket.off("task-status-changed");
    };
  }, [socket]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError(""); // Clear previous errors

    if (!taskForm.title.trim()) {
      setTaskError("Task title is required");
      return;
    }

    setCreating(true);

    try {
      const response = await api.post(`/tasks/project/${id}`, taskForm);
      setTasks([response.data.task, ...tasks]);
      emitTaskCreated(id, response.data.task);
      setShowCreateTask(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        dueDate: "",
      });
      setTaskError(""); // Clear error on success
    } catch (err) {
      console.error("Failed to create task:", err);
      setTaskError("Failed to create task. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map((t) => (t.id === taskId ? response.data.task : t)));
      emitTaskUpdated(id, response.data.task);
      fetchTasks(); // Refresh to get updated data
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
      emitTaskDeleted(id, taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError(""); // Clear previous errors

    if (!memberEmail.trim()) {
      setMemberError("Please enter email");
      return;
    }

    setAdding(true);

    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      setShowAddMember(false);
      setMemberError(""); // Clear error on success
      fetchProject(); // Refresh to get updated members
    } catch (err) {
      console.error("Failed to add member:", err);
      setMemberError(
        err.response?.data?.message || "Failed to add member. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) {
      return;
    }

    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      fetchProject();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-container">
        {/* Simple Header */}
        <div className="detail-top">
          <button onClick={() => navigate("/projects")} className="back-link">
            ← Back to Projects
          </button>
          <div className="detail-actions">
            <button
              onClick={() => setShowAddMember(true)}
              className="action-btn secondary"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowCreateTask(true)}
              className="action-btn primary"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="project-info">
          <h1>{project.name}</h1>
          {project.description && (
            <p className="project-desc">{project.description}</p>
          )}
          <span className="owner-text">Created by {project.owner_name}</span>
        </div>

        {/* Tasks */}
        <div className="content-section">
          <h2>Task Board</h2>
          <TaskBoard
            tasks={tasks}
            projectId={id}
            projectMembers={project.members}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>

        {/* Members */}
        <div className="content-section">
          <h2>Team Members</h2>
          {project.members && project.members.length > 0 ? (
            <div className="members-list">
              {project.members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h4>{member.full_name || member.username}</h4>
                    <span className="member-email">{member.email}</span>
                  </div>
                  <span className={`role-tag ${member.role}`}>
                    {member.role}
                  </span>
                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No team members yet</p>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="modal-overlay" onClick={() => setShowCreateTask(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Task</h3>

            {taskError && <div className="error-message">{taskError}</div>}

            <form onSubmit={handleCreateTask}>
              <div className="form-field">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Add details (optional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {project.members &&
                    project.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name || member.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div
            className="simple-modal small"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Team Member</h3>

            {memberError && <div className="error-message">{memberError}</div>}

            <form onSubmit={handleAddMember}>
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
                <small>User must be registered</small>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={adding}>
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
