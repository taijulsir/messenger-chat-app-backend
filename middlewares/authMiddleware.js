import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
    let token;

    // Check if the token is in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the Authorization header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET with your secret key

            console.log(decoded)

            // Attach the user to the request object
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password field

            console.log({
                user: req.user,
                token,
                decoded
            })
            next(); // Continue to the next middleware/controller
        } catch (error) {
            
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is found
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export { protect };
