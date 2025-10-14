import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useSocket } from "../../hooks/useSocket";

const TaskModal = ({
  task,
  projectId,
  projectMembers,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    assignedTo: task.assigned_to || "",
    dueDate: task.due_date ? task.due_date.split("T")[0] : "",
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { socket, emitCommentAdded, emitCommentDeleted } = useSocket();

  useEffect(() => {
    fetchTaskDetails();
  }, [task.id]);

  // Listen for real-time comment updates
  useEffect(() => {
    if (!socket) return;

    socket.on("comment-added", ({ taskId, comment }) => {
      if (taskId === task.id) {
        setComments((prev) => [...prev, comment]);
      }
    });

    socket.on("comment-deleted", ({ taskId, commentId }) => {
      if (taskId === task.id) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    });

    return () => {
      socket.off("comment-added");
      socket.off("comment-deleted");
    };
  }, [socket, task.id]);

  const fetchTaskDetails = async () => {
    try {
      const response = await api.get(`/tasks/${task.id}`);
      setComments(response.data.task.comments || []);
    } catch (err) {
      console.error("Fetch task details error:", err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate(task.id, formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(task.id);
      onClose();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/tasks/${task.id}/comments`, {
        content: newComment,
      });
      setComments([...comments, response.data.comment]);
      emitCommentAdded(projectId, task.id, response.data.comment);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`/tasks/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      emitCommentDeleted(projectId, task.id, commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="task-modal-content">
          {isEditing ? (
            // Edit Mode
            <div className="task-edit-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {projectMembers &&
                    projectMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name || member.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="task-view">
              <div className="task-header-info">
                <h3>{task.title}</h3>
                <div className="task-meta">
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  <span className={`status-badge status-${task.status}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {task.description && (
                <div className="task-section">
                  <h4>Description</h4>
                  <p>{task.description}</p>
                </div>
              )}

              <div className="task-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Created by</span>
                  <span className="detail-value">{task.created_by_name}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Assigned to</span>
                  <span className="detail-value">
                    {task.assigned_to_name || "Unassigned"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Due date</span>
                  <span className="detail-value">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Task
                </button>
                <button onClick={handleDelete} className="btn-danger">
                  Delete Task
                </button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="comments-section">
            <h4>Comments ({comments.length})</h4>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button type="submit" className="btn-primary btn-small">
                Add Comment
              </button>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="empty-message">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="author-avatar">
                          {comment.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {comment.full_name || comment.username}
                          </strong>
                          <span className="comment-time">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn-delete-comment"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
