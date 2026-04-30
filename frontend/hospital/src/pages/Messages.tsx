import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Search, ArrowLeft, Loader2, Building2, Shield, Plus } from "lucide-react";
import { useNotificationStore, useAuthStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  otherPartyName?: string;
  otherPartyType?: string;
}

interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface InsuranceOrg {
  id: string;
  _id?: string;
  name: string;
}

export default function HospitalMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [insurers, setInsurers] = useState<InsuranceOrg[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotificationStore();
  const { token, user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    fetchConversations();
    fetchInsurers();
  }, []);

  useEffect(() => {
    if (selectedConversation) fetchMessages(selectedConversation.id);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.MESSAGES_CONVERSATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsurers = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ORGANIZATIONS_INSURANCE, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        const orgs = Array.isArray(data) ? data : (data.organizations || []);
        setInsurers(orgs.map((o: any) => ({ id: o._id || o.id, name: o.name })));
      }
    } catch (e) {
      console.error("Failed to fetch insurers", e);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.MESSAGES}/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const otherUserId = selectedConversation.participantIds.find((id) => id !== userId);
      const res = await fetch(API_ENDPOINTS.MESSAGES, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: otherUserId, text: messageInput }),
      }).catch(() => null);

      if (res?.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setMessageInput("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id ? { ...c, lastMessage: messageInput } : c
          )
        );
      } else {
        addNotification("Failed to send message", "error");
      }
    } catch (e) {
      console.error("Failed to send message", e);
      addNotification("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const startConversation = async (withUserId: string, name: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.MESSAGES_START, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ withUserId }),
      }).catch(() => null);

      if (res?.ok) {
        const conv = await res.json();
        const enriched = { ...conv, otherPartyName: name };
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === conv.id);
          return existing ? prev : [enriched, ...prev];
        });
        setSelectedConversation(enriched);
        setShowNewChat(false);
      }
    } catch (e) {
      console.error("Failed to start conversation", e);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    !searchQuery || c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat view
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSelectedConversation(null)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {selectedConversation.otherPartyName || "Insurance Company"}
            </h3>
            <p className="text-xs text-green-500 font-medium">Active</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={40} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send the first message!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.fromUserId === userId ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.fromUserId === userId
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.fromUserId === userId ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // New chat modal
  if (showNewChat) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowNewChat(false)}
            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">Select an insurance company to message:</p>
        <div className="space-y-3">
          {insurers.map((ins) => (
            <button
              key={ins.id}
              onClick={() => startConversation(ins.id, ins.name)}
              className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{ins.name}</p>
                <p className="text-xs text-gray-500">Insurance Company</p>
              </div>
            </button>
          ))}
          {insurers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shield size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">No insurance companies found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Communicate with insurance companies</p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <MessageSquare size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-700 mb-1">No conversations yet</p>
          <p className="text-sm text-gray-400 mb-5">Start a chat with an insurance company to coordinate claims.</p>
          <button
            onClick={() => setShowNewChat(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Start Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Shield size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">
                    {conv.otherPartyName || conv.participantIds.find((id) => id !== userId) || "Insurance"}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage || "No messages yet"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
