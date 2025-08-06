import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = Router();

router.post('/', sendMessage);
router.get('/:chatId', getMessages);

export default router;