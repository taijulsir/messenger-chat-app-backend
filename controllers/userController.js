import User from '../models/userModel.js';

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json(user);
};