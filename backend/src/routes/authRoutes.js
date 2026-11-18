import { Router } from 'express';
import {
  getUsers,
  login,
  createUser,
  updateUser,
  toggleUserActive,
} from '../controllers/authController.js';

const router = Router();

router.get('/', getUsers);
router.post('/login', login);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-active', toggleUserActive);

export default router;

