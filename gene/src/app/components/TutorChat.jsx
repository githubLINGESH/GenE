
    import { useState , useEffect} from 'react';
    import AIChatBot from './AIChatBot';
    import axios from 'axios';

    const TutorChat = ({ tutorId }) => {
    const [tutor, setTutor] = useState(null);

    useEffect(() => {
        const fetchTutorDetails = async () => {
        try {
            const response = await axios.get(`/api/tutor/${tutorId}`);
            setTutor(response.data);
            console.log('Tutor details:', response.data);
        } catch (error) {
            console.error('Error fetching tutor details:', error.message);
        }
        };

        fetchTutorDetails();
    }, [tutorId]);

    return (
        <div>
        <h2>Chat with {tutor ? tutor.name : 'Tutor'}</h2>
        {tutor ? (
            <AIChatBot tutor={tutor} />
        ) : (
            <p>Loading tutor details...</p>
        )}
        </div>
    );
    };

    export default TutorChat;
