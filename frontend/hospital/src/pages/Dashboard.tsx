import React from "react";
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function HospitalDashboard() {
  const stats = [
    {
      label: "Total Bills",
      value: "1,234",
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Claims",
      value: "42",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Approved Claims",
      value: "198",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Rejected Claims",
      value: "12",
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
            Hospital Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome to City Medical Center</p>
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

        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bills</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    patient: "Aarav Sharma",
                    amount: "$1,500",
                    category: "Lab",
                    date: "Mar 20, 2026",
                    status: "Approved",
                  },
                  {
                    patient: "Priya Singh",
                    amount: "$2,000",
                    category: "Consultation",
                    date: "Mar 22, 2026",
                    status: "Pending",
                  },
                  {
                    patient: "Rahul Kumar",
                    amount: "$450",
                    category: "Medicine",
                    date: "Mar 24, 2026",
                    status: "Action Required",
                  },
                ].map((bill, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">{bill.patient}</td>
                    <td className="py-3 px-4 text-gray-900">{bill.amount}</td>
                    <td className="py-3 px-4 text-gray-600">{bill.category}</td>
                    <td className="py-3 px-4 text-gray-600">{bill.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bill.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pending Actions
          </h2>
          <div className="space-y-3">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Clock
                className="text-blue-600 mr-3 flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <p className="font-medium text-gray-900">
                  5 bills awaiting verification
                </p>
                <p className="text-sm text-gray-600">
                  Please review and submit claims to insurance
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle
                className="text-yellow-600 mr-3 flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <p className="font-medium text-gray-900">2 claims rejected</p>
                <p className="text-sm text-gray-600">
                  Please address insurance company's concerns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
