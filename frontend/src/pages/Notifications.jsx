import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError("Failed to fetch notifications");
      }
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
      }
    } catch {
      alert("Failed to mark notification as read.");
    }
  };

  const markAllRead = async () => {
    try {
      const response = await api.put("/notifications/read-all");
      if (response.data.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      }
    } catch {
      alert("Failed to mark all as read.");
    }
  };

  const deleteNotif = async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data.success) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      }
    } catch {
      alert("Failed to delete notification.");
    }
  };

  const getFriendlyTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 600);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${diffDays} days ago`;
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "message":
        return { icon: "💬", bg: "bg-blue-50 border-blue-200 text-blue-700" };
      case "connection":
        return { icon: "🤝", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" };
      case "project":
        return { icon: "📁", bg: "bg-indigo-50 border-indigo-200 text-indigo-700" };
      case "hackathon":
        return { icon: "🏆", bg: "bg-amber-50 border-amber-200 text-amber-700" };
      case "success":
        return { icon: "✅", bg: "bg-green-50 border-green-200 text-green-700" };
      case "warning":
        return { icon: "⚠️", bg: "bg-rose-50 border-rose-200 text-rose-700" };
      default:
        return { icon: "ℹ️", bg: "bg-slate-50 border-slate-200 text-slate-700" };
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] pb-12">
      <TopNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="flex items-center justify-between mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Notification Center</h1>
            <p className="mt-1 text-sm text-slate-500">Stay updated on your SkillSwap activity</p>
          </div>
          
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="rounded-[32px] bg-white p-12 text-center shadow-sm border border-slate-100">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="rounded-[32px] bg-red-50 p-8 text-center shadow-sm border border-red-200">
            <h3 className="text-lg font-bold text-red-800">Something went wrong</h3>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[32px] bg-white p-16 text-center shadow-sm border border-slate-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-2xl mx-auto mb-4">
              🔔
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">All caught up!</h2>
            <p className="text-xs text-slate-500 mt-2">No new notifications. We'll let you know when things happen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const { icon, bg } = getTypeStyle(notif.type);
              return (
                <div
                  key={notif._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[28px] border transition shadow-sm ${
                    notif.isRead ? "bg-white border-slate-200" : "bg-blue-50/40 border-blue-200"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl ${bg}`}>
                      {icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className={`text-sm font-bold ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-extrabold uppercase text-white tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-2">
                        {getFriendlyTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(notif._id)}
                        className="rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                      >
                        Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotif(notif._id)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:border-red-200 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Notifications;
