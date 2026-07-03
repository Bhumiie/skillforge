import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
    status: "Open",
  });

  const fetchHackathon = useCallback(async () => {
    try {
      const response = await api.get(`/hackathons/${id}`);
      const data = response.data;
      setHackathon(data);
      setEditFormData({
        title: data.title || "",
        organizer: data.organizer || "",
        description: data.description || "",
        technologies: Array.isArray(data.technologies) ? data.technologies.join(", ") : "",
        difficulty: data.difficulty || "Beginner",
        mode: data.mode || "Online",
        location: data.location || "",
        registrationDeadline: data.registrationDeadline ? data.registrationDeadline.substring(0, 10) : "",
        startDate: data.startDate ? data.startDate.substring(0, 10) : "",
        endDate: data.endDate ? data.endDate.substring(0, 10) : "",
        teamSize: data.teamSize || 4,
        maxTeams: data.maxTeams || 100,
        prizePool: data.prizePool || "",
        status: data.status || "Open",
      });
    } catch (error) {
      console.error("Failed to load hackathon details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHackathon();
  }, [id, fetchHackathon]);

  const handleJoin = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post(`/hackathons/${id}/join`, {});
      addToast("Successfully joined the hackathon!", "success");
      await fetchHackathon();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to join hackathon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (actionLoading) return;
    if (!window.confirm("Are you sure you want to leave this hackathon?")) return;
    setActionLoading(true);

    try {
      await api.post(`/hackathons/${id}/leave`, {});
      addToast("Successfully left the hackathon!", "success");
      await fetchHackathon();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to leave hackathon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hackathon? This action cannot be undone.")) return;
    setActionLoading(true);

    try {
      await api.delete(`/hackathons/${id}`);
      addToast("Hackathon deleted successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to delete hackathon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      title: editFormData.title,
      organizer: editFormData.organizer,
      description: editFormData.description,
      technologies: editFormData.technologies.split(",").map((tech) => tech.trim()).filter(Boolean),
      difficulty: editFormData.difficulty,
      mode: editFormData.mode,
      location: editFormData.location,
      registrationDeadline: editFormData.registrationDeadline || null,
      startDate: editFormData.startDate || null,
      endDate: editFormData.endDate || null,
      teamSize: parseInt(editFormData.teamSize),
      maxTeams: parseInt(editFormData.maxTeams),
      prizePool: editFormData.prizePool,
      status: editFormData.status,
    };

    try {
      await api.put(`/hackathons/${id}`, payload);
      addToast("Hackathon updated successfully!", "success");
      setShowEditModal(false);
      await fetchHackathon();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to update hackathon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-gray-900">Hackathon not found</h2>
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

  const isOwner = hackathon.owner?._id === user?._id || hackathon.owner === user?._id;
  const isParticipant = hackathon.participants?.some(
    (p) => p._id === user?._id || p === user?._id
  );

  const isRegistrationClosed =
    hackathon.status === "Closed" ||
    (hackathon.registrationDeadline && new Date() > new Date(hackathon.registrationDeadline));

  const totalCapacity = hackathon.maxTeams * hackathon.teamSize;
  const isFull = hackathon.participants?.length >= totalCapacity;

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
            <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
            <p className="mt-2 text-md text-indigo-600 font-semibold">{hackathon.organizer}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {hackathon.difficulty}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {hackathon.mode}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  hackathon.status === "Open" && !isRegistrationClosed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {isRegistrationClosed ? "Closed" : hackathon.status}
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
                  Delete Hackathon
                </button>
              </>
            ) : isParticipant ? (
              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-75"
              >
                {actionLoading ? "Processing..." : "Leave Hackathon"}
              </button>
            ) : isRegistrationClosed ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-slate-400 px-5 py-2.5 text-sm font-semibold text-white cursor-not-allowed"
              >
                Registration Closed
              </button>
            ) : isFull ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-slate-400 px-5 py-2.5 text-sm font-semibold text-white cursor-not-allowed"
              >
                Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={actionLoading}
                className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-75"
              >
                {actionLoading ? "Processing..." : "Join Hackathon"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">About the Hackathon</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                {hackathon.description}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Skills / Technologies Required
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {hackathon.technologies?.length > 0 ? (
                  hackathon.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No specific technologies listed.</span>
                )}
              </div>
            </div>

            {hackathon.prizePool && (
              <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Prize Pool
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {hackathon.prizePool}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Key Dates & Details
              </h3>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Registration Deadline</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(hackathon.registrationDeadline)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Starts</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(hackathon.startDate)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Ends</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(hackathon.endDate)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Team Size</span>
                  <span className="font-semibold text-slate-800">
                    {hackathon.teamSize} members
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Max Teams</span>
                  <span className="font-semibold text-slate-800">
                    {hackathon.maxTeams} teams
                  </span>
                </div>
                {hackathon.location && (
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500">Location</span>
                    <span className="font-semibold text-slate-800">
                      {hackathon.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Organizer / Owner
              </h3>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-lg font-semibold text-white ring-2 ring-indigo-100">
                  {hackathon.owner?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {hackathon.owner?.name || "Unknown User"}
                  </h4>
                  <p className="text-xs text-slate-500">{hackathon.owner?.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Participants
                </h3>
                <span className="text-xs font-semibold text-indigo-600">
                  {hackathon.participants?.length || 0} Joined
                </span>
              </div>

              <div className="space-y-3">
                {hackathon.participants?.length > 0 ? (
                  hackathon.participants.map((participant) => (
                    <div key={participant._id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-2 ring-indigo-500/10">
                        {participant.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {participant.name || "Unnamed User"}
                        </h4>
                        <p className="text-xs text-slate-500">{participant.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No participants yet. Be the first to join!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Edit Hackathon Details</h2>
            <p className="mt-2 text-sm text-gray-600">Update your hackathon specifications.</p>

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
                <label className="mb-2 block text-sm font-medium text-slate-700">Organizer</label>
                <input
                  type="text"
                  value={editFormData.organizer}
                  onChange={(e) => setEditFormData({ ...editFormData, organizer: e.target.value })}
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mode: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              {editFormData.mode !== "Online" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Physical location details"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Team Size</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.teamSize}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, teamSize: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Max Teams</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.maxTeams}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, maxTeams: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Prize Pool</label>
                <input
                  type="text"
                  value={editFormData.prizePool}
                  onChange={(e) => setEditFormData({ ...editFormData, prizePool: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. $10,000 cash, goodies, etc."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Registration Deadline</label>
                <input
                  type="date"
                  value={editFormData.registrationDeadline}
                  onChange={(e) => setEditFormData({ ...editFormData, registrationDeadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
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

export default HackathonDetails;
