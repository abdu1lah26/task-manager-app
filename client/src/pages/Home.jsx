import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Task Manager</h1>
        <p className="tagline">
          Collaborate, Organize, and Achieve Your Goals
        </p>
        <p className="description">
          A powerful task management application for teams. Create projects,
          assign tasks, and track progress in real-time.
        </p>

        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🚀 Project Management</h3>
            <p>Create and manage multiple projects with ease</p>
          </div>
          <div className="feature-card">
            <h3>✅ Task Tracking</h3>
            <p>Organize tasks with priorities and due dates</p>
          </div>
          <div className="feature-card">
            <h3>👥 Team Collaboration</h3>
            <p>Work together with your team members</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Real-time Updates</h3>
            <p>See changes instantly with live notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;