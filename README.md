# Task Manager App 🚀

A collaborative task management application built with React, Node.js, Express, PostgreSQL, and Socket.IO for real-time updates.

## 📋 Features

- **User Authentication** - Register, login, and secure JWT-based authentication
- **Project Management** - Create and manage multiple projects
- **Task Board** - Kanban-style board with drag-and-drop functionality
- **Real-time Updates** - Live task updates using Socket.IO
- **Team Collaboration** - Add members to projects and assign tasks
- **Task Comments** - Collaborate through task comments
- **Status Tracking** - Track tasks through different stages (To Do, In Progress, Review, Completed)

## 🛠️ Tech Stack

### Frontend

- React 19.2.0
- React Router 7.9.4
- Socket.IO Client 4.8.1
- Axios 1.12.2
- React Hot Toast for notifications

### Backend

- Node.js with Express 5.1.0
- PostgreSQL 8.16.3
- Socket.IO 4.8.1
- JWT for authentication
- bcryptjs for password hashing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/abdu1lah26/task-manager-app.git
cd task-manager-app
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE taskmanager;
```

Run the SQL schema to create tables:

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_members table
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://your_username:your_password@localhost:5432/taskmanager
# JWT_SECRET=your-secret-key
```

### 4. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# The default configuration should work for local development
```

## 🏃‍♂️ Running the Application

### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**

```bash
cd client
npm start
# Client runs on http://localhost:3000
```

### Production Build

**Backend:**

```bash
cd server
npm start
```

**Frontend:**

```bash
cd client
npm run build
# This creates an optimized production build in the 'build' folder
```

## 📁 Project Structure

```
task-manager-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── common/    # Shared components
│   │   │   └── tasks/     # Task-related components
│   │   ├── context/       # React Context for state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── index.js       # Entry point
│   └── package.json
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Custom middleware
    │   ├── routes/        # API routes
    │   ├── socket/        # Socket.IO handlers
    │   ├── utils/         # Utility functions
    │   └── server.js      # Entry point
    └── package.json
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks

- `GET /api/tasks/project/:projectId` - Get all tasks for a project
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks/project/:projectId` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔌 Socket.IO Events

### Client → Server

- `user-connected` - User connects
- `join-project` - Join project room
- `leave-project` - Leave project room
- `task-created` - Task created
- `task-updated` - Task updated
- `task-deleted` - Task deleted
- `task-status-changed` - Task status changed
- `comment-added` - Comment added
- `comment-deleted` - Comment deleted

### Server → Client

- `task-created` - Broadcast new task
- `task-updated` - Broadcast task update
- `task-deleted` - Broadcast task deletion
- `task-status-changed` - Broadcast status change
- `comment-added` - Broadcast new comment
- `user-status-changed` - User online/offline status

## 🔒 Environment Variables

### Server (.env)

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🧪 Testing

The application has been tested with:

- User registration and authentication
- Project creation and management
- Task CRUD operations
- Real-time updates via WebSocket
- Drag-and-drop functionality
- Comment system

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Ensure PostgreSQL database is set up
3. Deploy using Git or Docker

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the production bundle: `npm run build`
2. Set environment variables for API and Socket URLs
3. Deploy the `build` folder

## 🤝 Contributing

This is a student project for learning purposes. Feel free to fork and experiment!

## 👨‍💻 Author

**Abdullah**

- GitHub: [@abdu1lah26](https://github.com/abdu1lah26)

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Built as a sophomore full-stack learning project
- Uses modern React patterns and best practices
- Implements real-time features with Socket.IO
- PostgreSQL for robust data management

---

**Happy Task Managing! 🎉**
