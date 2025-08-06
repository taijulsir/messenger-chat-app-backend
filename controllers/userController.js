import User from '../models/userModel.js';

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json(user);
};


export const searchUsers = async (req, res) => {
  const { query } = req.query; // Get the search query from the request

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Find users by name or email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar');  // Only return name, email, and avatar for search results

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
};
