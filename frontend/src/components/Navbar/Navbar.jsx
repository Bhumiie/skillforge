import { Link } from "react-router-dom";
function Navbar() {
    return (
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-5 bg-white shadow-md">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          <span className="text-blue-600">Skill</span>
          <span className="text-violet-600">Forge</span>
        </h1>
  
        <ul className="flex items-center gap-4 sm:gap-8">
          <li>
            <Link
              to="/login"
              className="text-sm sm:text-base text-slate-700 hover:text-blue-800 transition-colors"
            >
              Login
            </Link>
          </li>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </ul>
      </nav>
    );
  }
  
  export default Navbar;