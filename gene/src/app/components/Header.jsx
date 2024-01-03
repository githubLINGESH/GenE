import { UserButton, auth } from '@clerk/nextjs';
import Link from 'next/link';

const Header = async ({ username }) => {
const { userId } = auth();

return (
    <nav className='flex items-center justify-between px-6 py-4 mb-5 bg-blue-700'>
    <div className='flex items-center'>
        <Link href='/'>
        <div className='text-lg font-bold text-white uppercase'>
            GenE
        </div>
        </Link>
    </div>
    <div className="flex gap-6 mt-8">
                <Link
                href="/dashboard"
                className="flex content-center gap-2 px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                Create Course
                </Link>
                </div>
    <div className='flex items-center text-white'>
        {!userId && (
        <>
            <Link
            href='sign-in'
            className='text-gray-300 hover:text-white mr-4'
            >
            Sign In
            </Link>
            <Link
            href='sign-up'
            className='text-gray-300 hover:text-white mr-4'
            >
            Sign Up
            </Link>
        </>
        )}
        {userId && (
        <Link href='profile' className='text-gray-300 hover:text-white mr-4'>
            Profile
        </Link>
        )}
        <div className='ml-auto'>
        <UserButton afterSignOutUrl='/' />
        </div>
    </div>
    </nav>
);
};

export default Header;