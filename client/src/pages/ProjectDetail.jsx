import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TaskBoard from '../components/tasks/TaskBoard';
import { useSocket } from '../hooks/useSocket';
import ConnectionStatus from '../components/common/ConnectionStatus';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);

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
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
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
      console.error('Fetch project error:', err);
      toast.error('Failed to load project');
      navigate('/projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      toast.error('Failed to load tasks');
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
  socket.on('task-created', (task) => {
    setTasks((prev) => [task, ...prev]);
    toast.success(`New task created: ${task.title}`);
  });

  // Task updated by another user
  socket.on('task-updated', (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  });

// Task deleted by another user
socket.on('task-deleted', (taskId) => {
  setTasks((prev) => prev.filter((t) => t.id !== taskId));
  toast.success('Task deleted');
});

  // Task status changed by another user
  socket.on('task-status-changed', ({ taskId, newStatus }) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  });

  // Cleanup
  return () => {
    socket.off('task-created');
    socket.off('task-updated');
    socket.off('task-deleted');
    socket.off('task-status-changed');
  };
}, [socket]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setCreating(true);

    try {
      const response = await api.post(`/tasks/project/${id}`, taskForm);
      setTasks([response.data.task, ...tasks]);
      emitTaskCreated(id, response.data.task);
      toast.success('Task created!');
      setShowCreateTask(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(t => t.id === taskId ? response.data.task : t));
      emitTaskUpdated(id, response.data.task);
      toast.success('Task updated!');
      fetchTasks(); // Refresh to get updated data
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      emitTaskDeleted(id, taskId);
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      toast.error('Please enter email');
      return;
    }

    setAdding(true);

    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added successfully!');
      setMemberEmail('');
      setShowAddMember(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
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
    <div className="project-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/projects')} className="btn-back">
          ← Back to Projects
        </button>
        <ConnectionStatus />
      </div>

      {/* Project Info */}
      <div className="project-info-card">
        <div className="project-title-section">
          <h1>{project.name}</h1>
          <span className={`status-badge ${project.status}`}>
            {project.status}
          </span>
        </div>
        <p className="project-description">
          {project.description || 'No description'}
        </p>
        <p className="project-owner">Created by {project.owner_name}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>{project.stats.total_tasks || 0}</h3>
          <p>Total Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{project.stats.todo_tasks || 0}</h3>
          <p>Todo</p>
        </div>
        <div className="stat-card">
          <h3>{project.stats.in_progress_tasks || 0}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{project.stats.completed_tasks || 0}</h3>
          <p>Completed</p>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section-header">
        <h2>Task Board</h2>
        <button
          onClick={() => setShowCreateTask(true)}
          className="btn-primary"
        >
          + Create Task
        </button>
      </div>

      <TaskBoard
        tasks={tasks}
        projectId={id}
        projectMembers={project.members}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />

      {/* Members Section */}
      <div className="members-section">
        <div className="section-header">
          <h2>Team Members ({project.members?.length || 0})</h2>
          <button
            onClick={() => setShowAddMember(true)}
            className="btn-primary btn-small"
          >
            + Add Member
          </button>
        </div>

        <div className="members-list">
          {project.members && project.members.length > 0 ? (
            project.members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{member.full_name || member.username}</h4>
                    <p>{member.email}</p>
                  </div>
                </div>
                <div className="member-actions">
                  <span className={`role-badge ${member.role}`}>
                    {member.role}
                  </span>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="btn-danger btn-small"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">No members yet. Add team members to collaborate!</p>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="modal-overlay" onClick={() => setShowCreateTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateTask(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Enter task description (optional)"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
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

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assign To</label>
                <select
                  id="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {project.members && project.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddMember(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label htmlFor="memberEmail">Member Email</label>
                <input
                  type="email"
                  id="memberEmail"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Enter user's email"
                  required
                />
                <small>User must be registered on the platform</small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Member'}
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