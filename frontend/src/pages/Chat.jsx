import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext";
import api from "../api/api";
import TopNavbar from "../components/TopNavbar/TopNavbar";

function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId } = useParams();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get("/messages/conversations");
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations list", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages in the active conversation
  const fetchConversation = useCallback(async () => {
    if (!userId) {
      setMessages([]);
      return;
    }
    setError("");
    try {
      const response = await api.get(`/messages/${userId}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch {
      setError("Unable to load conversation. Please try again.");
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

  // Load conversations once
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
  }, [fetchConversations]);

  // Load conversation details when active partner changes
  useEffect(() => {
    if (userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingMessages(true);
      fetchConversation();
    }
  }, [userId, fetchConversation]);

  // Periodic polling every 4 seconds to check for new messages/conversations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (userId) {
        fetchConversation();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [userId, fetchConversations, fetchConversation]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !userId) return;

    // Optimistic UI update
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: user?._id || user?.id,
      receiver: userId,
      text: trimmedText,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setText("");
    setSending(true);

    try {
      const response = await api.post("/messages", {
        receiverId: userId,
        text: trimmedText,
      });

      if (response.data.success) {
        // Swap optimistic message with final backend message
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? response.data.message : msg))
        );
        fetchConversations();
      }
    } catch {
      // Remove optimistic message on fail
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      addToast("Failed to send message. Please retry.", "error");
    } finally {
      setSending(false);
    }
  };

  const isOwnMessage = (message) => {
    return message.sender === user?._id || message.sender === user?.id;
  };

  // Locate active participant from conversation list or active URL params
  const activeConversation = conversations.find((c) => c._id === userId);
  const activeParticipant = activeConversation?.participant;

  return (
    <div className="flex flex-col h-screen bg-[#eef4ff]">
      <TopNavbar />

      <div className="flex-1 flex overflow-hidden mx-auto w-full max-w-[1400px] px-0 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        
        {/* Conversations Pane (Left) */}
        <div
          className={`${
            userId ? "hidden md:flex" : "flex"
          } flex-col w-full md:w-[350px] lg:w-[400px] bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm`}
        >
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="mt-1 text-sm text-slate-500">Inbox for your collaborations</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingConversations ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-slate-200 rounded" />
                      <div className="h-3 w-3/4 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="text-3xl mb-3">💬</div>
                <p className="font-semibold text-slate-700">No messages yet</p>
                <p className="mt-1 text-xs text-slate-400 max-w-[200px]">Connect with other students in Dashboard to start swapping skills!</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv._id === userId;
                return (
                  <div
                    key={conv._id}
                    onClick={() => navigate(`/chat/${conv._id}`)}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition duration-200 ${
                      isActive ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {conv.participant.profilePic ? (
                      <img
                        src={conv.participant.profilePic}
                        alt={conv.participant.name}
                        className="h-12 w-12 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-lg font-bold text-white shadow-sm">
                        {conv.participant.name ? conv.participant.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{conv.participant.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Pane (Right) */}
        <div
          className={`${
            userId ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm`}
        >
          {userId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="md:hidden p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    ← Back
                  </button>

                  {activeParticipant?.profilePic ? (
                    <img
                      src={activeParticipant.profilePic}
                      alt={activeParticipant.name}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-base sm:text-lg font-bold text-white">
                      {activeParticipant?.name ? activeParticipant.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      {activeParticipant?.name || "SkillSwap Collaborator"}
                    </h2>
                    <span className="text-xs text-slate-400 font-semibold">Active Session</span>
                  </div>
                </div>

                {activeParticipant && (
                  <button
                    type="button"
                    onClick={() => navigate(`/users/${activeParticipant._id}`)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    View Profile
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fafcff]">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2 animate-pulse">
                    <div className="h-8 w-40 bg-slate-200 rounded-full" />
                    <p className="font-semibold">Loading conversation history...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
                    <p className="font-semibold">{error}</p>
                    <button
                      type="button"
                      onClick={fetchConversation}
                      className="mt-3 text-xs font-bold underline text-red-950 cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                    <div className="text-3xl mb-3">💬</div>
                    <p className="font-bold text-slate-700 text-lg">Send the first message</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm">
                      Swapping skills starts with a friendly conversation. Ask about their projects or coordinate!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const own = isOwnMessage(message);
                    return (
                      <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-[24px] px-5 py-3.5 shadow-sm transition ${
                            own
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white border border-slate-100 text-slate-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>
                          <div className={`mt-2 text-[9px] text-right font-medium ${own ? "text-blue-200" : "text-slate-400"}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {message.pending && <span className="ml-1 text-[8px] animate-pulse">(Sending...)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="text-lg">➔</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fafcff]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-3xl shadow-sm mb-4">
                💬
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Inbox</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-sm">
                Select a developer from the conversation list on the left to start coordinating your SkillSwap!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Chat;
