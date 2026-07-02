import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data.user || null);
      } catch (error) {
        console.error("Failed to load user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleConnect = async () => {
    if (!user?._id || isConnecting || requestSent) return;

    setIsConnecting(true);

    try {
      await api.post(
        "/connections/request",
        { receiverId: user._id }
      );

      setRequestSent(true);
    } catch (error) {
      alert("Failed to send connection request");
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <p className="text-lg font-medium text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-gray-900">User not found</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 font-medium text-white transition hover:scale-[1.02]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          ← Back
        </button>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-100" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-3xl font-semibold text-white ring-4 ring-indigo-100">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name || "Unnamed User"}</h1>
              <p className="mt-2 text-lg text-slate-600">{user.college || "College not added"}</p>
              <p className="mt-1 text-sm text-slate-500">{user.location || "Location not provided"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting || requestSent}
              className={`rounded-full px-4 py-2 text-sm font-medium text-white transition ${requestSent ? "cursor-not-allowed bg-emerald-600" : "bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02]"} ${isConnecting ? "opacity-70" : ""}`}
            >
              {isConnecting ? "Sending..." : requestSent ? "Request Sent" : "Connect"}
            </button>

            {user.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                GitHub
              </a>
            )}
            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">About</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Skills Offered</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.skillsOffered?.length ? user.skillsOffered : ["Open to learn"]).map((skill, index) => (
                  <span key={`${user._id}-offered-${index}`} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500">Skills Wanted</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.skillsWanted?.length ? user.skillsWanted : ["Open to collaborate"]).map((skill, index) => (
                  <span key={`${user._id}-wanted-${index}`} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
