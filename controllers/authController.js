import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.status(201).json({
    user: {
      name: user.name,
      email: user.email,
      friends: [],
      token
    }
  });
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email and exclude the password field from the result
    const user = await User.findOne({ email })

  
    // If user is not found or the password is incorrect, return an error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token with the user's ID, using a secret and setting an expiration time
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send back a response with user details and the token
    res.json({
      user: {
        name: user.name,
        email: user.email,
        friends: user.friends, // Add any additional user details if needed
        token, // Return the generated token
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' }); // Handle any unexpected errors
  }
};

