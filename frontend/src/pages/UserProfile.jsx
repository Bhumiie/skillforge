import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeSubTab, setActiveSubTab] = useState("about"); // about, projects, hackathons
  const [isConnecting, setIsConnecting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const fetchUserProfileDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/users/${id}/details`);
      if (response.data.success) {
        setProfileData(response.data);
      } else {
        setError("Failed to fetch user profile details");
      }
    } catch {
      setError("User profile not found or failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserProfileDetails();
  }, [id, fetchUserProfileDetails]);

  // Check if we already have a pending connection request
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get("/connections/requests/sent");
        const sentRequests = response.data || [];
        const alreadySent = sentRequests.some(
          (req) => req.receiver?._id === id || req.receiver === id
        );
        setRequestSent(alreadySent);
      } catch (err) {
        console.error("Failed to check connection request state", err);
      }
    };
    if (id) checkConnection();
  }, [id]);

  const handleConnect = async () => {
    if (isConnecting || requestSent) return;
    setIsConnecting(true);

    try {
      await api.post("/connections/request", { receiverId: id });
      setRequestSent(true);
      alert("Connection request sent successfully!");
    } catch {
      alert("Failed to send connection request.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef4ff] pb-12">
        <TopNavbar />
        <div className="mx-auto mt-10 max-w-7xl px-4 py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-slate-600">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#eef4ff] pb-12">
        <TopNavbar />
        <div className="mx-auto mt-10 max-w-xl px-4 py-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
            <h2 className="text-xl font-bold text-red-800">Profile Not Found</h2>
            <p className="mt-2 text-slate-600">{error || "The developer profile you are trying to view does not exist."}</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats, projects, hackathons } = profileData;

  return (
    <div className="min-h-screen bg-[#eef4ff] pb-12">
      <TopNavbar />
      
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Back to Dashboard
        </button>

        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-4 ring-blue-100"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-4xl font-bold text-white shadow-md ring-4 ring-blue-100">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">{user.name}</h1>
                <p className="mt-2 text-lg text-slate-600 font-medium">{user.degree || "Student"} • Class of {user.graduationYear || "N/A"}</p>
                <p className="mt-1 text-sm text-slate-500">{user.college || "University name not added"}</p>
                <p className="mt-1 text-sm text-slate-400">📍 {user.location || "Location not provided"}</p>
              </div>
            </div>

            {authUser?._id !== user._id && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting || requestSent}
                  className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${
                    requestSent
                      ? "bg-emerald-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isConnecting ? "Sending..." : requestSent ? "Request Sent" : "Connect"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Projects Created", val: stats.projectsCreated },
            { label: "Projects Joined", val: stats.projectsJoined },
            { label: "Hackathons Joined", val: stats.hackathonsJoined },
            { label: "Connections", val: stats.connections },
            { label: "Unique Skills", val: stats.skillsCount },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
            >
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.val}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-12 border-b border-slate-200">
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            {[
              { key: "about", label: "About & Skills" },
              { key: "projects", label: "Projects" },
              { key: "hackathons", label: "Hackathons" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSubTab(tab.key)}
                className={`relative pb-3 transition duration-300 ${
                  activeSubTab === tab.key ? "text-blue-700 font-semibold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                    activeSubTab === tab.key ? "w-full" : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tab Contents */}
        <div className="mt-8">
          {activeSubTab === "about" && (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Bio & Social Links */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">About Me</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600 whitespace-pre-line">
                  {user.bio || "No bio description provided."}
                </p>

                <h3 className="mt-10 text-md font-bold text-slate-900 border-t pt-8">Professional Links & Documents</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {user.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="text-lg">🐙</span> GitHub Profile
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="text-lg">💼</span> LinkedIn Connection
                    </a>
                  )}
                  {user.portfolio && (
                    <a
                      href={user.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="text-lg">🌐</span> Portfolio Website
                    </a>
                  )}
                  {user.resume && (
                    <a
                      href={user.resume}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
                    >
                      <span className="text-lg">📄</span> Download Resume
                    </a>
                  )}

                  {!user.github && !user.linkedin && !user.portfolio && !user.resume && (
                    <p className="text-sm text-slate-500 col-span-full">No professional links or resume added yet.</p>
                  )}
                </div>
              </div>

              {/* Skills Card */}
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Skills Offered</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(user.skillsOffered?.length ? user.skillsOffered : ["Open to learn"]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-medium text-blue-700 border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Skills Wanted</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(user.skillsWanted?.length ? user.skillsWanted : ["Open to collaborate"]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-violet-50 px-3.5 py-1.5 text-sm font-medium text-violet-700 border border-violet-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "projects" && (
            <div className="space-y-10">
              {/* Created Projects */}
              <div>
                <h3 className="text-lg font-bold text-slate-800">Created Projects</h3>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {projects.created.length > 0 ? (
                    projects.created.map((project) => (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
                      >
                        <h4 className="text-xl font-bold text-slate-900">{project.title}</h4>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>{project.members.length}/{project.maxMembers} Members</span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 border border-emerald-100">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                      No created projects found.
                    </div>
                  )}
                </div>
              </div>

              {/* Joined Projects */}
              <div>
                <h3 className="text-lg font-bold text-slate-800">Joined Projects</h3>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {projects.joined.length > 0 ? (
                    projects.joined.map((project) => (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
                      >
                        <h4 className="text-xl font-bold text-slate-900">{project.title}</h4>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>{project.members.length}/{project.maxMembers} Members</span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 border border-emerald-100">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                      No joined projects found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "hackathons" && (
            <div className="space-y-10">
              {/* Created Hackathons */}
              <div>
                <h3 className="text-lg font-bold text-slate-800">Created Hackathons</h3>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {hackathons.created.length > 0 ? (
                    hackathons.created.map((hackathon) => (
                      <div
                        key={hackathon._id}
                        onClick={() => navigate(`/hackathons/${hackathon._id}`)}
                        className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
                      >
                        <h4 className="text-xl font-bold text-slate-900">{hackathon.title}</h4>
                        <p className="mt-1 text-xs text-slate-400 font-semibold">{hackathon.organizer}</p>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{hackathon.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>{hackathon.participants?.length || 0} Registered</span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 border border-indigo-100">
                            {hackathon.mode}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                      No created hackathons found.
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Hackathons */}
              <div>
                <h3 className="text-lg font-bold text-slate-800">Joined Hackathons</h3>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {hackathons.joined.length > 0 ? (
                    hackathons.joined.map((hackathon) => (
                      <div
                        key={hackathon._id}
                        onClick={() => navigate(`/hackathons/${hackathon._id}`)}
                        className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
                      >
                        <h4 className="text-xl font-bold text-slate-900">{hackathon.title}</h4>
                        <p className="mt-1 text-xs text-slate-400 font-semibold">{hackathon.organizer}</p>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{hackathon.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>{hackathon.participants?.length || 0} Registered</span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 border border-indigo-100">
                            {hackathon.mode}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                      No joined hackathons found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
