import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  LogOut,
  Plus,
  Eye,
  FileText,
  Send,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuthStore, useNotificationStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

type TabType = "overview" | "bills" | "claims";

interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  status: string;
  billDate: string;
  createdAt: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  totalAmount: number;
  status: string;
  billId: string;
  submittedAt: string;
}

interface ClaimEvent {
  id: string;
  claimId: string;
  eventType: string;
  timestamp: string;
  details: any;
}

interface Organization {
  _id: string;
  name: string;
  type: string;
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimEvents, setClaimEvents] = useState<Map<string, ClaimEvent[]>>(new Map());
  const [patients, setPatients] = useState<any[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<Organization[]>([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBillForModal, setSelectedBillForModal] = useState<Bill | null>(null);
  const [claimsFilter, setClaimsFilter] = useState<"all" | "submitted" | "approved" | "rejected">("all");
  const [searchBills, setSearchBills] = useState("");
  const [searchClaims, setSearchClaims] = useState("");
  const [billFormData, setBillFormData] = useState({
    title: "",
    category: "consultation",
    amount: "",
    description: "",
    billDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = useAuthStore.getState().token;
        if (!token) return;
        
        // Fetch hospital bills
        const billsRes = await fetch(
          API_ENDPOINTS.BILLS_HOSPITAL,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (billsRes?.ok) {
          const billsData = await billsRes.json();
          setBills(billsData);
        }

        // Fetch hospital claims (claims related to this hospital's bills)
        const claimsRes = await fetch(
          API_ENDPOINTS.CLAIMS_HOSPITAL,
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

        // Fetch insurance companies
        const insuranceRes = await fetch(
          API_ENDPOINTS.ORGANIZATIONS,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (insuranceRes?.ok) {
          const insuranceData = await insuranceRes.json();
          // Backend returns { organizations: [...], count: ... }
          const orgsArray = Array.isArray(insuranceData) ? insuranceData : (insuranceData.organizations || []);
          const filtered = orgsArray.filter((org: any) => org.type === "insurance");
          setInsuranceCompanies(filtered);
        }

        // Fetch patients
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

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !billFormData.title ||
      !billFormData.amount ||
      !billFormData.category
    ) {
      addNotification("Please fill in all required fields", "error");
      return;
    }

    if (!user?.orgId) {
      addNotification("Hospital organization not found. Please contact support.", "error");
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }
      const response = await fetch(API_ENDPOINTS.BILLS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...billFormData,
          amount: parseFloat(billFormData.amount),
          hospitalOrgId: user?.orgId,
        }),
      });

      if (response.ok) {
        const newBill = await response.json();
        setBills([newBill, ...bills]);
        setBillFormData({
          title: "",
          category: "consultation",
          amount: "",
          description: "",
          billDate: new Date().toISOString().split("T")[0],
        });
        setShowBillForm(false);
        addNotification("Bill created successfully", "success");
      } else {
        throw new Error("Failed to create bill");
      }
    } catch (error) {
      console.error("Create bill error:", error);
      addNotification("Failed to create bill", "error");
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBill || !selectedInsurance) {
      addNotification("Please select both bill and insurance company", "error");
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }
      const response = await fetch(API_ENDPOINTS.CLAIMS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billId: selectedBill.id,
          insuranceOrgId: selectedInsurance,
        }),
      });

      if (response.ok) {
        const newClaim = await response.json();
        setClaims([newClaim, ...claims]);
        setShowClaimForm(false);
        setSelectedBill(null);
        setSelectedInsurance("");
        addNotification("Claim created successfully", "success");
      } else {
        throw new Error("Failed to create claim");
      }
    } catch (error) {
      console.error("Create claim error:", error);
      addNotification("Failed to create claim", "error");
    }
  };

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimModal(true);
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBillForModal(bill);
    setShowBillModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    {
      label: "Total Bills",
      value: bills.length.toString(),
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Claims",
      value: claims.filter((c) => c.status === "submitted").length.toString(),
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Approved Claims",
      value: claims.filter((c) => c.status === "approved").length.toString(),
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Rejected Claims",
      value: claims.filter((c) => c.status === "rejected").length.toString(),
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
            <h1 className="text-2xl font-bold text-gray-900">Hospital Admin</h1>
            <p className="text-sm text-gray-600">Medical Bills & Claims</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
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
            {(["overview", "bills", "claims"] as TabType[]).map((tab) => (
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
                      if (stat.label === "Total Bills") setActiveTab("bills");
                      else setActiveTab("claims");
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

              {/* Patients Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Registered Patients
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Patient Name
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
                            No registered patients yet
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
                          <tr
                            key={patient._id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-gray-900">
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

          {/* Bills Tab */}
          {activeTab === "bills" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bills Management</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchBills}
                    onChange={(e) => setSearchBills(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setShowBillForm(!showBillForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                  >
                    <Plus size={18} />
                    <span className="font-medium">Create Bill</span>
                  </button>
                </div>
              </div>

              {/* Bill Creation Form */}
              {showBillForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Create New Bill
                  </h3>
                  <form onSubmit={handleCreateBill} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bill Title *
                        </label>
                        <input
                          type="text"
                          value={billFormData.title}
                          onChange={(e) =>
                            setBillFormData({
                              ...billFormData,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g., Consultation Fee"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={billFormData.amount}
                          onChange={(e) =>
                            setBillFormData({
                              ...billFormData,
                              amount: e.target.value,
                            })
                          }
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={billFormData.category}
                          onChange={(e) =>
                            setBillFormData({
                              ...billFormData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="consultation">Consultation</option>
                          <option value="surgery">Surgery</option>
                          <option value="medication">Medication</option>
                          <option value="tests">Tests</option>
                          <option value="imaging">Imaging</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bill Date *
                        </label>
                        <input
                          type="date"
                          value={billFormData.billDate}
                          onChange={(e) =>
                            setBillFormData({
                              ...billFormData,
                              billDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={billFormData.description}
                          onChange={(e) =>
                            setBillFormData({
                              ...billFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Add bill details..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                      >
                        Create Bill
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBillForm(false)}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bills List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Bill Title
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                            Loading bills...
                          </td>
                        </tr>
                      ) : bills
                        .filter(b => !searchBills || b.title.toLowerCase().includes(searchBills.toLowerCase()) || b.category.toLowerCase().includes(searchBills.toLowerCase()))
                        .length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                            No bills match the search
                          </td>
                        </tr>
                      ) : (
                        bills
                          .filter(b => !searchBills || b.title.toLowerCase().includes(searchBills.toLowerCase()) || b.category.toLowerCase().includes(searchBills.toLowerCase()))
                          .map((bill) => (
                          <tr
                            key={bill.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {bill.title}
                            </td>
                            <td className="py-3 px-4 text-gray-600 capitalize">
                              {bill.category}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              ₹{bill.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(bill.billDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  bill.status === "submitted"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : bill.status === "verified"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {bill.status.charAt(0).toUpperCase() +
                                  bill.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewBill(bill)}
                                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium text-sm"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setShowClaimForm(true);
                                  }}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                  <Send size={16} />
                                  Claim
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create Claim Modal */}
              {showClaimForm && selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Create Claim
                      </h3>
                      <button
                        onClick={() => {
                          setShowClaimForm(false);
                          setSelectedBill(null);
                          setSelectedInsurance("");
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Bill</p>
                        <p className="font-bold text-gray-900">
                          {selectedBill.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{selectedBill.amount.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Company *
                        </label>
                        <select
                          value={selectedInsurance}
                          onChange={(e) => setSelectedInsurance(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select Insurance Company --</option>
                          {insuranceCompanies.map((insurance) => (
                            <option key={insurance._id} value={insurance._id}>
                              {insurance.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateClaim}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                      >
                        <Send size={18} />
                        Create Claim
                      </button>
                      <button
                        onClick={() => {
                          setShowClaimForm(false);
                          setSelectedBill(null);
                          setSelectedInsurance("");
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === "claims" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Claims Management
              </h2>

              {/* Claims Filter */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchClaims}
                    onChange={(e) => setSearchClaims(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[200px]"
                  />
                  <button onClick={() => setClaimsFilter("all")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${claimsFilter === "all" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                    All ({claims.length})
                  </button>
                  <button onClick={() => setClaimsFilter("submitted")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${claimsFilter === "submitted" ? "bg-yellow-600 text-white" : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"}`}>
                    Pending ({claims.filter((c) => c.status === "submitted").length})
                  </button>
                  <button onClick={() => setClaimsFilter("approved")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${claimsFilter === "approved" ? "bg-green-600 text-white" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    Approved ({claims.filter((c) => c.status === "approved").length})
                  </button>
                  <button onClick={() => setClaimsFilter("rejected")} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${claimsFilter === "rejected" ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                    Rejected ({claims.filter((c) => c.status === "rejected").length})
                  </button>
                </div>
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
                          Status
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
                          <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                            Loading claims...
                          </td>
                        </tr>
                      ) : claims
                        .filter(c => claimsFilter === "all" || c.status === claimsFilter)
                        .filter(c => !searchClaims || c.claimNumber.toLowerCase().includes(searchClaims.toLowerCase()))
                        .length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                            No claims match the filter
                          </td>
                        </tr>
                      ) : (
                        claims
                          .filter(c => claimsFilter === "all" || c.status === claimsFilter)
                          .filter(c => !searchClaims || c.claimNumber.toLowerCase().includes(searchClaims.toLowerCase()))
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
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  claim.status === "submitted"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : claim.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {claim.status.charAt(0).toUpperCase() +
                                  claim.status.slice(1)}
                              </span>
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
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Claim Details Modal */}
              {showClaimModal && selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        Claim #{selectedClaim.claimNumber}
                      </h3>
                      <button
                        onClick={() => setShowClaimModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Claim Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Claim Amount</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{selectedClaim.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                              selectedClaim.status === "submitted"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedClaim.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(selectedClaim.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bill ID</p>
                          <p className="text-lg font-semibold text-gray-900 font-mono">
                            {selectedClaim.billId.substring(0, 8)}...
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Claim Timeline</h4>
                        
                        {claimEvents.get(selectedClaim.id)?.length === 0 ? (
                          <p className="text-gray-500">No events recorded yet</p>
                        ) : (
                          <div className="space-y-4">
                            {claimEvents.get(selectedClaim.id)?.map((event, idx) => {
                              const eventIcons: Record<string, any> = {
                                submitted: <Clock size={20} className="text-yellow-600" />,
                                verified: <CheckCircle size={20} className="text-blue-600" />,
                                approved: <CheckCircle size={20} className="text-green-600" />,
                                rejected: <AlertCircle size={20} className="text-red-600" />,
                              };

                              return (
                                <div key={event.id} className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                      {eventIcons[event.eventType] || <Clock size={20} />}
                                    </div>
                                    {idx < (claimEvents.get(selectedClaim.id)?.length || 0) - 1 && (
                                      <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                                    )}
                                  </div>
                                  <div className="flex-1 pt-2">
                                    <p className="font-semibold text-gray-900 capitalize">
                                      {event.eventType}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                    {event.details && (
                                      <p className="text-sm text-gray-700 mt-1">
                                        {event.details.rejectionReason || event.details.note || ""}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Claim Details Modal */}
      {showClaimModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Claim Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{selectedClaim.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                      selectedClaim.status === "submitted"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedClaim.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
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
            </div>

            {/* Timeline */}
            <div className="p-6">
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
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {showBillModal && selectedBillForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bill Details</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedBillForModal.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedBillForModal(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Bill Info */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedBillForModal.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    selectedBillForModal.status === "submitted"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedBillForModal.status === "verified"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {selectedBillForModal.status.charAt(0).toUpperCase() + selectedBillForModal.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-gray-900 capitalize">{selectedBillForModal.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bill Date</p>
                  <p className="text-gray-900">{new Date(selectedBillForModal.billDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="text-gray-900">{new Date(selectedBillForModal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedBillForModal(null);
                  setSelectedBill(selectedBillForModal);
                  setShowClaimForm(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
              >
                <Send size={18} />
                Create Claim
              </button>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedBillForModal(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
