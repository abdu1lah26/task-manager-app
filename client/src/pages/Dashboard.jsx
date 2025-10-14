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
          onClick={() => navigate("/projects")}
          className="btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Go to Projects
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
