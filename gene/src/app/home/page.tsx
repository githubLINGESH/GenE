// Home.jsx
import SideNavbar from '../components/SideNavbar';
import TutorList from '../components/TutorList';
import SignUpHandler from '../components/SignUpHandler';

const Home = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-row absolute top-[63px] left-0 h-full">
        <SideNavbar />
      </div>
      <main className="flex-1 p-4">
        <TutorList />
        <SignUpHandler />
      </main>
    </div>
  );
};

export default Home;
