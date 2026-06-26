import { Link } from "react-router-dom";
function Navbar() {
    return (
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">
          SkillForge
        </h1>
  
        <ul className="flex items-center gap-8">
        <li>
            <Link
              to="/"
              className="hover:text-blue-600 transition-colors"
            >
              Explore
            </Link>
          </li>
          <li>
            <Link
              to="/projects"
              className="hover:text-blue-600 transition-colors"
            >
              Projects
            </Link>
          </li>
          <li className="cursor-pointer hover:text-blue-600">About</li>
          <li>
            <Link
              to="/login"
              className="hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
          </li>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </ul>
      </nav>
    );
  }
  
  export default Navbar;