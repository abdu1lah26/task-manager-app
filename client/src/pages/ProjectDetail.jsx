import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProject();
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
      fetchProject(); // Refresh project data
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

      {/* Tasks Section (Placeholder) */}
      <div className="tasks-section">
        <h2>Tasks</h2>
        <p className="empty-message">Task board coming soon! 🚀</p>
      </div>

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