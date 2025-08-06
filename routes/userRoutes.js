import { Router } from 'express';
import { getUsers, getUserProfile, searchUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/:userId', getUserProfile);
router.get('/search', searchUsers);


export default router;