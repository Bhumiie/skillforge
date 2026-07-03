import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Bind filter values directly to search params
  const difficulty = searchParams.get("difficulty") || "All";
  const technology = searchParams.get("technology") || "All";
  const status = searchParams.get("status") || "All";
  const openSlots = searchParams.get("openSlots") || "All";
  const sortBy = searchParams.get("sortBy") || "newest";

  // Local search text input state for typing smoothness
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");

  const [joinMessage, setJoinMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  // Sync search input with URL search param changes (e.g. back/forward or clear)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Write debounced search value to URL
  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());
    if (debouncedSearch) {
      currentParams.search = debouncedSearch;
    } else {
      delete currentParams.search;
    }
    setSearchParams(currentParams, { replace: true });
  }, [debouncedSearch, setSearchParams, searchParams]);

  const handleFilterChange = (key, value) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    if (value && value !== "All") {
      currentParams[key] = value;
    } else {
      delete currentParams[key];
    }
    setSearchParams(currentParams, { replace: true });
  };

  // Fetch projects from server with active query filters
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
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
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  const handleClearFilters = () => {
    setSearch("");
    setSearchParams({}, { replace: true });
  };

  const handleJoin = async (projectId) => {
    if (joiningId) return;
    setJoiningId(projectId);

    try {
      await api.post(`/projects/${projectId}/join`, {});
      setJoinMessage("Successfully joined the project!");
      setTimeout(() => setJoinMessage(""), 3000);
      fetchProjects();
    } catch {
      setJoinMessage("Failed to join project");
      setTimeout(() => setJoinMessage(""), 3000);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (projectId) => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;

    try {
      await api.post(`/projects/${projectId}/leave`, {});
      setJoinMessage("Successfully left the project!");
      setTimeout(() => setJoinMessage(""), 3000);
      fetchProjects();
    } catch {
      setJoinMessage("Failed to leave project");
      setTimeout(() => setJoinMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Explore Projects</h1>
              <p className="mt-3 text-lg text-slate-600">
                Find exciting projects, collaborate with students, and build your portfolio.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="self-start rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search projects</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, tech, owner..."
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Technology</span>
              <select
                value={technology}
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

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <select
                value={status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>All</option>
                <option>Open</option>
                <option>Full</option>
                <option>Closed</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Slots</span>
              <select
                value={openSlots}
                onChange={(e) => handleFilterChange("openSlots", e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>All</option>
                <option>Has Open Slots</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sort By</span>
              <select
                value={sortBy}
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
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-red-700">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-slate-700">No projects found matching your search.</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="cursor-pointer rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.14)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {project.difficulty}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Members: <span className="font-semibold text-slate-900">{project.members.length}/{project.maxMembers}</span>
                  </p>
                  <div>
                    {project.owner?._id === user?._id || project.owner === user?._id ? (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                      >
                        Owner
                      </button>
                    ) : project.members?.some(m => m._id === user?._id || m === user?._id) ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeave(project._id);
                        }}
                        className="rounded-full bg-rose-50 border border-rose-200 px-5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Leave Project
                      </button>
                    ) : project.status !== "Open" || project.members?.length >= project.maxMembers ? (
                      <button
                        type="button"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-slate-200 px-5 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                      >
                        Project Full
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(project._id);
                        }}
                        disabled={joiningId === project._id}
                        className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        {joiningId === project._id ? "Joining..." : "Join Project"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {joinMessage && (
          <div className="mt-8 rounded-[24px] border border-blue-200 bg-blue-50 px-6 py-4 text-blue-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            {joinMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
