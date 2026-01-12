/**
 * Demo Data - Allows the app to work without a database
 * Perfect for portfolio showcases and interviews!
 */

// Check if in demo mode
export const isDemoMode = () => localStorage.getItem("isDemo") === "true";

// Demo projects
let demoProjects = [
    {
        id: "demo-1",
        name: "E-Commerce Platform",
        description: "Full-stack online store with React and Node.js",
        owner_id: "demo-user",
        status: "active",
        created_at: new Date().toISOString(),
        members: [{ id: "demo-user", username: "demo_user", email: "demo@example.com" }]
    },
    {
        id: "demo-2",
        name: "Mobile App",
        description: "Cross-platform app using React Native",
        owner_id: "demo-user",
        status: "active",
        created_at: new Date().toISOString(),
        members: [{ id: "demo-user", username: "demo_user", email: "demo@example.com" }]
    },
    {
        id: "demo-3",
        name: "API Development",
        description: "RESTful API with authentication",
        owner_id: "demo-user",
        status: "active",
        created_at: new Date().toISOString(),
        members: [{ id: "demo-user", username: "demo_user", email: "demo@example.com" }]
    }
];

// Demo tasks
let demoTasks = {
    "demo-1": [
        { id: "t1", title: "Setup React project", description: "Initialize with Vite", status: "done", priority: "high", project_id: "demo-1", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t2", title: "Design database schema", description: "ERD for products, users, orders", status: "done", priority: "high", project_id: "demo-1", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t3", title: "Build product catalog", description: "List and filter products", status: "in_progress", priority: "medium", project_id: "demo-1", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t4", title: "Implement cart", description: "Add to cart functionality", status: "todo", priority: "medium", project_id: "demo-1", assignee_name: null, created_at: new Date().toISOString() },
        { id: "t5", title: "Payment integration", description: "Stripe checkout", status: "todo", priority: "high", project_id: "demo-1", assignee_name: null, created_at: new Date().toISOString() }
    ],
    "demo-2": [
        { id: "t6", title: "Setup React Native", description: "Configure Expo", status: "done", priority: "high", project_id: "demo-2", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t7", title: "Create navigation", description: "Stack and tab nav", status: "in_progress", priority: "medium", project_id: "demo-2", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t8", title: "Build UI components", description: "Buttons, cards, inputs", status: "todo", priority: "medium", project_id: "demo-2", assignee_name: null, created_at: new Date().toISOString() }
    ],
    "demo-3": [
        { id: "t9", title: "Design API endpoints", description: "RESTful routes", status: "done", priority: "high", project_id: "demo-3", assignee_name: "Demo User", created_at: new Date().toISOString() },
        { id: "t10", title: "Add JWT auth", description: "Login and register", status: "in_progress", priority: "high", project_id: "demo-3", assignee_name: "Demo User", created_at: new Date().toISOString() }
    ]
};

// Project functions
export const getDemoProjects = () => [...demoProjects];
export const getDemoProject = (id) => demoProjects.find(p => p.id === id);

export const createDemoProject = (data) => {
    const project = {
        id: `demo-${Date.now()}`,
        name: data.name,
        description: data.description || "",
        owner_id: "demo-user",
        status: "active",
        created_at: new Date().toISOString(),
        members: [{ id: "demo-user", username: "demo_user", email: "demo@example.com" }]
    };
    demoProjects = [project, ...demoProjects];
    demoTasks[project.id] = [];
    return project;
};

export const deleteDemoProject = (id) => {
    demoProjects = demoProjects.filter(p => p.id !== id);
    delete demoTasks[id];
};

// Task functions
export const getDemoTasks = (projectId) => demoTasks[projectId] || [];

export const createDemoTask = (projectId, data) => {
    const task = {
        id: `t-${Date.now()}`,
        title: data.title,
        description: data.description || "",
        status: "todo",
        priority: data.priority || "medium",
        project_id: projectId,
        assignee_name: data.assignedTo ? "Demo User" : null,
        due_date: data.dueDate || null,
        created_at: new Date().toISOString()
    };
    if (!demoTasks[projectId]) demoTasks[projectId] = [];
    demoTasks[projectId] = [task, ...demoTasks[projectId]];
    return task;
};

export const updateDemoTask = (taskId, updates) => {
    for (const projectId in demoTasks) {
        const idx = demoTasks[projectId].findIndex(t => t.id === taskId);
        if (idx !== -1) {
            demoTasks[projectId][idx] = { ...demoTasks[projectId][idx], ...updates };
            return demoTasks[projectId][idx];
        }
    }
    return null;
};

export const deleteDemoTask = (taskId) => {
    for (const projectId in demoTasks) {
        demoTasks[projectId] = demoTasks[projectId].filter(t => t.id !== taskId);
    }
};
