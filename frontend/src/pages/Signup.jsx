import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all the fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signup({
        name,
        email,
        password,
      });

      alert(data.message || "Account Created Successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Unable to create account. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_35%),radial-gradient(circle_at_bottom_right,#ddd6fe_0%,transparent_35%),linear-gradient(to_bottom_right,#f8fbff,#eef4ff)] flex items-center justify-center px-4">

      {/* Background Blobs */}
      <div className="absolute -top-32 -left-24 w-96 h-96 bg-sky-300 rounded-full blur-[120px] opacity-30"></div>

      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-violet-300 rounded-full blur-[120px] opacity-30"></div>

      {/* Decorative Circles */}
      <div className="absolute top-20 right-20 w-28 h-28 border-4 border-blue-200 rounded-full opacity-40"></div>

      <div className="absolute bottom-20 left-16 w-8 h-8 bg-blue-300 rounded-full opacity-60"></div>

      {/* Small Dots */}
      <div className="absolute left-14 top-1/3 grid grid-cols-4 gap-3 opacity-20">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-blue-500 rounded-full"></div>
        ))}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(37,99,235,0.15)] p-8">

        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Join SkillForge
        </h1>

        <p className="text-center text-gray-600 mt-2 text-sm leading-6">
          Connect with students, exchange skills and build
          projects together.
        </p>
        <form onSubmit={handleSubmit}>

        {/* Name */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Email */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Confirm Password */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center">
          <div className="h-px flex-1 bg-gray-200"></div>

          <span className="px-4 text-sm text-gray-400">
            or
          </span>

          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* Login */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
        </p>

        

      </div>
    </div>
  );
}

export default Signup;