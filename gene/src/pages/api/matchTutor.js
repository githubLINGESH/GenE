import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

export default async function handler(req, res) {
    const { tutorId, userId } = req.body;
    console.log(tutorId , userId)

    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        await client.connect();
        const database = client.db(DATABASE_NAME);
        const users = database.collection('users');

        const existing = await users.findOne({matchedTutors : tutorId})
        const result = existing
        // Update the tutor document in the database to indicate a match with the user
        if(!existing){
        const result = await users.updateOne(
            { userId: userId },
            { $addToSet: { matchedTutors: tutorId } },
        );
        res.status(200).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error matching tutor with user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await client.close();
    }
}
