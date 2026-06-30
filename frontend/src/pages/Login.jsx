import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      alert("Email cannot be empty.");
      return;
    }

    if (!password) {
      alert("Password cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      alert(response.data.message || "Login successful!");
      navigate("/dashboard");
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      alert(backendMessage || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#ddd6fe_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#c7d2fe_0%,transparent_40%),linear-gradient(to_bottom_left,#f3f0ff,#e8e0ff)] flex items-center justify-center px-4">

      {/* Background Blobs */}
      <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] bg-indigo-400 rounded-full blur-[130px] opacity-20"></div>

      <div className="absolute -bottom-28 -left-20 w-[26rem] h-[26rem] bg-purple-300 rounded-full blur-[120px] opacity-18"></div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-300 rounded-full blur-[100px] opacity-12"></div>

      {/* Decorative Shapes */}
      <div className="absolute top-24 left-20 w-24 h-24 border-4 border-violet-300 rounded-full opacity-30"></div>

      <div className="absolute bottom-24 right-16 w-10 h-10 bg-indigo-400 rounded-full opacity-40"></div>

      <div className="absolute top-1/3 right-24 w-16 h-16 border-2 border-indigo-300 rotate-45 opacity-25"></div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#6d28d9_1px,transparent_1px),linear-gradient(to_bottom,#6d28d9_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      {/* Small Dots */}
      <div className="absolute right-14 bottom-1/3 grid grid-cols-4 gap-3 opacity-12">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        ))}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white/78 backdrop-blur-xl border border-violet-200/70 shadow-[0_20px_60px_rgba(109,40,217,0.14),0_8px_24px_rgba(79,70,229,0.07)] p-8">

        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Welcome Back
        </h1>

        <p className="text-center text-gray-600 mt-2 text-sm leading-6">
          Sign in to SkillForge and continue exchanging skills
          with students around you.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mt-8">
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-16 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mt-3 text-right">
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3.5 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            {isSubmitting ? "Logging in..." : "Login"}
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

        {/* Sign Up */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;

