// Import necessary modules and set up your MongoDB connection
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const { id } = req.query;

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();

        // Access the database and collection
        const database = client.db(process.env.DATABASE_NAME);
        const tutorsCollection = database.collection('tutors');

        // Fetch tutor details based on id
        const tutor = await tutorsCollection.findOne({ id: id });

        // Respond with tutor details in JSON format
        res.status(200).json(tutor);
    } catch (error) {
        console.error('Error fetching tutor details:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}
