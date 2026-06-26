import express from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
} from '../controllers/usersController.js';

const router = express.Router();

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

export default router;
