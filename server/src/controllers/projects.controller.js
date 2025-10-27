import pool from '../config/database.js';

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT DISTINCT p.*, u.username as owner_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.owner_id = $1 OR pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      projects: result.rows
    });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const accessCheck = await pool.query(
      `SELECT p.*, u.username as owner_name
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const members = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
       FROM tasks WHERE project_id = $1`,
      [id]
    );

    res.json({
      success: true,
      project: {
        ...accessCheck.rows[0],
        members: members.rows,
        stats: stats.rows[0]
      }
    });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, userId]
    );

    const project = result.rows[0];

    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [project.id, userId, 'owner']
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.userId;

    const ownerCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can update project'
      });
    }

    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, status, id]
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const ownerCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete project'
      });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.userId;

    const roleCheck = await pool.query(
      `SELECT * FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.role = 'admin')`,
      [id, userId]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or admin can add members'
      });
    }

    const userResult = await pool.query(
      'SELECT id, username, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    const newMember = userResult.rows[0];

    const existingMember = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, newMember.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [id, newMember.id, 'member']
    );

    res.json({
      success: true,
      message: 'Member added successfully',
      member: newMember
    });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.userId;

    const roleCheck = await pool.query(
      `SELECT * FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.role = 'admin')`,
      [id, userId]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner or admin can remove members'
      });
    }

    const ownerCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, memberId]
    );

    if (ownerCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, memberId]
    );

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};