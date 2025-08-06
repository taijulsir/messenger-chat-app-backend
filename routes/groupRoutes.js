import { Router } from 'express';
import { createGroup, getGroups } from '../controllers/groupController.js';
import userModel from '../models/userModel.js';

const router = Router();

router.post('/', createGroup);
router.get('/', getGroups);

// router.get("/update", async (req, res) => {
//     try {
//         // Fetch all users from the database
//         const users = await userModel.find();

//         // List of avatar URLs
//         const imageUrls = [
//             "https://i.ibb.co.com/m4mnZKr/doc13.jpg",
//             "https://i.ibb.co.com/rF7LXyc/doc14.jpg",
//             "https://i.ibb.co.com/bzDPvkv/doc25.jpg",
//             "https://i.ibb.co.com/fpWrH1N/doc28.jpg",
//             "https://i.ibb.co.com/VjN8NJn/doc30.jpg",
//             "https://i.ibb.co.com/12W10Cm/doc26.jpg",
//             "https://i.ibb.co.com/WkhzQ5X/doc18.jpg",
//             "https://i.ibb.co.com/Xjq0H5d/doc16.webp",
//             "https://i.ibb.co.com/DWKrmRw/doc19.jpg",
//             "https://i.ibb.co.com/HFsvZqK/doc20.jpg",
//             "https://i.ibb.co.com/VvqVXNP/doc22.jpg",
//             "https://i.ibb.co.com/jfdPFmN/doc23.jpg",
//             "https://i.ibb.co.com/X3JHCYj/doc24.jpg"
//         ];

//         // Create the bulk update operations
//         const bulkOps = users.map(u => {
//             // Select a random image URL from the list
//             const randomIndex = Math.floor(Math.random() * imageUrls.length);
//             const randomAvatar = imageUrls[randomIndex];

//             return {
//                 updateOne: {
//                     filter: { _id: u._id }, // Match user by _id
//                     update: { $set: { image: randomAvatar } }, // Update the avatar field
//                     upsert: false // Do not create new documents if no match
//                 }
//             };
//         });

//         // Execute the bulk write operation
//         const result = await userModel.bulkWrite(bulkOps);

//         // Send a response
//         res.status(200).send(`Successfully updated ${result.modifiedCount} users' avatars.`);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error updating avatars.");
//     }
// });

export default router;