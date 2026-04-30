import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageSquare, Search, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useNotificationStore, useAuthStore } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotificationStore();
  const { token, user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        API_ENDPOINTS.MESSAGES_CONVERSATIONS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
      addNotification("Failed to load conversations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.MESSAGES}/${selectedConversation.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
      addNotification("Failed to load messages", "error");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const otherUserId = selectedConversation.participantIds.find(
        (id) => id !== userId
      );

      const response = await fetch(
        API_ENDPOINTS.MESSAGES,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            toUserId: otherUserId,
            text: messageInput,
          }),
        }
      ).catch(() => null);

      if (response?.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageInput("");
        addNotification("Message sent!", "success");
      } else {
        addNotification("Failed to send message", "error");
      }
    } catch (error) {
      console.error("Failed to send message", error);
      addNotification("Failed to send message", "error");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F9F9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D8B95] mx-auto mb-4"></div>
          <p className="text-slate-500 text-[14px] font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Chat view when conversation is selected
  if (selectedConversation) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col min-h-screen bg-[#F6F9F9]"
      >
        {/* Chat Header */}
        <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => setSelectedConversation(null)}
            className="w-9 h-9 rounded-full bg-[#F6F9F9] flex items-center justify-center text-[#0B2239] hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#0D8B95] flex items-center justify-center text-white text-[13px] font-bold">
            {(selectedConversation.participantIds.find(id => id !== userId) || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0B2239] text-[15px]">
              {selectedConversation.participantIds.find(id => id !== userId) || "User"}
            </h3>
            <p className="text-[11px] text-emerald-500 font-medium">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-[14px] font-semibold text-slate-500">No messages yet</p>
              <p className="text-[12px] text-slate-400 mt-1">Send the first message!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.fromUserId === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 ${
                    msg.fromUserId === userId
                      ? "bg-[#0D8B95] text-white rounded-[16px] rounded-br-[4px]"
                      : "bg-white text-[#0B2239] rounded-[16px] rounded-bl-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  <p className="text-[14px] leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.fromUserId === userId ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 border-t border-slate-100 shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
          <form onSubmit={sendMessage} className="flex gap-2.5 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-[#F6F9F9] border border-slate-200 rounded-[14px] py-2.5 px-4 text-[14px] text-[#0B2239] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95]"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sendingMessage}
              className="w-10 h-10 bg-[#0D8B95] text-white rounded-[12px] flex items-center justify-center hover:bg-[#0A7A83] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_4px_12px_rgba(13,139,149,0.25)]"
            >
              {sendingMessage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Conversations list
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 pt-10 pb-28 bg-[#F6F9F9] min-h-screen"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Messages</h1>
            <p className="text-[12px] text-slate-500 font-medium">Chat with healthcare providers</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-[#0D8B95] text-white rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(13,139,149,0.25)] hover:bg-[#0A7A83] transition-colors">
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full bg-white border border-slate-200 rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] text-[#0B2239] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-2.5">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-[22px] p-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-16 h-16 bg-[#E6F5F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#0D8B95]" />
            </div>
            <p className="text-[15px] font-bold text-[#0B2239] mb-1.5">No conversations yet</p>
            <p className="text-[12px] text-slate-500 mb-5 max-w-[200px] mx-auto">Start a conversation with your healthcare provider or hospital</p>
            <button className="bg-[#0D8B95] text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold shadow-[0_4px_12px_rgba(13,139,149,0.25)] hover:bg-[#0A7A83] transition-colors">
              Start Chat
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full text-left bg-white p-4 rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/60 hover:border-[#0D8B95]/20 transition-colors flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-full bg-[#0D8B95] flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                {(conv.participantIds.find(id => id !== userId) || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[14px] text-[#0B2239] truncate">
                    {conv.participantIds.find(id => id !== userId) || "User"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 truncate font-medium">
                  {conv.lastMessage || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
