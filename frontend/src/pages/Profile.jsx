import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    location: "",
    bio: "",
    skillsOffered: "",
    skillsWanted: "",
    profilePic: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const user = response.data.user;

        setFormData({
          name: user.name || "",
          college: user.college || "",
          location: user.location || "",
          bio: user.bio || "",
          skillsOffered: Array.isArray(user.skillsOffered) ? user.skillsOffered.join(", ") : "",
          skillsWanted: Array.isArray(user.skillsWanted) ? user.skillsWanted.join(", ") : "",
          profilePic: user.profilePic || "",
          github: user.github || "",
          linkedin: user.linkedin || "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      profilePic: formData.profilePic,
      college: formData.college,
      location: formData.location,
      bio: formData.bio,
      skillsOffered: formData.skillsOffered.split(",").map((skill) => skill.trim()).filter(Boolean),
      skillsWanted: formData.skillsWanted.split(",").map((skill) => skill.trim()).filter(Boolean),
      github: formData.github,
      linkedin: formData.linkedin,
    };

    try {
      await api.put("/users/profile", payload);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg sm:p-8 lg:p-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Profile Picture URL</label>
            <input
              type="url"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="https://example.com/profile.jpg"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">College</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your college"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your location"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Skills Offered</label>
              <input
                type="text"
                name="skillsOffered"
                value={formData.skillsOffered}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. React, Node.js"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Skills Wanted</label>
              <input
                type="text"
                name="skillsWanted"
                value={formData.skillsWanted}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. UI/UX, Python"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;