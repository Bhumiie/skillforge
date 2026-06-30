import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [connectionState, setConnectionState] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [hackathons, setHackathons] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    difficulty: "Beginner",
    maxMembers: 3,
  });
  const [creatingProject, setCreatingProject] = useState(false);

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

  useEffect(() => {
    const fetchProjects = async () => {
      if (activeTab !== "projects") return;

      setProjectsLoading(true);
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [activeTab]);

  useEffect(() => {
    const fetchHackathons = async () => {
      if (activeTab !== "hackathons") return;

      setHackathonsLoading(true);

      try {
        const response = await axios.get(
          "http://localhost:5000/api/hackathons"
        );

        setHackathons(response.data || []);
      } catch (error) {
        console.error("Failed to load hackathons", error);
      } finally {
        setHackathonsLoading(false);
      }
    };

    fetchHackathons();
  }, [activeTab]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);

    const token = localStorage.getItem("token");

    try {
      const payload = {
        title: createFormData.title,
        description: createFormData.description,
        technologies: createFormData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: createFormData.difficulty,
        maxMembers: parseInt(createFormData.maxMembers),
      };

      await axios.post("http://localhost:5000/api/projects", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowCreateModal(false);
      setCreateFormData({
        title: "",
        description: "",
        technologies: "",
        difficulty: "Beginner",
        maxMembers: 3,
      });

      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

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
    <div className="min-h-screen bg-[#eef4ff] px-4 py-6 sm:px-6 lg:px-8">
      <TopNavbar />
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Bhumika.</h1>
          <p className="mt-1 text-sm text-gray-600">Build • Learn • Collaborate</p>
        </div>

        <div className="mb-4 border-b border-slate-200">
          <div className="flex flex-wrap gap-12 px-4 pb-3 text-sm font-medium text-slate-600 sm:px-0">
            {[
              { key: "students", label: "Students" },
              { key: "projects", label: "Projects" },
              { key: "hackathons", label: "Hackathons" },
              { key: "messages", label: "Messages" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative transition-colors duration-300 ${
                  activeTab === tab.key
                    ? "text-blue-800 font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 mx-auto h-1 rounded-full bg-blue-600 transition-all duration-300 ${
                    activeTab === tab.key ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {activeTab === "students" ? (
          <>
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
          </>
        ) : activeTab === "projects" ? (
          <>
            <div className="mb-10 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Recommended Projects</h2>
                <p className="mt-1 text-sm text-gray-600">Hand-picked ideas to start collaborating with your team.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>

            {projectsLoading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-700">No projects available</p>
                <p className="mt-2 text-sm text-slate-500">Be the first to create a project!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {projects.slice(0, 4).map((project) => (
                  <div
                    key={project._id}
                    className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="mt-3 text-sm text-gray-600">{project.description}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                        {project.difficulty}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-600">
                      <span>{project.members.length}/{project.maxMembers} members</span>
                      <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "hackathons" ? (
          <>
            <div className="mb-10 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Trending Hackathons</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Find the best hackathons and recruit your next team.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Find Team
              </button>
            </div>

            {hackathonsLoading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-600">Loading hackathons...</p>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-700">No hackathons available</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {hackathons.map((hackathon) => (
                  <div
                    key={hackathon._id}
                    className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{hackathon.title}</h3>
                          <p className="mt-2 text-sm text-gray-600">{hackathon.organizer}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                          {hackathon.mode}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hackathon.technologies.map((tech) => (
                          <span key={tech} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          Registration: {hackathon.registrationDeadline}
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          Team size: {hackathon.teamSize}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-600">Join a strong team fast</span>
                        <button type="button" className="text-sm font-semibold text-blue-600 transition hover:text-blue-800">
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-lg font-medium text-slate-600 shadow-sm">
            Messages Coming Soon
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="mt-2 text-sm text-gray-600">Share your project idea and find collaborators.</p>

            <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Project title"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Describe your project"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={createFormData.technologies}
                  onChange={(e) => setCreateFormData({ ...createFormData, technologies: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
                  <select
                    value={createFormData.difficulty}
                    onChange={(e) => setCreateFormData({ ...createFormData, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Max Members</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={createFormData.maxMembers}
                    onChange={(e) => setCreateFormData({ ...createFormData, maxMembers: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
