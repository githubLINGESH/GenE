    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

    const UserCourses = ({ userId }) => {
    const [userCourses, setUserCourses] = useState([]);

    useEffect(() => {
        axios.get(`YOUR_API_ENDPOINT/user-courses?userId=${userId}`)
        .then((response) => {
            setUserCourses(response.data);
        })
        .catch((error) => {
            console.error('Error fetching user courses:', error);
        });
    }, [userId]);

    return (
        <div>
        <h3>Your Courses</h3>
        <div className="course-list">
            {userCourses.map((course) => (
            <div key={course.id} className="course-item">
                <h4>{course.courseName}</h4>
                <video controls width="400" height="300">
                <source src={`https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v${course.videoVersion}/${course.publicId}`} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            </div>
            ))}
        </div>
        </div>
    );
    };

    export default UserCourses;
