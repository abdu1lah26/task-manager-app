import pool from '../config/database.js';

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const accessCheck = await pool.query(
      `SELECT * FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [projectId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const result = await pool.query(
      `SELECT t.*, 
        u1.username as created_by_name,
        u2.username as assigned_to_name,
        u2.email as assigned_to_email
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json({
      success: true,
      tasks: result.rows
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT t.*, 
        u1.username as created_by_name,
        u2.username as assigned_to_name,
        u2.email as assigned_to_email,
        p.name as project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    const comments = await pool.query(
      `SELECT c.*, u.username, u.full_name, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      task: {
        ...result.rows[0],
        comments: comments.rows
      }
    });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const accessCheck = await pool.query(
      `SELECT * FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [projectId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Convert empty strings to null for integer fields
    const cleanAssignedTo = assignedTo === "" ? null : assignedTo;
    const cleanDueDate = dueDate === "" ? null : dueDate;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, project_id, created_by, assigned_to, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || null, projectId, userId, cleanAssignedTo || null, priority || 'medium', cleanDueDate || null]
    );

    const task = result.rows[0];

    const taskWithInfo = await pool.query(
      `SELECT t.*, 
        u1.username as created_by_name,
        u2.username as assigned_to_name
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1`,
      [task.id]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: taskWithInfo.rows[0]
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const userId = req.user.userId;

    const accessCheck = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Convert empty strings to null for integer fields
    const cleanAssignedTo = assignedTo === "" ? null : assignedTo;
    const cleanDueDate = dueDate === "" ? null : dueDate;

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assigned_to = COALESCE($5, assigned_to),
           due_date = COALESCE($6, due_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, status, priority, cleanAssignedTo, cleanDueDate, id]
    );

    const taskWithInfo = await pool.query(
      `SELECT t.*, 
        u1.username as created_by_name,
        u2.username as assigned_to_name
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: taskWithInfo.rows[0]
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['todo', 'in_progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const accessCheck = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await pool.query(
      `UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );

    res.json({
      success: true,
      message: 'Task status updated'
    });
  } catch (err) {
    console.error('Update task status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status'
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.userId); // Ensure integer type

    console.log('Delete task - Task ID:', id, 'User ID:', userId, 'Type:', typeof userId);

    const accessCheck = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND (p.owner_id = $2 OR t.created_by = $2)`,
      [id, userId]
    );

    console.log('Access check - rows found:', accessCheck.rows.length);
    if (accessCheck.rows.length > 0) {
      console.log('Task data:', accessCheck.rows[0]);
    }

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or task creator can delete task'
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const accessCheck = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [taskId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await pool.query(
      `INSERT INTO comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, userId, content]
    );

    const commentWithInfo = await pool.query(
      `SELECT c.*, u.username, u.full_name, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: commentWithInfo.rows[0]
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const ownerCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};