import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 0);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="header-subtitle">
            Welcome back,{" "}
            <span className="username">{user?.fullName || user?.username}</span>
          </p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Ready to get things done?</h2>
            <p>
              Organize your work, collaborate with your team, and achieve your
              goals efficiently.
            </p>
          </div>
        </div>

        <div className="dashboard-actions">
          <div
            className="action-card create"
            onClick={() =>
              navigate("/projects", { state: { openCreateModal: true } })
            }
          >
            <div className="card-header">
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3>Create New Project</h3>
            </div>
            <p>Start a fresh project and organize your tasks efficiently</p>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="action-card view"
            onClick={() => navigate("/projects")}
          >
            <div className="card-header">
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3>View All Projects</h3>
            </div>
            <p>Access and manage your existing projects and tasks</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
