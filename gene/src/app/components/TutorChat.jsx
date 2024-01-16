    // TutorChat.jsx
    import { useAuth } from "@clerk/nextjs";
    import axios from 'axios';
    import { useEffect, useState } from 'react';
    import AIChatBot from './AIChatBot';
    import TutorSession from  "./TutorSession";

    const TutorChat = ({ tutorId }) => {
    const [tutor, setTutor] = useState(null);

    const {userId} = useAuth();
    console.log(userId);

    useEffect(() => {
        const fetchTutorDetails = async () => {
        try {
            // Fetch tutor details
            const tutorResponse = await axios.get(`/api/tutor/${tutorId}`);
            setTutor(tutorResponse.data);
        } catch (error) {
            console.error('Error fetching tutor or current user details:', error.message);
        }
        };

        fetchTutorDetails();
    }, [tutorId]);


    return (
        <div className='justify-space between'>
        <h2>Chat with {tutor ? tutor.name : 'Tutor'}</h2>
        {tutor && userId ? (
            <>
            <AIChatBot tutor={tutor} userId={userId} />
            <TutorSession tutor={tutor} userId={userId} />
        </>
        ) : (
            <p>Loading tutor details...</p>
        )}
        </div>
    );
    };

    export default TutorChat;
