    // SideNavbar.jsx
    'use client';
    import { useState } from 'react';
    import Link from 'next/link';
    import { FaHome, FaChartBar, FaBook } from 'react-icons/fa';
    import CheckoutButton from './CheckoutButton';

    const NavLink = ({ href, children }) => {
    return (
        <Link href={href} passHref>
        <div>{children}</div>
        </Link>
    );
    };

    const SideNavbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleNavbar = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    return (
        <nav className={`bg-gray-500 p-4 text-white flex flex-col space-y-4 ${isOpen ? 'w-36' : 'w-6'}`} style={{ position: 'fixed', height: '100vh' }}>
        <button className="mb-2" onClick={toggleNavbar}>
            {isOpen ? '<' : '>'}
        </button>
        {isOpen && (
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
            <CheckoutButton />
            </div>
        )}
        </nav>
    );
    };

    export default SideNavbar;
