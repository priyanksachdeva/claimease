import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
  X,
  Download,
} from "lucide-react";
import { useAuthStore, useNotificationStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

type TabType = "overview" | "pending" | "reports";

interface Claim {
  id: string;
  claimNumber: string;
  totalAmount: number;
  status: string;
  billId: string;
  submittedAt: string;
  userId?: string;
  hospitalOrgId?: string;
  rejectionReason?: string;
  approvedAmount?: number;
}

interface ClaimEvent {
  id: string;
  claimId: string;
  eventType: string;
  timestamp: string;
  details: any;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  policyNumber?: string;
}

export default function InsuranceDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimEvents, setClaimEvents] = useState<Map<string, ClaimEvent[]>>(new Map());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [searchPending, setSearchPending] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = useAuthStore.getState().token;
        if (!token) {
          addNotification("Session expired. Please log in again.", "error");
          return;
        }

        // Fetch insurance claims
        const claimsRes = await fetch(
          API_ENDPOINTS.CLAIMS_INSURANCE,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (claimsRes?.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData);

          // Fetch events for each claim in parallel using Promise.all
          try {
            const eventPromises = claimsData.map((claim: Claim) =>
              fetch(
                `${API_ENDPOINTS.CLAIMS}/${claim.id}/events`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
            );

            const allEvents = await Promise.all(eventPromises);
            const eventsMap = new Map<string, ClaimEvent[]>();
            claimsData.forEach((claim: Claim, index: number) => {
              eventsMap.set(claim.id, allEvents[index] || []);
            });
            setClaimEvents(eventsMap);
          } catch (e) {
            console.error("Failed to fetch claim events", e);
          }
        }

        // Fetch policyholders
        const patientsRes = await fetch(
          `${API_ENDPOINTS.AUTH}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (patientsRes?.ok) {
          const allUsers = await patientsRes.json();
          const patientsList = allUsers
            .filter((u: any) => u.role === "patient")
            .slice(0, 10);
          setPatients(patientsList);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        addNotification("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  const handleApproveClaim = async (claimId: string) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }
      const response = await fetch(
        API_ENDPOINTS.CLAIMS_APPROVE(claimId),
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setClaims(
          claims.map((claim) =>
            claim.id === claimId ? { ...claim, status: "approved" } : claim
          )
        );
        setSelectedClaim(null);
        addNotification("Claim approved successfully", "success");
      } else {
        throw new Error("Failed to approve claim");
      }
    } catch (error) {
      console.error("Approve claim error:", error);
      addNotification("Failed to approve claim", "error");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!rejectionReason.trim()) {
      addNotification("Please provide a rejection reason", "error");
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }
      const response = await fetch(
        API_ENDPOINTS.CLAIMS_REJECT(claimId),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      if (response.ok) {
        setClaims(
          claims.map((claim) =>
            claim.id === claimId ? { ...claim, status: "rejected", rejectionReason } : claim
          )
        );
        setSelectedClaim(null);
        setShowClaimModal(false);
        setRejectionReason("");
        setShowRejectForm(false);
        addNotification("Claim rejected successfully", "success");
      } else {
        throw new Error("Failed to reject claim");
      }
    } catch (error) {
      console.error("Reject claim error:", error);
      addNotification("Failed to reject claim", "error");
    }
  };

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const exportReportsToCSV = () => {
    const headers = ["Claim Number", "Amount", "Status", "Submitted Date", "Hospital"];
    const rows = claims.map((claim) => [
      claim.claimNumber,
      `₹${claim.totalAmount.toFixed(2)}`,
      claim.status,
      new Date(claim.submittedAt).toLocaleDateString(),
      claim.hospitalOrgId || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `insurance-claims-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification("Report exported successfully", "success");
  };

  const pendingClaims = claims.filter((c) => c.status === "submitted");
  const approvedClaims = claims.filter((c) => c.status === "approved");
  const rejectedClaims = claims.filter((c) => c.status === "rejected");
  const totalPayouts = approvedClaims.reduce((sum, c) => sum + c.totalAmount, 0);

  const stats = [
    {
      label: "Pending Claims",
      value: pendingClaims.length.toString(),
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Approved This Month",
      value: approvedClaims.length.toString(),
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Payouts",
      value: `₹${totalPayouts.toFixed(0)}`,
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Rejection Rate",
      value:
        claims.length === 0
          ? "0%"
          : ((rejectedClaims.length / claims.length) * 100).toFixed(1) + "%",
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Admin</h1>
            <p className="text-sm text-gray-600">Claims Management Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
            <a
              href="/messages"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              <span className="text-sm font-medium">Messages</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            {(["overview", "pending", "reports"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition duration-200 capitalize ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                      if (stat.label === "Pending Claims") setActiveTab("pending");
                      else setActiveTab("reports");
                    }}>
                      <div
                        className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                      >
                        <Icon size={24} />
                      </div>
                      <h3 className="text-gray-600 text-sm font-medium">
                        {stat.label}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Registered Policyholders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Registered Policyholders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Policyholder Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : patients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                            No registered policyholders yet
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
                          <tr
                            key={patient.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {patient.email}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pending Claims Tab */}
          {activeTab === "pending" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pending Claims Approval
                </h2>
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={searchPending}
                  onChange={(e) => setSearchPending(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Claims List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Claim #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Submitted Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                            Loading pending claims...
                          </td>
                        </tr>
                      ) : pendingClaims
                          .filter(c => !searchPending || c.claimNumber.toLowerCase().includes(searchPending.toLowerCase()))
                          .length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                            No pending claims match the search
                          </td>
                        </tr>
                      ) : (
                        pendingClaims
                          .filter(c => !searchPending || c.claimNumber.toLowerCase().includes(searchPending.toLowerCase()))
                          .map((claim) => (
                          <tr
                            key={claim.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {claim.claimNumber}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              ₹{claim.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(claim.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleViewClaim(claim)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Eye size={16} />
                                Review
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Claim Detail Modal */}
              {selectedClaim && showClaimModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Claim #{selectedClaim.claimNumber}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowClaimModal(false);
                          setSelectedClaim(null);
                          setShowRejectForm(false);
                          setRejectionReason("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Claim Info */}
                    <div className="p-6 border-b border-gray-200 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Amount</p>
                          <p className="text-2xl font-bold text-gray-900">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                            selectedClaim.status === "submitted"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedClaim.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Submitted Date</p>
                          <p className="text-gray-900">{new Date(selectedClaim.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Bill ID</p>
                          <p className="text-gray-900 font-mono text-sm">{selectedClaim.billId}</p>
                        </div>
                      </div>

                      {selectedClaim.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                          <p className="text-red-800">{selectedClaim.rejectionReason}</p>
                        </div>
                      )}

                      {selectedClaim.approvedAmount && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="text-sm font-medium text-green-900 mb-1">Approved Amount</p>
                          <p className="text-lg font-bold text-green-800">₹{selectedClaim.approvedAmount.toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Claim Timeline</h3>
                      
                      {claimEvents.get(selectedClaim.id) && claimEvents.get(selectedClaim.id)!.length > 0 ? (
                        <div className="space-y-4">
                          {claimEvents.get(selectedClaim.id)!.map((event, idx) => (
                            <div key={event.id} className="flex gap-4">
                              {/* Timeline Line */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                  event.eventType === "submitted" ? "bg-blue-600" :
                                  event.eventType === "approved" ? "bg-green-600" :
                                  event.eventType === "rejected" ? "bg-red-600" :
                                  "bg-gray-600"
                                }`}>
                                  {event.eventType === "submitted" && "↑"}
                                  {event.eventType === "approved" && "✓"}
                                  {event.eventType === "rejected" && "✗"}
                                  {event.eventType === "verified" && "✓"}
                                </div>
                                {idx < claimEvents.get(selectedClaim.id)!.length - 1 && (
                                  <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                                )}
                              </div>

                              {/* Event Content */}
                              <div className="pb-4">
                                <h4 className="font-semibold text-gray-900 capitalize">
                                  {event.eventType}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(event.timestamp).toLocaleString()}
                                </p>
                                {event.details && (
                                  <p className="text-sm text-gray-700 mt-2">{event.details}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No events yet</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {selectedClaim.status === "submitted" && (
                      <div className="p-6 space-y-4">
                        {showRejectForm ? (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rejection Reason *
                            </label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide a detailed reason for rejection..."
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        ) : null}

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveClaim(selectedClaim.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200"
                          >
                            <ThumbsUp size={18} />
                            Approve
                          </button>
                          {showRejectForm ? (
                            <>
                              <button
                                onClick={() => handleRejectClaim(selectedClaim.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200"
                              >
                                <ThumbsDown size={18} />
                                Confirm Rejection
                              </button>
                              <button
                                onClick={() => {
                                  setShowRejectForm(false);
                                  setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowRejectForm(true)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition duration-200"
                            >
                              <ThumbsDown size={18} />
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Claims Reports & Analytics
                </h2>
                <button
                  onClick={exportReportsToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Processing Time
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Average review time:
                      </span>
                      <span className="font-semibold text-gray-900">
                        4.2 hours
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This month (avg):</span>
                      <span className="font-semibold text-gray-900">
                        3.8 hours
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Approval Trends
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Approval Rate:</span>
                      <span className="font-semibold text-green-600">
                        {claims.length === 0
                          ? "0%"
                          : ((approvedClaims.length / claims.length) * 100).toFixed(1) +
                            "%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rejection Rate:</span>
                      <span className="font-semibold text-red-600">
                        {claims.length === 0
                          ? "0%"
                          : ((rejectedClaims.length / claims.length) * 100).toFixed(1) +
                            "%"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${claims.length === 0 ? 0 : (approvedClaims.length / claims.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims Summary */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Claims Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setActiveTab("pending")}>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {pendingClaims.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setActiveTab("reports")}>
                    <p className="text-gray-600 text-sm">Approved</p>
                    <p className="text-3xl font-bold text-green-600">
                      {approvedClaims.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setActiveTab("reports")}>
                    <p className="text-gray-600 text-sm">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">
                      {rejectedClaims.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
