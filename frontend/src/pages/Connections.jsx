import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api";

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
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="mt-2 text-gray-600">
            See all accepted SkillSwap connections and open the next conversation.
          </p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-600">Loading connections...</p>
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-red-700">{error}</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-700">No connections yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Once your requests are accepted, your connections will appear here.
            </p>
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

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigate(`/users/${otherUser?._id}`)}
                      className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${otherUser?._id}`)}
                      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
