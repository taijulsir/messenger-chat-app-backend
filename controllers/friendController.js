import FriendRequest from '../models/friendRequestModel.js';
import User from '../models/userModel.js';

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  const { from, to } = req.body;

  // Check if the users are already friends
  const existingFriendship = await User.findOne({ 
    $and: [{ _id: from }, { friends: to }] 
  });

  if (existingFriendship) {
    return res.status(400).json({ message: 'You are already friends.' });
  }

  // Check if the friend request already exists
  const existingRequest = await FriendRequest.findOne({ from, to });

  if (existingRequest) {
    return res.status(400).json({ message: 'Friend request already sent' });
  }

  const newRequest = new FriendRequest({
    from,
    to,
    status: 'pending', // Status will be 'pending' initially
  });

  try {
    await newRequest.save();
    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error });
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  const { userId } = req.params;

  // Find the friend request
  const request = await FriendRequest.findById(userId);

  if (!request) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  if (request.status === 'accepted') {
    return res.status(400).json({ message: 'Friend request already accepted' });
  }

  if (request.status === 'rejected') {
    return res.status(400).json({ message: 'Friend request was rejected' });
  }

  // Accept the friend request
  request.status = 'accepted';
  await request.save();

  // Add the users to each other's friends list
  const fromUser = await User.findById(request.from);
  const toUser = await User.findById(request.to);

  // Check if they're already friends
  if (!fromUser.friends.includes(request.to)) {
    fromUser.friends.push(request.to);
    await fromUser.save();
  }

  if (!toUser.friends.includes(request.from)) {
    toUser.friends.push(request.from);
    await toUser.save();
  }

  res.status(200).json({ message: 'Friend request accepted' });
};

// Reject Friend Request (for incoming requests)
export const rejectFriendRequest = async (req, res) => {
  const { userId } = req.params;

  // Find the friend request
  const request = await FriendRequest.findOne({ from: userId, to: req.user._id, status: 'pending' });

  if (!request) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  try {
    // Reject the friend request
    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
};

// Get Incoming Friend Requests (requests the user has received)
export const getIncomingRequests = async (req, res) => {
  const userId = req.user._id; // Assuming you're using JWT or a similar method for user identification

  try {
    const requests = await FriendRequest.find({ to: userId, status: 'pending' })
      .populate('from', 'name email avatar')  // Populate user data from the `from` field
      .exec();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incoming requests', error });
  }
};

// Get Sent Friend Requests (requests the user has sent)
export const getSentRequests = async (req, res) => {
  const userId = req.user._id; // Assuming you're using JWT or a similar method for user identification

  try {
    const requests = await FriendRequest.find({ from: userId, status: 'pending' })
      .populate('to', 'name email avatar')  // Populate user data from the `to` field
      .exec();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent requests', error });
  }
};

// Cancel Friend Request
export const cancelFriendRequest = async (req, res) => {
  const { userId } = req.params; // User ID of the request to be canceled

  // Ensure that the request exists and belongs to the logged-in user (i.e., it was sent by them)
  const request = await FriendRequest.findOne({ from: req.user._id, to: userId, status: 'pending' });

  if (!request) {
    return res.status(404).json({ message: 'Friend request not found or already canceled' });
  }

  try {
    // Delete the friend request
    await request.remove();

    res.status(200).json({ message: 'Friend request has been canceled' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling friend request', error: error.message });
  }
};

