    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

    const OtherCourses = ({ userId }) => {
    const [otherCourses, setOtherCourses] = useState([]);

    useEffect(() => {
        // Fetch other courses not specific to the user
        // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint to fetch other courses
        axios.get('YOUR_API_ENDPOINT/other-courses')
        .then((response) => {
            setOtherCourses(response.data);
        })
        .catch((error) => {
            console.error('Error fetching other courses:', error);
        });
    }, []);

    return (
        <div>
        <h3>Other Courses</h3>
        <div className="course-list">
            {otherCourses.map((course) => (
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

    export default OtherCourses;
