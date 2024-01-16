    'use client';
    import { useState, useEffect } from 'react';
    import axios from 'axios';
    import TutorChat from './TutorChat';

    const TutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);

    const handleTutorClick = (tutorId) => {
        setSelectedTutor(tutorId);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
        const fetchTutors = async () => {
        try {
            const response = await axios.get('/api/tutor');
            setTutors(response.data);
        } catch (error) {
            console.error('Error fetching tutors:', error.message);
        }
        };

        fetchTutors();
    }
    }, []);

    return (
        <div className="tutor-list-container">
        <h2>Tutors</h2>
        <ul className="tutor-list">
            {tutors.map((tutor) => (
            <li key={tutor.tutorId} className="tutor-item">
                <img src={tutor.imageSrc} alt={tutor.name} className="tutor-image" />
                <div className="tutor-info">
                <p>{tutor.name}</p>
                <button onClick={() => handleTutorClick(tutor.tutorId)}>Chat</button>
                </div>
            </li>
            ))}
        </ul>
        {selectedTutor && <TutorChat tutorId={selectedTutor} />}
        </div>
    );
    };

    export default TutorList;
