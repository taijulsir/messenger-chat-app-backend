import { Router } from 'express';
import { createGroup, getGroups } from '../controllers/groupController.js';

const router = Router();

router.post('/', createGroup);
router.get('/', getGroups);

export default router;