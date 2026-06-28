import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef4ff] px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-xl border border-slate-200">
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Welcome to SkillForge
        </h1>
        <p className="mt-6 text-center text-gray-600 text-lg">
          You are successfully logged in.
        </p>
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-3.5 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
