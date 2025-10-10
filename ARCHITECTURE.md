# Task Manager App - Documentation

Complete documentation with visual flowcharts and diagrams.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Project Structure](#project-structure)
7. [Setup Instructions](#setup-instructions)

---

## 🎯 Project Overview

A full-stack collaborative task management application where teams can create projects, assign tasks, track progress, and communicate in real-time.

**Live Demo:** `Coming soon`  
**Repository:** `https://github.com/YOUR_USERNAME/task-manager-app`

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Socket.io Client
- React Hot Toast

### Backend
- Node.js
- Express.js
- PostgreSQL
- Socket.io
- JWT Authentication
- Bcrypt

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ PROJECT_MEMBERS : joins
    USERS ||--o{ TASKS : creates
    USERS ||--o{ TASKS : assigned
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ NOTIFICATIONS : receives
    
    PROJECTS ||--o{ PROJECT_MEMBERS : has
    PROJECTS ||--o{ TASKS : contains
    
    TASKS ||--o{ COMMENTS : has
    TASKS ||--o{ NOTIFICATIONS : triggers

    USERS {
        int id PK
        string username UK
        string email UK
        string password
        string full_name
        string avatar_url
        string role
        timestamp created_at
    }

    PROJECTS {
        int id PK
        string name
        text description
        int owner_id FK
        string status
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_MEMBERS {
        int id PK
        int project_id FK
        int user_id FK
        string role
        timestamp joined_at
    }

    TASKS {
        int id PK
        string title
        text description
        int project_id FK
        int assigned_to FK
        int created_by FK
        string status
        string priority
        date due_date
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        int id PK
        int task_id FK
        int user_id FK
        text content
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type
        text message
        boolean is_read
        int related_task_id FK
        timestamp created_at
    }
```

---

## 🔐 Authentication Flow

### Registration Flow
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    
    Client->>Server: POST /api/auth/register
    Note over Client,Server: {username, email, password}
    
    Server->>Database: Check if user exists
    Database-->>Server: User not found
    
    Server->>Server: Hash password with bcrypt
    Server->>Database: INSERT new user
    Database-->>Server: User created
    
    Server->>Server: Generate JWT token
    Server-->>Client: {success, token, user}
    
    Client->>Client: Save token to localStorage
```

### Login Flow
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    
    Client->>Server: POST /api/auth/login
    Note over Client,Server: {email, password}
    
    Server->>Database: SELECT user by email
    Database-->>Server: User found
    
    Server->>Server: Compare password with bcrypt
    
    alt Password Valid
        Server->>Server: Generate JWT token
        Server-->>Client: {success, token, user}
        Client->>Client: Save token to localStorage
    else Password Invalid
        Server-->>Client: {success: false, message}
    end
```

### Protected Route Access
```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Controller
    participant Database
    
    Client->>Middleware: GET /api/auth/me
    Note over Client,Middleware: Authorization: Bearer <token>
    
    Middleware->>Middleware: Extract token from header
    Middleware->>Middleware: Verify JWT token
    
    alt Token Valid
        Middleware->>Middleware: Decode user info
        Middleware->>Controller: req.user = decoded
        Controller->>Database: Get user details
        Database-->>Controller: User data
        Controller-->>Client: {success, user}
    else Token Invalid
        Middleware-->>Client: 401 Unauthorized
    end
```

---

## 🔄 Complete System Architecture

```mermaid
graph TB
    subgraph Client["Frontend (React)"]
        A[Login/Register Page]
        B[Dashboard]
        C[Projects Page]
        D[Task Board]
        E[Profile Page]
    end
    
    subgraph Server["Backend (Node/Express)"]
        F[Auth Routes]
        G[Project Routes]
        H[Task Routes]
        I[Middleware]
        J[Controllers]
    end
    
    subgraph Database["PostgreSQL"]
        K[(Users)]
        L[(Projects)]
        M[(Tasks)]
        N[(Comments)]
    end
    
    subgraph RealTime["Real-time (Socket.io)"]
        O[WebSocket Server]
        P[Task Updates]
        Q[Notifications]
    end
    
    A -->|POST /auth/register| F
    A -->|POST /auth/login| F
    B -->|GET /projects| G
    C -->|POST /projects| G
    D -->|GET /tasks| H
    D -->|PUT /tasks| H
    
    F --> I
    G --> I
    H --> I
    I --> J
    
    J --> K
    J --> L
    J --> M
    J --> N
    
    D -.->|WebSocket| O
    O -.->|Emit| P
    O -.->|Emit| Q
    P -.->|Update| D
    Q -.->|Alert| B
```

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

#### Example: Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "member"
  }
}
```

#### Example: Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "member"
  }
}
```

#### Example: Get Current User (Protected)
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "member",
    "createdAt": "2025-10-10T10:30:00.000Z"
  }
}
```

---

## 📁 Project Structure

```
task-manager-app/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               # Login, Register components
│   │   │   ├── layout/             # Navbar, Sidebar
│   │   │   ├── projects/           # Project components
│   │   │   ├── tasks/              # Task components
│   │   │   ├── comments/           # Comment components
│   │   │   └── common/             # Reusable components
│   │   ├── pages/                  # Main pages
│   │   ├── context/                # React Context (Auth, Socket)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── utils/                  # Helper functions
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── .env
│   └── package.json
│
├── server/                          # Node/Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # PostgreSQL connection
│   │   ├── controllers/
│   │   │   └── auth.controller.js  # Auth logic ✅
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification ✅
│   │   ├── models/                 # Database queries
│   │   ├── routes/
│   │   │   └── auth.routes.js      # Auth endpoints ✅
│   │   ├── socket/                 # Socket.io handlers
│   │   ├── utils/
│   │   │   └── jwt.js              # JWT utilities ✅
│   │   └── server.js               # Main server file ✅
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/task-manager-app.git
cd task-manager-app
```

### 2. Setup Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskmanager;

# Connect and run schema
\c taskmanager
# Run all CREATE TABLE statements from database schema
```

### 3. Setup Backend
```bash
cd server
npm install

# Create .env file
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmanager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Start server
npm run dev
```

### 4. Setup Frontend
```bash
cd ../client
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Start React app
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🔄 Request/Response Flow

### Typical Task Creation Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Middleware
    participant C as Controller
    participant DB as Database
    participant S as Socket.io
    
    U->>F: Click "Create Task"
    F->>F: Get token from localStorage
    F->>A: POST /api/tasks
    Note over F,A: Authorization: Bearer <token>
    
    A->>A: Verify JWT token
    A->>C: req.user = decoded
    
    C->>DB: INSERT task
    DB-->>C: Task created
    
    C->>S: Emit 'task-created' event
    S-->>F: Broadcast to all project members
    
    C-->>F: {success, task}
    F->>F: Update UI with new task
    F-->>U: Show success message
```

---

## 🎨 Component Hierarchy (Frontend)

```mermaid
graph TD
    A[App.jsx] --> B[AuthContext]
    A --> C[SocketContext]
    A --> D[Router]
    
    D --> E[Public Routes]
    D --> F[Protected Routes]
    
    E --> G[Login Page]
    E --> H[Register Page]
    
    F --> I[Layout]
    
    I --> J[Navbar]
    I --> K[Sidebar]
    I --> L[Main Content]
    
    L --> M[Dashboard]
    L --> N[Projects Page]
    L --> O[Project Detail]
    L --> P[Profile Page]
    
    O --> Q[Task Board]
    Q --> R[Task Card]
    R --> S[Task Modal]
    S --> T[Comment Section]
```

---

## 🔐 Authentication Token Flow

```mermaid
graph LR
    A[User Login] --> B[Server verifies credentials]
    B --> C[Generate JWT Token]
    C --> D[Return token to client]
    D --> E[Client stores in localStorage]
    E --> F[Every API request includes token]
    F --> G[Server verifies token]
    G --> H{Valid?}
    H -->|Yes| I[Allow access]
    H -->|No| J[401 Unauthorized]
    I --> K[Return data]
```

---

## 📊 Task Status Workflow

```mermaid
stateDiagram-v2
    [*] --> Todo
    Todo --> InProgress : Start work
    InProgress --> Review : Submit for review
    InProgress --> Todo : Move back
    Review --> InProgress : Request changes
    Review --> Done : Approve
    Done --> [*]
    
    Todo --> Done : Quick complete
    InProgress --> Done : Direct complete
```

---

## 🐛 Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Auth Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Valid Input?}
    D -->|No| E[400 Bad Request]
    D -->|Yes| F{Resource Exists?}
    F -->|No| G[404 Not Found]
    F -->|Yes| H{Has Permission?}
    H -->|No| I[403 Forbidden]
    H -->|Yes| J{Database Query}
    J -->|Error| K[500 Server Error]
    J -->|Success| L[200 OK]
```

---

## 📝 Development Workflow

```mermaid
gitGraph
    commit id: "Initial setup"
    commit id: "Database schema"
    branch feature/auth
    checkout feature/auth
    commit id: "Add JWT utils"
    commit id: "Add auth middleware"
    commit id: "Add auth controller"
    commit id: "Add auth routes"
    checkout main
    merge feature/auth
    branch feature/projects
    checkout feature/projects
    commit id: "Add project routes"
    commit id: "Add project controller"
    checkout main
    merge feature/projects
    branch feature/tasks
    checkout feature/tasks
    commit id: "Add task routes"
    commit id: "Add real-time updates"
    checkout main
    merge feature/tasks
```

---

## ✅ Current Implementation Status

### Completed ✅
- [x] Database schema design
- [x] Backend folder structure
- [x] PostgreSQL connection
- [x] JWT authentication utilities
- [x] Auth middleware
- [x] User registration
- [x] User login
- [x] Protected routes
- [x] Password hashing

### In Progress 🔄
- [ ] React frontend authentication
- [ ] Project CRUD operations
- [ ] Task management
- [ ] Real-time updates
- [ ] Comments system

### Upcoming 📋
- [ ] Notifications
- [ ] File uploads
- [ ] Dashboard analytics
- [ ] Dark mode
- [ ] Deployment

---

## 📚 Key Concepts

### JWT Token Structure
```mermaid
graph LR
    A[JWT Token] --> B[Header]
    A --> C[Payload]
    A --> D[Signature]
    
    B --> B1[Algorithm: HS256]
    B --> B2[Type: JWT]
    
    C --> C1[userId: 1]
    C --> C2[email: user@example.com]
    C --> C3[role: member]
    C --> C4[exp: timestamp]
    
    D --> D1[HMACSHA256 + JWT_SECRET]
```

### Password Hashing Process
```mermaid
graph LR
    A[Plain Password] --> B[Bcrypt Hash Function]
    B --> C[Salt Generation]
    C --> D[Hash + Salt]
    D --> E[Stored in Database]
    
    F[Login Attempt] --> G[Compare Function]
    E --> G
    G --> H{Match?}
    H -->|Yes| I[Login Success]
    H -->|No| J[Login Failed]
```

---

## 🎯 Next Steps

1. Build React authentication pages (Login/Register)
2. Create AuthContext for global state
3. Implement project management
4. Add task board with drag-and-drop
5. Integrate Socket.io for real-time updates
6. Deploy to production

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all environment variables
3. Check PostgreSQL connection
4. Review server logs

---

**Last Updated:** October 10, 2025  
**Version:** 1.0.0 (Authentication Phase Complete)