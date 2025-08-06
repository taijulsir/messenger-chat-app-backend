import { Router } from 'express';
import { getUsers, getUserProfile } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/:userId', getUserProfile);

export default router;