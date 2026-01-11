# Task Manager App - Problems & Solutions (Interview Guide)

## Problem 1: Database Connection Failed (ECONNREFUSED)

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause:**
Backend was trying to connect to localhost PostgreSQL instead of Render's cloud database.

**Solution:**

- Set `DATABASE_URL` environment variable on Render with External Database URL
- Modified `config/database.js` to use environment variable:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});
```

---

## Problem 2: SSL/TLS Required Error

**Error:**

```
Error: SSL/TLS connection required
```

**Cause:**
Render PostgreSQL requires SSL connections for security.

**Solution:**
Added conditional SSL configuration that auto-detects cloud databases:

```javascript
const isCloudDatabase = process.env.DATABASE_URL?.includes("render.com");
ssl: isCloudDatabase ? { rejectUnauthorized: false } : false;
```

---

## Problem 3: Environment Variables Not Loading

**Error:**

```
TypeError: Cannot read property 'DATABASE_URL' of undefined
```

**Cause:**
`dotenv.config()` was called after database import, so variables weren't available.

**Solution:**
Moved `dotenv.config()` to top of `server.js` before all imports:

```javascript
import dotenv from "dotenv";
dotenv.config(); // Must be first
import pool from "./config/database.js";
```

---

## Problem 4: CORS Policy Blocking Requests

**Error:**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause:**
Frontend (Vercel) and backend (Render) are on different domains.

**Solution:**
Configured dynamic CORS to allow Vercel domains:

```javascript
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("vercel.app") ||
        origin === process.env.CLIENT_URL
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

---

## Problem 5: Database Schema Mismatch - 500 Errors

**Error:**

```
Error: column "owner_id" does not exist
Error: column "full_name" does not exist
Error: column "due_date" does not exist
```

**Cause:**
Code expected columns that weren't in database schema.

**Solution:**
Added missing columns via SQL in pgAdmin:

```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
ALTER TABLE projects ADD COLUMN owner_id INTEGER REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
```

**Lesson:** Always ensure database schema matches code expectations.

---

## Problem 6: Invalid Integer Syntax Error

**Error:**

```
Error: invalid input syntax for type integer: ""
```

**Cause:**
Frontend sent empty strings `""` for nullable integer/timestamp fields.

**Solution:**
Added data sanitization in controllers:

```javascript
// In createTask and updateTask
const cleanAssignedTo = assignedTo === "" ? null : assignedTo;
const cleanDueDate = dueDate === "" ? null : dueDate;
```

**Lesson:** Always validate and clean data before database insertion.

---

## Problem 7: WebSocket Connection to Localhost

**Error:**

```
WebSocket connection failed: ws://localhost:5000
```

**Cause:**
Frontend was using localhost URL instead of production backend URL.

**Solution:**
Set `REACT_APP_SOCKET_URL` environment variable on Vercel:

```
REACT_APP_SOCKET_URL=https://task-manager-app-4o2i.onrender.com
```

---

## Problem 8: Task Deletion 403 Forbidden (Type Mismatch)

**Error:**

```
403 Forbidden - Only project owner or task creator can delete task
```

**Debug Log:**

```
User ID: 2, Project Owner: 2, Access check: 0 rows found
```

**Cause:**
`userId` from JWT token was string type, but database `owner_id` was integer. PostgreSQL strict type comparison failed.

**Solution:**
Convert userId to integer before database queries:

```javascript
const userId = parseInt(req.user.userId);
```

**Lesson:** JavaScript type coercion can cause database query failures. Always match data types.

---

## Problem 9: Users Can't Delete Tasks in Their Projects

**Error:**

```
403 Forbidden - Only project owner or task creator can delete task
```

**Cause:**
Access control was too restrictive - only owner/creator could delete.

**Solution:**
Modified query to allow any project member to delete tasks:

```javascript
const accessCheck = await pool.query(
  `SELECT t.* FROM tasks t
   JOIN projects p ON t.project_id = p.id
   LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
   WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
  [taskId, userId]
);
```

---

## Problem 10: Users Can't Leave Projects

**Error:**

```
403 Forbidden - Only project owner or admin can remove members
```

**Cause:**
Users trying to remove themselves from projects were denied.

**Solution:**
Added self-removal logic:

```javascript
const isSelfRemoval = userId === parseInt(memberId);

if (!isSelfRemoval) {
  // Check if user is owner/admin
  const roleCheck = await pool.query(...);
}
// Allow self-removal without permission check
```

---

## Key Technical Learnings

### 1. Environment Configuration

- Use `.env` for local development
- Set environment variables on hosting platforms (Render, Vercel)
- Load environment variables before any other imports

### 2. Database Management

- Always use parameterized queries to prevent SQL injection
- Match data types between application and database
- Use `NULL` instead of empty strings for nullable fields
- Cloud databases require SSL configuration

### 3. Authentication & Security

- JWT tokens stored in localStorage
- Protected routes check token validity
- Access control based on user roles and membership
- Type safety important for permission checks

### 4. Deployment Best Practices

- Test locally before deploying
- Use debug logs in production to diagnose issues
- Clean up debug code after fixing
- Use git commits to track changes
- Auto-deployment from GitHub to Render

### 5. Error Handling

- Use try-catch blocks for all async operations
- Return appropriate HTTP status codes (400, 403, 500)
- Log errors to console for debugging
- Send user-friendly error messages to frontend

---

## Tech Stack Used

**Frontend:**

- React.js
- Axios for API calls
- Socket.IO client for real-time features
- Deployed on Vercel

**Backend:**

- Node.js + Express.js
- PostgreSQL database
- JWT for authentication
- Socket.IO for WebSocket connections
- Deployed on Render

**Database:**

- PostgreSQL on Render
- SSL/TLS connection required
- 5 tables: users, projects, tasks, comments, project_members

---

## Project URLs

- **Frontend:** https://task-manager-app-rosy-alpha.vercel.app
- **Backend API:** https://task-manager-app-4o2i.onrender.com/api
- **GitHub:** https://github.com/abdu1lah26/task-manager-app
