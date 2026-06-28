import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [connectionState, setConnectionState] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleConnect = async (userId) => {
    const currentState = connectionState[userId];

    if (!userId || currentState?.loading || currentState?.sent) return;

    setConnectionState((prev) => ({
      ...prev,
      [userId]: { loading: true, sent: false },
    }));

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/connections/request",
        { receiverId: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConnectionState((prev) => ({
        ...prev,
        [userId]: { loading: false, sent: true },
      }));
    } catch (error) {
      setConnectionState((prev) => ({
        ...prev,
        [userId]: { loading: false, sent: false },
      }));

      alert(error?.response?.data?.message || "Failed to send connection request");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search.trim()) return true;

    const query = search.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const college = (user.college || "").toLowerCase();
    const location = (user.location || "").toLowerCase();
    const skillsOffered = (user.skillsOffered || []).join(" ").toLowerCase();
    const skillsWanted = (user.skillsWanted || []).join(" ").toLowerCase();

    return (
      name.includes(query) ||
      college.includes(query) ||
      location.includes(query) ||
      skillsOffered.includes(query) ||
      skillsWanted.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover People</h1>
            <p className="mt-2 text-gray-600">Browse skill-swappers and connect with learners around you.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.16)]"
              >
                <div className="flex items-center gap-4">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-semibold text-white ring-2 ring-indigo-100">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">{user.name || "Unnamed User"}</h2>
                    <p className="mt-1 text-sm text-gray-600">{user.college || "College not added"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span>{user.location || "Not provided"}</span>
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Skills Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {(user.skillsOffered?.length ? user.skillsOffered : ["Open to learn"]).map((skill, index) => (
                      <span key={`${user._id}-offered-${index}`} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Skills Wanted</p>
                  <div className="flex flex-wrap gap-2">
                    {(user.skillsWanted?.length ? user.skillsWanted : ["Open to collaborate"]).map((skill, index) => (
                      <span key={`${user._id}-wanted-${index}`} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/users/${user._id}`)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConnect(user._id)}
                    disabled={connectionState[user._id]?.loading || connectionState[user._id]?.sent}
                    className={`rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:scale-[1.02] ${connectionState[user._id]?.loading || connectionState[user._id]?.sent ? "cursor-not-allowed opacity-70 hover:scale-100" : ""}`}
                  >
                    {connectionState[user._id]?.loading ? "Sending..." : connectionState[user._id]?.sent ? "Request Sent" : "Connect"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-gray-600">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
