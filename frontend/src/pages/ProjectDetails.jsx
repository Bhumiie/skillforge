import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    difficulty: "Beginner",
    maxMembers: 3,
    status: "Open",
  });

  const fetchProject = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      const data = response.data.project;
      setProject(data);
      setEditFormData({
        title: data.title || "",
        description: data.description || "",
        technologies: Array.isArray(data.technologies) ? data.technologies.join(", ") : "",
        difficulty: data.difficulty || "Beginner",
        maxMembers: data.maxMembers || 3,
        status: data.status || "Open",
      });
    } catch (error) {
      console.error("Failed to load project details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject();
  }, [id, fetchProject]);

  const handleJoin = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post(`/projects/${id}/join`, {});
      addToast("Successfully joined the project!", "success");
      await fetchProject();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to join project", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (actionLoading) return;
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    setActionLoading(true);

    try {
      await api.post(`/projects/${id}/leave`, {});
      addToast("Successfully left the project!", "success");
      await fetchProject();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to leave project", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    setActionLoading(true);

    try {
      await api.delete(`/projects/${id}`);
      addToast("Project deleted successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to delete project", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      title: editFormData.title,
      description: editFormData.description,
      technologies: editFormData.technologies.split(",").map((tech) => tech.trim()).filter(Boolean),
      difficulty: editFormData.difficulty,
      maxMembers: parseInt(editFormData.maxMembers),
      status: editFormData.status,
    };

    try {
      await api.put(`/projects/${id}`, payload);
      addToast("Project updated successfully!", "success");
      setShowEditModal(false);
      await fetchProject();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to update project", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="space-y-4">
            <div className="h-8 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="mt-8 flex gap-3">
            <div className="h-10 w-28 rounded-full bg-slate-200" />
            <div className="h-10 w-28 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
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

  const isOwner = project.owner?._id === user?._id;
  const isMember = project.members?.some((member) => member._id === user?._id);

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          ← Back
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {project.difficulty}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  project.status === "Open"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete Project
                </button>
              </>
            ) : isMember ? (
              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-75"
              >
                {actionLoading ? "Processing..." : "Leave Project"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={actionLoading || project.status !== "Open"}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${
                  project.status !== "Open"
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02]"
                }`}
              >
                {actionLoading ? "Processing..." : project.status === "Open" ? "Join Project" : "Not Accepting Members"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">About the Project</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Technologies Used
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technologies?.length > 0 ? (
                  project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No technologies listed.</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Project Owner
              </h3>
              <div className="mt-4 flex items-center gap-3">
                {project.owner?.profilePic ? (
                  <img
                    src={project.owner.profilePic}
                    alt={project.owner.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-lg font-semibold text-white ring-2 ring-indigo-100">
                    {project.owner?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {project.owner?.name || "Unknown User"}
                  </h4>
                  <p className="text-xs text-slate-500">{project.owner?.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Team Members
                </h3>
                <span className="text-xs font-semibold text-indigo-600">
                  {project.members?.length || 0} / {project.maxMembers}
                </span>
              </div>

              <div className="space-y-3">
                {project.members?.length > 0 ? (
                  project.members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3">
                      {member.profilePic ? (
                        <img
                          src={member.profilePic}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/10"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-2 ring-indigo-500/10">
                          {member.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {member.name || "Unnamed User"}
                        </h4>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No team members yet. Join to collaborate!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Edit Project Details</h2>
            <p className="mt-2 text-sm text-gray-600">Update your project specifications.</p>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={editFormData.technologies}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, technologies: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
                  <select
                    value={editFormData.difficulty}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, difficulty: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Open</option>
                    <option>Full</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Max Members</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editFormData.maxMembers}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, maxMembers: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
