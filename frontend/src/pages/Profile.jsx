import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeSubTab, setActiveSubTab] = useState("about"); // about, projects, hackathons
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    college: "",
    degree: "",
    graduationYear: "",
    location: "",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
    profilePic: "",
    resume: "",
    skillsOffered: "",
    skillsWanted: "",
  });

  const fetchProfileDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users/profile/details");
      if (response.data.success) {
        setProfileData(response.data);
        const user = response.data.user;
        setEditForm({
          name: user.name || "",
          college: user.college || "",
          degree: user.degree || "",
          graduationYear: user.graduationYear || "",
          location: user.location || "",
          bio: user.bio || "",
          github: user.github || "",
          linkedin: user.linkedin || "",
          portfolio: user.portfolio || "",
          profilePic: user.profilePic || "",
          resume: user.resume || "",
          skillsOffered: Array.isArray(user.skillsOffered) ? user.skillsOffered.join(", ") : "",
          skillsWanted: Array.isArray(user.skillsWanted) ? user.skillsWanted.join(", ") : "",
        });
      } else {
        setError("Failed to fetch profile details");
      }
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfileDetails();
  }, [fetchProfileDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (type === "profilePic") setUploadingPic(true);
    if (type === "resume") setUploadingResume(true);

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setEditForm((prev) => ({ ...prev, [type]: response.data.fileUrl }));
        alert(`${type === "profilePic" ? "Profile picture" : "Resume"} uploaded successfully! Click save to apply changes.`);
      }
    } catch {
      alert("File upload failed. Please try again.");
    } finally {
      setUploadingPic(false);
      setUploadingResume(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!editForm.name.trim()) {
      alert("Name is required.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (editForm.github && !urlPattern.test(editForm.github)) {
      alert("Please provide a valid GitHub URL.");
      return;
    }
    if (editForm.linkedin && !urlPattern.test(editForm.linkedin)) {
      alert("Please provide a valid LinkedIn URL.");
      return;
    }
    if (editForm.portfolio && !urlPattern.test(editForm.portfolio)) {
      alert("Please provide a valid Portfolio URL.");
      return;
    }

    setSaving(true);
    const payload = {
      ...editForm,
      skillsOffered: editForm.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
      skillsWanted: editForm.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const response = await api.put("/users/profile", payload);
      if (response.data.success) {
        alert("Profile updated successfully!");
        setShowEditModal(false);
        fetchProfileDetails();
      }
    } catch {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-8">
        <TopNavbar />
        <div className="mx-auto mt-10 max-w-7xl px-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-slate-600">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#eef4ff] px-4 py-8">
        <TopNavbar />
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-slate-600">{error || "Failed to load developer profile details."}</p>
          <button
            type="button"
            onClick={fetchProfileDetails}
            className="mt-6 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, projects, hackathons } = profileData;

  return (
    <div className="min-h-screen bg-[#eef4ff] pb-12">
      <TopNavbar />
      
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        
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
                <p className="mt-2 text-lg text-slate-600 font-medium">{user.degree || "Degree not specified"} • Class of {user.graduationYear || "N/A"}</p>
                <p className="mt-1 text-sm text-slate-500">{user.college || "University name not added"}</p>
                <p className="mt-1 text-sm text-slate-400">📍 {user.location || "Location not provided"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Projects Created", val: stats.projectsCreated, color: "text-blue-600" },
            { label: "Projects Joined", val: stats.projectsJoined, color: "text-violet-600" },
            { label: "Hackathons Joined", val: stats.hackathonsJoined, color: "text-indigo-600" },
            { label: "Connections", val: stats.connections, color: "text-emerald-600" },
            { label: "Unique Skills", val: stats.skillsCount, color: "text-amber-600" },
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
                  {user.bio || "Write a brief description about yourself using the Edit Profile dialog."}
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative my-8 w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Edit Profile</h2>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Asset Uploads */}
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Profile Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "profilePic")}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingPic && <p className="text-xs text-blue-600">Uploading image...</p>}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Upload Resume</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileUpload(e, "resume")}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingResume && <p className="text-xs text-blue-600">Uploading resume...</p>}
                </label>
              </div>

              {/* Basic Fields */}
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">College</span>
                  <input
                    type="text"
                    name="college"
                    value={editForm.college}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your college"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Degree</span>
                  <input
                    type="text"
                    name="degree"
                    value={editForm.degree}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Graduation Year</span>
                  <input
                    type="text"
                    name="graduationYear"
                    value={editForm.graduationYear}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. 2026"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Location</span>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. San Francisco, CA"
                  />
                </label>
              </div>

              {/* Social Links */}
              <div className="grid gap-6 sm:grid-cols-3">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">GitHub Profile URL</span>
                  <input
                    type="url"
                    name="github"
                    value={editForm.github}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://github.com/username"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">LinkedIn URL</span>
                  <input
                    type="url"
                    name="linkedin"
                    value={editForm.linkedin}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://linkedin.com/in/username"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Portfolio Website URL</span>
                  <input
                    type="url"
                    name="portfolio"
                    value={editForm.portfolio}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://portfolio.com"
                  />
                </label>
              </div>

              {/* Bio & Skills */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Bio</span>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Tell us about yourself..."
                />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Skills Offered (comma separated)</span>
                  <input
                    type="text"
                    name="skillsOffered"
                    value={editForm.skillsOffered}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. React, Node.js, Python"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Skills Wanted (comma separated)</span>
                  <input
                    type="text"
                    name="skillsWanted"
                    value={editForm.skillsWanted}
                    onChange={handleInputChange}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Solidity, AI/ML, Figma"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPic || uploadingResume}
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;