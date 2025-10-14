import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/projects.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;