// /api/matchTutor.js
import { withApiAuthRequired } from '@clerk/nextjs/api';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI
const DATABASE_NAME = process.env.DATABASE_NAME

export default withApiAuthRequired(async (req, res) => {
    const { tutorId, userId } = req.body;

    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(DATABASE_NAME);
        const users = database.collection('users');

        // Update the tutor document in the database to indicate a match with the user
        const result = await users.updateOne(
            { _id: tutorId },
            { $addToSet: { matchedTutors: userId } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update tutor document' });
        }
    } catch (error) {
        console.error('Error matching tutor with user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await client.close();
    }
});
