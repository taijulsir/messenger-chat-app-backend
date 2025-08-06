import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getIncomingRequests,
  getSentRequests,
} from '../controllers/friendController.js';

const router = Router();

// Send a friend request
router.post('/', sendFriendRequest);

// Accept a friend request
router.put('/:userId', acceptFriendRequest);

// Reject a friend request
router.delete('/:userId', rejectFriendRequest);

// Get all incoming friend requests
router.get('/incoming', getIncomingRequests);

// Get all sent friend requests
router.get('/sent', getSentRequests);

export default router;
