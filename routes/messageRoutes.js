import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = Router();

router.post('/', sendMessage);
router.get('/:friendId', getMessages);

export default router;