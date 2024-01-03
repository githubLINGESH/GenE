    // SideNavbar.jsx
    import Link from 'next/link';
    import { FaHome, FaChartBar, FaBook } from 'react-icons/fa';

    const NavLink = ({ href, children }) => {
    return (
        <Link href={href} passHref>
        <div>{children}</div>
        </Link>
    );
    };

    const SideNavbar = () => {
    return (
        <nav className="bg-gray-800 p-4 text-white flex flex-col space-y-4">
        <div>
            <NavLink href="/home">
            <a className="flex items-center">
                <FaHome className="mr-2" />
                Home
            </a>
            </NavLink>
            <NavLink href="/dashboard">
            <a className="flex items-center">
                <FaChartBar className="mr-2" />
                Dashboard
            </a>
            </NavLink>
            <NavLink href="/courses">
            <a className="flex items-center">
                <FaBook className="mr-2" />
                Courses
            </a>
            </NavLink>
        </div>
        </nav>
    );
    };

    export default SideNavbar;
