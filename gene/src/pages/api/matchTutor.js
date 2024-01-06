import { MongoClient } from 'mongodb';
import { getAuth } from '@clerk/nextjs';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

export default async function handler(req, res) {
    const { tutorId } = req.body;

    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const auth = await getAuth(req);
        const userId = auth?.id;

        if (!userId) {
            // Handle the case where the user is not authenticated
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        await client.connect();
        const database = client.db(DATABASE_NAME);
        const users = database.collection('users');

        // Update the tutor document in the database to indicate a match with the user
        const result = await users.updateOne(
            { userId : userId},
            { $addToSet: { matchedTutors: tutorId } },
            { upsert: true }
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
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
}
