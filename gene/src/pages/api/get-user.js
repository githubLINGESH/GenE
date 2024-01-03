import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const userData = req.body;

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const database = client.db(DATABASE_NAME);
        const users = database.collection('users');

        const existingUser = await users.findOne({userId : userData.userId})

        if(!existingUser){

        await users.insertOne(userData);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error storing user data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await client.close();
    }
}

export default handler;
