import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/connections/received");
        setRequests(response.data.requests || []);
      } catch (error) {
        console.error("Failed to load requests", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    if (actionState[requestId]?.loading) return;

    setActionState((prev) => ({
      ...prev,
      [requestId]: { loading: true, action },
    }));

    try {
      await api.put(
        `/connections/${requestId}/${action}`,
        {}
      );

      setRequests((prev) => prev.filter((request) => request._id !== requestId));
    } catch (error) {
      setActionState((prev) => ({
        ...prev,
        [requestId]: { loading: false, action },
      }));

      alert(error?.response?.data?.message || `Failed to ${action} connection request`);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
            <p className="mt-2 text-gray-600">Review incoming connection requests from other skill-swappers.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-700">No pending requests</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => {
              const sender = request.sender || {};

              return (
                <div
                  key={request._id}
                  className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.16)]"
                >
                  <div className="flex items-center gap-4">
                    {sender.profilePic ? (
                      <img src={sender.profilePic} alt={sender.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-semibold text-white ring-2 ring-indigo-100">
                        {sender.name ? sender.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{sender.name || "Unnamed User"}</h2>
                      <p className="mt-1 text-sm text-gray-600">{sender.college || "College not added"}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">📍</span>
                      <span>{sender.location || "Location not provided"}</span>
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleRequestAction(request._id, "accept")}
                      disabled={actionState[request._id]?.loading}
                      className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionState[request._id]?.loading && actionState[request._id]?.action === "accept" ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestAction(request._id, "reject")}
                      disabled={actionState[request._id]?.loading}
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionState[request._id]?.loading && actionState[request._id]?.action === "reject" ? "Rejecting..." : "Reject"}
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

export default Requests;
