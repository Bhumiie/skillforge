import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function Projects() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [technology, setTechnology] = useState("All");
  const [joinMessage, setJoinMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data.projects || []);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch =
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty =
          difficulty === "All" || project.difficulty === difficulty;
        const matchesTechnology =
          technology === "All" || project.technologies.includes(technology);

        return matchesSearch && matchesDifficulty && matchesTechnology;
      }),
    [search, difficulty, technology, projects]
  );

  const handleJoin = async (projectId) => {
    if (joiningId) return;

    setJoiningId(projectId);

    try {
      await api.post(`/projects/${projectId}/join`, {});

      setJoinMessage("Successfully joined the project!");
      setTimeout(() => setJoinMessage(""), 3000);

      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to join project";
      setJoinMessage(message);
      setTimeout(() => setJoinMessage(""), 3000);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h1 className="text-4xl font-bold text-slate-900">Explore Projects</h1>
          <p className="mt-3 text-lg text-slate-600">
            Find exciting projects, collaborate with students, and build your portfolio.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Search projects</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description"
                className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option>All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Technology</span>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option>All</option>
                <option>React</option>
                <option>Node.js</option>
                <option>Python</option>
                <option>Java</option>
                <option>AI/ML</option>
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
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.14)]"
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
                  <div className="flex gap-3">
                    <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJoin(project._id)}
                      disabled={joiningId === project._id || project.status !== "Open"}
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                        joiningId === project._id || project.status !== "Open"
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {joiningId === project._id ? "Joining..." : project.status === "Open" ? "Join Project" : project.status}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            No projects match your filters.
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
