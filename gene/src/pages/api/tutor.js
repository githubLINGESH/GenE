    // pages/api/tutors.js
    import { MongoClient } from 'mongodb';

    const MONGODB_URI = process.env.MONGODB_URI;
    const DATABASE_NAME = process.env.DATABASE_NAME;

    export default async function handler(req, res) {
    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("comes here");
        await client.connect();
        const database = client.db(DATABASE_NAME);
        const tutorsCollection = database.collection('tutors');

        // Fetch tutors from MongoDB
        const tutors = await tutorsCollection.find({}).toArray();

        res.status(200).json(tutors);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
    }
