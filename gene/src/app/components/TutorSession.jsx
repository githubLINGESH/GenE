import { useContext, useEffect } from 'react';

const TutorSession = ({ tutor, userId }) => {
    const { setTutor, setUserId } = useContext(SomeContext);

    useEffect(() => {
        setTutor(tutor);
        setUserId(userId);
    }, [tutor, userId]);

    return null;
};

export default TutorSession;
