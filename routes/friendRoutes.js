import { Router } from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getIncomingRequests, getSentRequests, cancelFriendRequest } from '../controllers/friendController.js';

const router = Router();

// Define the routes
router.post('/', sendFriendRequest); // Send friend request
router.put('/:userId', acceptFriendRequest); // Accept friend request
router.delete('/:userId', cancelFriendRequest); // Cancel friend request
router.get('/incoming', getIncomingRequests); // Get incoming friend requests
router.get('/sent', getSentRequests); // Get sent friend requests
router.put('/reject/:userId', rejectFriendRequest); // Reject friend request

export default router;
