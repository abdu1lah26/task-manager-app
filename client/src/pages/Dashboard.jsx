import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

        <div className="welcome-card">
            <h2>Welcome, {user?.fullName || user?.username}! 🎉</h2>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
            <p className="success-message">
                ✅ Authentication is working perfectly!
            </p>
            <button 
                onClick={() => navigate('/projects')} 
                className="btn-primary"
                style={{ marginTop: '1rem' }}
            >
                Go to Projects
            </button>
        </div>

      <div className="info-card">
        <h3>What's Next?</h3>
        <ul>
          <li>✅ Authentication Complete</li>
          <li>📋 Projects Management (Coming Soon)</li>
          <li>✅ Task Board (Coming Soon)</li>
          <li>💬 Real-time Updates (Coming Soon)</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;