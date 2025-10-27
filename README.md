# 🧩 Task Manager App

A **full-stack task management application** built using the **MERN + PostgreSQL** stack.
It allows users to create, update, delete, and organize tasks efficiently — complete with authentication, real-time updates, and responsive design.

🌐 **Live App:** [https://task-manager-app-rosy-alpha.vercel.app/](https://task-manager-app-rosy-alpha.vercel.app/)
📦 **GitHub Repository:** [https://github.com/abdu1lah26/task-manager-app](https://github.com/abdu1lah26/task-manager-app)

---

## 🚀 Features

✅ **User Authentication**

* JWT-based authentication
* Role-based access (user/admin)
* Password hashing using bcrypt

✅ **Task Management**

* Create, read, update, and delete tasks
* Mark tasks as completed or pending
* Filter and sort by task status or priority

✅ **Real-Time Updates**

* Live task status updates using **Socket.IO**

✅ **Responsive UI**

* Clean and mobile-friendly interface (React + Tailwind CSS)

✅ **Database Integration**

* PostgreSQL on Render Cloud
* Sequelize ORM for smooth communication between Node.js and PostgreSQL

✅ **Deployment**

* Frontend deployed on **Vercel**
* Backend + Database deployed on **Render**

---

## 🛠️ Tech Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| **Frontend**       | React.js, Tailwind CSS, Axios            |
| **Backend**        | Node.js, Express.js                      |
| **Database**       | PostgreSQL (Render Cloud)                |
| **Authentication** | JWT, bcrypt.js                           |
| **Real-time**      | Socket.IO                                |
| **Deployment**     | Vercel (Frontend), Render (Backend + DB) |

---

## 📁 Folder Structure

```
task-manager-app/
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Pages (Dashboard, Login, etc.)
│   │   ├── services/      # API calls using Axios
│   │   └── App.js
│   └── package.json
│
├── server/                # Backend (Node + Express)
│   ├── config/            # DB connection, dotenv setup
│   ├── controllers/       # Logic for tasks & users
│   ├── middleware/        # Auth middlewares (JWT, error handler)
│   ├── models/            # Sequelize models
│   ├── routes/            # RESTful API endpoints
│   ├── utils/             # Helper functions
│   └── server.js
│
├── .env.example
├── README.md
└── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abdu1lah26/task-manager-app.git
cd task-manager-app
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5000
DATABASE_URL=your_postgres_connection_url
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm start
```

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm start
```

Now the app runs on:
**Frontend:** [http://localhost:3000](http://localhost:3000)
**Backend:** [http://localhost:5000](http://localhost:5000)

---

## 🧠 Key Learnings & Challenges

1. **PostgreSQL SSL Errors**
   → Solved by enabling SSL in Render DB config (`ssl: { rejectUnauthorized: false }`).

2. **.env Not Loading**
   → Fixed by adding `dotenv.config()` at the top of `server.js`.

3. **CORS Policy Errors**
   → Allowed all Vercel domains dynamically in CORS middleware.

4. **Schema Mismatches During Migration**
   → Verified Sequelize models with actual DB schema before production push.

5. **Socket.IO Issues in Production**
   → Added `REACT_APP_SOCKET_URL` environment variable for the frontend to connect properly.

---

## 🧩 API Endpoints Overview

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login existing user |
| GET    | `/api/tasks`         | Get all tasks       |
| POST   | `/api/tasks`         | Create a new task   |
| PUT    | `/api/tasks/:id`     | Update a task       |
| DELETE | `/api/tasks/:id`     | Delete a task       |

---

## 📦 Deployment Notes

* **Frontend:** Vercel automatically builds from `client/` using `npm run build`.
* **Backend:** Deployed on Render using `npm start` with `server.js` as the entry point.
* **Environment Variables:** Configured separately in Vercel and Render dashboard.
* **Database:** PostgreSQL hosted on Render Cloud (free tier).

---

## 🔮 Future Improvements

* ✅ Add dark mode support
* ✅ Task categories and due dates
* ✅ Email notifications
* ✅ Admin dashboard for team management
* ✅ Drag-and-drop task organization

---

## 🧑‍💻 Author

**Abdullah Shakeel**
🎓 B.Tech CSE | MERN Stack Developer | Passionate about Building & Learning
🔗 [LinkedIn](https://www.linkedin.com/in/) | [GitHub](https://github.com/abdu1lah26)

---
