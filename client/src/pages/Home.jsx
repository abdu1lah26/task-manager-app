import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="stars-container">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="star"></div>
        ))}
      </div>
      <div className="animated-background"></div>
      <div className="hero-section">
        <div className="hero-badge">
          <span className="badge-icon">⚡</span>
          <span>Modern Project Management</span>
        </div>

        <h1>
          <span className="gradient-text">Organize</span> Your Work,
          <br />
          <span className="gradient-text">Empower</span> Your Team
        </h1>

        <p className="tagline">
          The all-in-one platform for seamless project management and team
          collaboration
        </p>

        <p className="description">
          Transform the way you work with real-time updates, intelligent task
          tracking, and powerful collaboration tools designed for modern teams.
        </p>

        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary btn-hero">
              <span>Go to Dashboard</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary btn-hero">
                <span>Get Started</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/login" className="btn-secondary btn-hero">
                <span>Sign In</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="features-header">
          <h2>Powerful Features for Modern Teams</h2>
          <p className="features-subtitle">
            Everything you need to manage projects and collaborate effectively
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>Project Management</h3>
            <p>
              Create and manage multiple projects with intuitive dashboards and
              comprehensive overview
            </p>
            <div className="feature-stats">
              <span>Unlimited Projects</span>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Task Tracking</h3>
            <p>
              Organize tasks with priorities, due dates, and custom status
              workflows for better productivity
            </p>
            <div className="feature-stats">
              <span>Smart Priorities</span>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Team Collaboration</h3>
            <p>
              Work seamlessly with your team members, assign tasks, and track
              progress together
            </p>
            <div className="feature-stats">
              <span>Real-time Sync</span>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3>Real-time Updates</h3>
            <p>
              See changes instantly with live notifications and automatic
              synchronization across all devices
            </p>
            <div className="feature-stats">
              <span>Instant Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
