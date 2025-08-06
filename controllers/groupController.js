import Group from '../models/groupModel.js';

export const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const group = new Group({ name, members });
  await group.save();
  res.status(201).json({ message: 'Group created' });
};

export const getGroups = async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
};