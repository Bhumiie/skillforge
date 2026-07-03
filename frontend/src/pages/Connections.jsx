import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Connections() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/connections");
        setConnections(response.data.connections || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const getOtherUser = (connection) => {
    if (!user) return connection.receiver || connection.sender;
    return connection.sender?._id === user._id ? connection.receiver : connection.sender;
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] pb-12">
      <TopNavbar />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="mt-2 text-gray-600">
            See all accepted SkillSwap connections and open the next conversation.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-10 w-28 bg-slate-200 rounded-full" />
                  <div className="h-10 w-28 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-red-700">{error}</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl mb-4 text-slate-400">
              🤝
            </div>
            <h3 className="text-xl font-bold text-slate-700">No connections yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">Find developers in your university or filtering by skills, and send a request to connect.</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
            >
              Explore Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {connections.map((connection) => {
              const otherUser = getOtherUser(connection);

              return (
                <div
                  key={connection._id}
                  className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.16)]"
                >
                  <div className="flex items-center gap-4">
                    {otherUser?.profilePic ? (
                      <img
                        src={otherUser.profilePic}
                        alt={otherUser.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-semibold text-white ring-2 ring-indigo-100">
                        {otherUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {otherUser?.name || "Unknown User"}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {otherUser?.college || "College not provided"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {otherUser?.location || "Location not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/users/${otherUser._id}`)}
                      className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${otherUser._id}`)}
                      className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Connections;
