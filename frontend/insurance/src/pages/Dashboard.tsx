import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function InsuranceDashboard() {
  const stats = [
    {
      label: "Pending Claims",
      value: "156",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Approved This Month",
      value: "284",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Payouts",
      value: "$2.3M",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Rejection Rate",
      value: "3.2%",
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Claims Management
          </h1>
          <p className="text-gray-600 mt-2">HealthCare Plus Insurance Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
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

        {/* Pending Claims for Review */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Claims Pending Review
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Claim #
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Hospital
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Submitted
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
                {[
                  {
                    claimNo: "CLM-001",
                    hospital: "City Medical Center",
                    amount: "$1,500",
                    submitted: "2 hours ago",
                    status: "Verification",
                  },
                  {
                    claimNo: "CLM-002",
                    hospital: "St. Hospital",
                    amount: "$2,000",
                    submitted: "5 hours ago",
                    status: "Processing",
                  },
                  {
                    claimNo: "CLM-003",
                    hospital: "City Medical Center",
                    amount: "$450",
                    submitted: "1 day ago",
                    status: "Verification",
                  },
                ].map((claim, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {claim.claimNo}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {claim.hospital}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {claim.amount}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {claim.submitted}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Processing Time
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average review time:</span>
                <span className="font-semibold text-gray-900">4.2 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This month (avg):</span>
                <span className="font-semibold text-gray-900">3.8 hours</span>
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
                <span className="font-semibold text-green-600">96.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejection Rate:</span>
                <span className="font-semibold text-red-600">3.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "96.8%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
