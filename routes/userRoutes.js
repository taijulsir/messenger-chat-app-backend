import { Router } from 'express';
import { getUsers, getUserProfile, searchUsers } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/search',protect, searchUsers);
router.get('/', getUsers);
router.get('/:userId', getUserProfile);


export default router;