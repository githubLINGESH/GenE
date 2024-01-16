    // CoursesPage.jsx
    import { useAuth } from '@clerk/nextjs';
    import UserCourses from '../components/UserCourses';
    import OtherCourses from '../components/OtherCourses';

    const CoursesPage = () => {
    const { userId } = useAuth();

    return (
        <div>
        <h2>Courses</h2>
        <UserCourses userId={userId} />
        <OtherCourses userId={userId} />
        </div>
    );
    };

    export default CoursesPage;
