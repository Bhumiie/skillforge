import { NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";

function TopNavbar() {
  const navigate = useNavigate();

  const linkBase = "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300";

  const renderLink = (to, label) => (
    <NavLink to={to} className={({ isActive }) => `${linkBase} ${isActive ? "text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-100"}`}>
      {({ isActive }) => (
        <>
          {label}
          <span
            className={`absolute inset-x-1 -bottom-1 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
          />
        </>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm shadow-slate-200 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-0 text-xl font-extrabold tracking-tight text-slate-900">
          <span className="text-blue-600">Skill</span><span className="text-violet-600">Forge</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-3">
          {renderLink("/dashboard", "Dashboard")}
          {renderLink("/connections", "Connections")}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            <span className="pointer-events-none absolute -right-1 top-1 h-2 w-2 rounded-full bg-transparent" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
            aria-label="Profile"
          >
            <FiUser className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
