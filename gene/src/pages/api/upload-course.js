    import axios from 'axios';
    import cloudinary from 'cloudinary';
    import { MongoClient } from 'mongodb';
    const ffmpeg = require('fluent-ffmpeg');
    const fs = require('fs');
    const { promisify } = require('util');
    const writeFileAsync = promisify(fs.writeFile);

    const MONGODB_URI = process.env.MONGODB_URI;
    const DATABASE_NAME = process.env.DATABASE_NAME;

    cloudinary.config({
        cloud_name: 'GenE',
        api_key: '493794894832979',
        api_secret: 'XIcC5zfqB42oozR-6QxU-SgXStk',
    });

    export default async function uploadCourse(req, res) {
    const { tutorId, userId, courseName, content } = req.body;

    // Step 1: Call the coqui-TTS API to generate audio from text content
    const audioData = await generateAudioFromText(content);

    // Step 2: Retrieve the video link based on tutorId (assuming you have a database or some source for this)
    const videoLink = await getVideoLinkForTutor(tutorId);

    // Step 3: Synchronize audio and video and store the result in Cloudinary
    const synchronizedVideo = await synchronizeAudioAndVideo(videoLink, audioData);

    // Step 4: Upload the synchronized video to Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(synchronizedVideo);

    // Step 5: Handle any additional logic or response as needed
    // For example, you might save the cloudinaryResponse URL to your database.

    // Return a response to the client
    return res.status(200).json({ message: 'Course uploaded successfully', cloudinaryResponse });
    }


// Modify the URL to match your coqui-TTS API endpoint
const COQUI_TTS_API_URL = 'http://[::1]:5002/api/tts';

    async function generateAudioFromText(text) {
    try {
        // Make a POST request to the coqui-TTS API
        const response = await axios.post(COQUI_TTS_API_URL,{
            headers: {
                'Content-Type': 'application/json',
                },
            params: {
            text,
            }
        });

        // Extract the audio data from the response
        const audioData = response.data;

        return audioData;
    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error generating audio from text:', error);
        throw error;
    }
    }
        

    async function getVideoLinkForTutor(tutorId) {
    
        const client = new MongoClient(MONGODB_URI);

        try {
            await client.connect();
            const database = client.db(DATABASE_NAME);
            const tutors = database.collection('tutors');

            const tut = await tutors.findOne({tutorId : tutorId})

            const videoLink = tut.video_l;
            return videoLink;
        }
        catch(error){
            console.log("ERROR GET VIDEO LINK FOR TUTOR",error);
        }
    }

    async function synchronizeAudioAndVideo(videoLink, audioData) {
    // Implement logic to synchronize audio and video
    // This might involve using a video editing library or tool
    // For simplicity, we're assuming you have a synchronized video file here
    const synchronizedVideo = await YourVideoSynchronizationLibrary.synchronize(videoLink, audioData);

    return synchronizedVideo;
    }

    async function uploadToCloudinary(synchronizedVideo) {
        try {
            const cloudinaryResponse = await cloudinary.v2.uploader.upload(synchronizedVideo, {
                resource_type: 'video',
                folder: 'synchronized_videos',
            });
        
            console.log('Synchronized video uploaded to Cloudinary:', cloudinaryResponse);
        
            return cloudinaryResponse;
            } catch (error) {
            // Handle any errors that occur during the upload
            console.error('Error uploading synchronized video to Cloudinary:', error);
            throw error;
            }
        }
