import express from 'express';
import {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  deleteComment
} from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/project/:projectId', getProjectTasks);
router.post('/project/:projectId', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

router.post('/:taskId/comments', addComment);
router.delete('/comments/:commentId', deleteComment);

export default router;