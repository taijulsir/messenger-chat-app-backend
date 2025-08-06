import { Router } from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getIncomingRequests, getSentRequests, cancelFriendRequest, getMyFriends } from '../controllers/friendController.js';

const router = Router();

// Define the routes
router.post('/', sendFriendRequest); // Send friend request
router.put('/:requestId', acceptFriendRequest); // Accept friend request
router.delete('/:requestId', cancelFriendRequest); // Cancel friend request
router.get('/incoming', getIncomingRequests); // Get incoming friend requests
router.get('/sent', getSentRequests); // Get sent friend requests
router.put('/reject/:userId', rejectFriendRequest); // Reject friend request
router.get("/myFrineds",getMyFriends)

export default router;
