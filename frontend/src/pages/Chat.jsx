import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api";

function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/messages/${userId}`);
        setMessages(response.data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [userId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post("/messages", {
        receiverId: userId,
        text: trimmedText,
      });

      setMessages((prev) => [...prev, response.data.message]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const isOwnMessage = (message) => {
    return message.sender === user?._id || message.sender === user?.id;
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
          <p className="mt-2 text-gray-600">
            Conversation with the selected SkillSwap user.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          {loading ? (
            <div className="py-16 text-center text-slate-600">Loading conversation...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sortedMessages.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
                    No messages yet. Start the conversation below.
                  </div>
                ) : (
                  sortedMessages.map((message) => {
                    const own = isOwnMessage(message);
                    return (
                      <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${
                            own ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <div className="mt-3 text-xs text-slate-400">
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[56px] flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-14 items-center justify-center rounded-3xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
