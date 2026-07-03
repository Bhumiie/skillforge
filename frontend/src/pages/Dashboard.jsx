import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from URL
  const activeTab = searchParams.get("tab") || "students";

  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
    setProjectSearch("");
    setHackathonSearch("");
  };

  // Bind filter values directly to search params
  const projectDifficulty = searchParams.get("difficulty") || "All";
  const projectTechnology = searchParams.get("technology") || "All";
  const projectStatus = searchParams.get("status") || "All";
  const projectOpenSlots = searchParams.get("openSlots") || "All";
  const projectSortBy = searchParams.get("sortBy") || "newest";

  const hackathonDifficulty = searchParams.get("difficulty") || "All";
  const hackathonTechnology = searchParams.get("technology") || "All";
  const hackathonRegistrationOpen = searchParams.get("registrationOpen") || "All";
  const hackathonTeamSize = searchParams.get("teamSize") || "All";
  const hackathonTimeStatus = searchParams.get("timeStatus") || "All";
  const hackathonSortBy = searchParams.get("sortBy") || "newest";

  const [users, setUsers] = useState([]);
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

  const [showCreateHackathonModal, setShowCreateHackathonModal] = useState(false);
  const [creatingHackathon, setCreatingHackathon] = useState(false);
  const [createHackathonFormData, setCreateHackathonFormData] = useState({
    title: "",
    organizer: "",
    description: "",
    technologies: "",
    difficulty: "Beginner",
    mode: "Online",
    location: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    teamSize: 4,
    maxTeams: 100,
    prizePool: "",
  });

  // Local search text inputs
  const [projectSearch, setProjectSearch] = useState(searchParams.get("search") || "");
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState(searchParams.get("search") || "");

  const [hackathonSearch, setHackathonSearch] = useState(searchParams.get("search") || "");
  const [debouncedHackathonSearch, setDebouncedHackathonSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };

    fetchUsers();
  }, []);

  // Sync inputs with URL search param changes
  useEffect(() => {
    if (activeTab === "projects") {
      setProjectSearch(searchParams.get("search") || "");
    } else if (activeTab === "hackathons") {
      setHackathonSearch(searchParams.get("search") || "");
    }
  }, [searchParams, activeTab]);

  // Debouncing for Search Inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProjectSearch(projectSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [projectSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedHackathonSearch(hackathonSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [hackathonSearch]);

  // Write debounced searches to URL params
  useEffect(() => {
    if (activeTab !== "projects") return;
    const currentParams = Object.fromEntries(searchParams.entries());
    if (debouncedProjectSearch) {
      currentParams.search = debouncedProjectSearch;
    } else {
      delete currentParams.search;
    }
    setSearchParams(currentParams, { replace: true });
  }, [debouncedProjectSearch, setSearchParams, activeTab, searchParams]);

  useEffect(() => {
    if (activeTab !== "hackathons") return;
    const currentParams = Object.fromEntries(searchParams.entries());
    if (debouncedHackathonSearch) {
      currentParams.search = debouncedHackathonSearch;
    } else {
      delete currentParams.search;
    }
    setSearchParams(currentParams, { replace: true });
  }, [debouncedHackathonSearch, setSearchParams, activeTab, searchParams]);

  const handleFilterChange = (key, value) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    if (value && value !== "All") {
      currentParams[key] = value;
    } else {
      delete currentParams[key];
    }
    setSearchParams(currentParams, { replace: true });
  };

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const params = {};
      const s = searchParams.get("search");
      const d = searchParams.get("difficulty");
      const t = searchParams.get("technology");
      const st = searchParams.get("status");
      const os = searchParams.get("openSlots");
      const sb = searchParams.get("sortBy");

      if (s) params.search = s;
      if (d && d !== "All") params.difficulty = d;
      if (t && t !== "All") params.technology = t;
      if (st && st !== "All") params.status = st;
      if (os === "Has Open Slots") params.openSlots = "true";
      if (sb && sb !== "newest") params.sortBy = sb;

      const response = await api.get("/projects", { params });
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setProjectsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "projects") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [activeTab, fetchProjects]);

  const fetchHackathons = useCallback(async () => {
    setHackathonsLoading(true);
    try {
      const params = {};
      const s = searchParams.get("search");
      const d = searchParams.get("difficulty");
      const t = searchParams.get("technology");
      const ro = searchParams.get("registrationOpen");
      const ts = searchParams.get("teamSize");
      const tsStat = searchParams.get("timeStatus");
      const sb = searchParams.get("sortBy");

      if (s) params.search = s;
      if (d && d !== "All") params.difficulty = d;
      if (t && t !== "All") params.technology = t;
      if (ro && ro !== "All") params.registrationOpen = ro === "Open" ? "true" : "false";
      if (ts && ts !== "All") params.teamSize = ts;
      if (tsStat && tsStat !== "All") params.timeStatus = tsStat.toLowerCase();
      if (sb && sb !== "newest") params.sortBy = sb;

      const response = await api.get("/hackathons", { params });
      setHackathons(response.data || []);
    } catch (error) {
      console.error("Failed to load hackathons", error);
    } finally {
      setHackathonsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "hackathons") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHackathons();
  }, [activeTab, fetchHackathons]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);

    try {
      const payload = {
        title: createFormData.title,
        description: createFormData.description,
        technologies: createFormData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: createFormData.difficulty,
        maxMembers: parseInt(createFormData.maxMembers),
      };

      await api.post("/projects", payload);

      setShowCreateModal(false);
      setCreateFormData({
        title: "",
        description: "",
        technologies: "",
        difficulty: "Beginner",
        maxMembers: 3,
      });

      fetchProjects();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    setCreatingHackathon(true);

    try {
      const payload = {
        title: createHackathonFormData.title,
        organizer: createHackathonFormData.organizer,
        description: createHackathonFormData.description,
        technologies: createHackathonFormData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: createHackathonFormData.difficulty,
        mode: createHackathonFormData.mode,
        location: createHackathonFormData.location,
        registrationDeadline: createHackathonFormData.registrationDeadline || null,
        startDate: createHackathonFormData.startDate || null,
        endDate: createHackathonFormData.endDate || null,
        teamSize: parseInt(createHackathonFormData.teamSize),
        maxTeams: parseInt(createHackathonFormData.maxTeams),
        prizePool: createHackathonFormData.prizePool,
      };

      await api.post("/hackathons", payload);

      setShowCreateHackathonModal(false);
      setCreateHackathonFormData({
        title: "",
        organizer: "",
        description: "",
        technologies: "",
        difficulty: "Beginner",
        mode: "Online",
        location: "",
        registrationDeadline: "",
        startDate: "",
        endDate: "",
        teamSize: 4,
        maxTeams: 100,
        prizePool: "",
      });

      fetchHackathons();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create hackathon");
    } finally {
      setCreatingHackathon(false);
    }
  };

  const handleJoinHackathon = async (hackathonId) => {
    try {
      await api.post(`/hackathons/${hackathonId}/join`, {});
      alert("Successfully joined the hackathon!");
      fetchHackathons();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to join hackathon");
    }
  };

  const handleLeaveHackathon = async (hackathonId) => {
    if (!window.confirm("Are you sure you want to leave this hackathon?")) return;
    try {
      await api.post(`/hackathons/${hackathonId}/leave`, {});
      alert("Successfully left the hackathon!");
      fetchHackathons();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to leave hackathon");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClearProjectFilters = () => {
    setProjectSearch("");
    setSearchParams({ tab: "projects" }, { replace: true });
  };

  const handleClearHackathonFilters = () => {
    setHackathonSearch("");
    setSearchParams({ tab: "hackathons" }, { replace: true });
  };

  const handleJoinProject = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/join`, {});
      alert("Successfully joined the project!");
      fetchProjects();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to join project");
    }
  };

  const handleLeaveProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    try {
      await api.post(`/projects/${projectId}/leave`, {});
      alert("Successfully left the project!");
      fetchProjects();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to leave project");
    }
  };

  const handleConnect = async (userId) => {
    const currentState = connectionState[userId];

    if (!userId || currentState?.loading || currentState?.sent) return;

    setConnectionState((prev) => ({
      ...prev,
      [userId]: { loading: true, sent: false },
    }));

    try {
      await api.post(
        "/connections/request",
        { receiverId: userId }
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || "Bhumika"}.</h1>
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
            <div className="mb-8 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Recommended Projects</h2>
                <p className="mt-1 text-sm text-gray-600">Hand-picked ideas to start collaborating with your team.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClearProjectFilters}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </div>

            {/* Project Filter Bar */}
            <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search projects</span>
                <input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search title, tech, owner..."
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Difficulty</span>
                <select
                  value={projectDifficulty}
                  onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Technology</span>
                <select
                  value={projectTechnology}
                  onChange={(e) => handleFilterChange("technology", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Python</option>
                  <option>Java</option>
                  <option>AI/ML</option>
                  <option>CSS</option>
                  <option>Solidity</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
                <select
                  value={projectStatus}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>Full</option>
                  <option>Closed</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Slots</span>
                <select
                  value={projectOpenSlots}
                  onChange={(e) => handleFilterChange("openSlots", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Has Open Slots</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sort By</span>
                <select
                  value={projectSortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most_members">Most Members</option>
                  <option value="least_members">Least Members</option>
                </select>
              </label>
            </div>

            {projectsLoading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-700">No projects found matching your search.</p>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]"
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
                      <div>
                        {project.owner?._id === user?._id || project.owner === user?._id ? (
                          <button
                            type="button"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                          >
                            Owner
                          </button>
                        ) : project.members?.some(m => m._id === user?._id || m === user?._id) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveProject(project._id);
                            }}
                            className="rounded-full bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Leave Project
                          </button>
                        ) : project.status !== "Open" || project.members?.length >= project.maxMembers ? (
                          <button
                            type="button"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                          >
                            Project Full
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinProject(project._id);
                            }}
                            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                          >
                            Join Project
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "hackathons" ? (
          <>
            <div className="mb-8 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Trending Hackathons</h2>
                <p className="mt-1 text-sm text-gray-600">Find the best hackathons and recruit your next team.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClearHackathonFilters}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateHackathonModal(true)}
                  className="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Create Hackathon
                </button>
              </div>
            </div>

            {/* Hackathon Filter Bar */}
            <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search hackathons</span>
                <input
                  value={hackathonSearch}
                  onChange={(e) => setHackathonSearch(e.target.value)}
                  placeholder="Search title, tech, organizer..."
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Difficulty</span>
                <select
                  value={hackathonDifficulty}
                  onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Technology</span>
                <select
                  value={hackathonTechnology}
                  onChange={(e) => handleFilterChange("technology", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Python</option>
                  <option>Java</option>
                  <option>AI/ML</option>
                  <option>CSS</option>
                  <option>Solidity</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registration</span>
                <select
                  value={hackathonRegistrationOpen}
                  onChange={(e) => handleFilterChange("registrationOpen", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option value="Open">Registration Open</option>
                  <option value="Closed">Registration Closed</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Team Size</span>
                <select
                  value={hackathonTeamSize}
                  onChange={(e) => handleFilterChange("teamSize", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time Status</span>
                <select
                  value={hackathonTimeStatus}
                  onChange={(e) => handleFilterChange("timeStatus", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Upcoming</option>
                  <option>Ongoing</option>
                  <option>Finished</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sort By</span>
                <select
                  value={hackathonSortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Newest</option>
                  <option value="registration_deadline">Registration Deadline</option>
                  <option value="start_date">Start Date</option>
                  <option value="prize">Prize Pool</option>
                </select>
              </label>
            </div>

            {hackathonsLoading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-600">Loading hackathons...</p>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-medium text-slate-700">No hackathons found matching your search.</p>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {hackathons.map((hackathon) => {
                  const isRegClosed = hackathon.status === "Closed" || (hackathon.registrationDeadline && new Date() > new Date(hackathon.registrationDeadline));
                  const isHackathonFull = hackathon.participants?.length >= (hackathon.maxTeams * hackathon.teamSize);
                  const isUserParticipant = hackathon.participants?.some(m => m === user?._id || m._id === user?._id);
                  const isUserOwner = hackathon.owner?._id === user?._id || hackathon.owner === user?._id;

                  return (
                    <div
                      key={hackathon._id}
                      onClick={() => navigate(`/hackathons/${hackathon._id}`)}
                      className="cursor-pointer rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]"
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
                            Registration: {hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Team size: {hackathon.teamSize}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
                          <span>{hackathon.participants?.length || 0} Joined</span>
                          <div>
                            {isUserOwner ? (
                              <button
                                type="button"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                              >
                                Owner
                              </button>
                            ) : isUserParticipant ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveHackathon(hackathon._id);
                                }}
                                className="rounded-full bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                              >
                                Leave Hackathon
                              </button>
                            ) : isRegClosed ? (
                              <button
                                type="button"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                              >
                                Registration Closed
                              </button>
                            ) : isHackathonFull ? (
                              <button
                                type="button"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                              >
                                Full
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinHackathon(hackathon._id);
                                }}
                                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                              >
                                Join Hackathon
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {showCreateHackathonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Create New Hackathon</h2>
            <p className="mt-2 text-sm text-gray-600">Host or list a hackathon to recruit developers.</p>

            <form onSubmit={handleCreateHackathon} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={createHackathonFormData.title}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. HackMIT"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Organizer</label>
                <input
                  type="text"
                  value={createHackathonFormData.organizer}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, organizer: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. MIT CS Department"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={createHackathonFormData.description}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, description: e.target.value })}
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Provide hackathon rules, goals, and description"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={createHackathonFormData.technologies}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, technologies: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. React, Python, Solidity"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
                  <select
                    value={createHackathonFormData.difficulty}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
                  <select
                    value={createHackathonFormData.mode}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, mode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              {createHackathonFormData.mode !== "Online" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    value={createHackathonFormData.location}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. Building 10, MIT Campus"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Team Size</label>
                  <input
                    type="number"
                    min="1"
                    value={createHackathonFormData.teamSize}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, teamSize: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Max Teams</label>
                  <input
                    type="number"
                    min="1"
                    value={createHackathonFormData.maxTeams}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, maxTeams: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Prize Pool</label>
                <input
                  type="text"
                  value={createHackathonFormData.prizePool}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, prizePool: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. $5,000 Cash + Goodies"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Registration Deadline</label>
                <input
                  type="date"
                  value={createHackathonFormData.registrationDeadline}
                  onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, registrationDeadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={createHackathonFormData.startDate}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={createHackathonFormData.endDate}
                    onChange={(e) => setCreateHackathonFormData({ ...createHackathonFormData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateHackathonModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingHackathon}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingHackathon ? "Creating..." : "Create Hackathon"}
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
