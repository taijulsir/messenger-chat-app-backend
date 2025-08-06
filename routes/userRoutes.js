import { Router } from 'express';
import { getUsers, getUserProfile, searchUsers } from '../controllers/userController.js';

const router = Router();

router.get('/search', searchUsers);
router.get('/', getUsers);
router.get('/:userId', getUserProfile);


export default router;