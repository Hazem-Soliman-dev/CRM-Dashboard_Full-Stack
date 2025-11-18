import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  Shield,
  Activity,
  Award,
  MessageSquare,
  FileText,
  Target,
} from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/format";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const mockAssignments = [
  {
    id: "LEAD-456",
    type: "Lead",
    title: "Ahmed Corporation - Dubai Package",
    status: "In Progress",
  },
  {
    id: "BOOK-789",
    type: "Booking",
    title: "Family Trip - Hurghada Resort",
    status: "Confirmed",
  },
  {
    id: "TICKET-123",
    type: "Ticket",
    title: "Payment Issue - Refund Request",
    status: "In Progress",
  },
];

const mockRecentActivity = [
  { action: "Updated lead status", time: "2 hours ago", type: "lead" },
  { action: "Created new booking", time: "4 hours ago", type: "booking" },
  { action: "Resolved support ticket", time: "1 day ago", type: "ticket" },
];

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState("personal");

  if (!isOpen || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
      case "sales":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "sales manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "operations":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "finance":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "reservation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "work", label: "Work Info", icon: Shield },
    { id: "security", label: "Security", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Shield },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "performance", label: "Performance", icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Open Support Ticket</span>
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Assign Task</span>
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        Sarah Elizabeth Johnson
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        March 15, 1990
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nationality
                      </label>
                      <p className="text-gray-900 dark:text-white">Egyptian</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <p className="text-gray-900 dark:text-white">Female</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        123 Tahrir Square, Cairo, Egypt
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Emergency Contact
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        Ahmed Johnson (+20 123 456 700)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Relationship
                      </label>
                      <p className="text-gray-900 dark:text-white">Spouse</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "performance" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {user.tasksCompleted}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Tasks Completed
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {user.avgResponseTime}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Response Time
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                        {user.casesClosed}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Cases Closed
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                        {user.satisfactionRate}/5
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Satisfaction Rate
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Active Assignments (12 items)
                    </h4>
                    <div className="space-y-3">
                      {mockAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {assignment.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {assignment.id}
                            </div>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              assignment.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            }`}
                          >
                            {assignment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      View All Assignments
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Activity
                    </h4>
                    <div className="space-y-3">
                      {mockRecentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {activity.action}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "work" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Work Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employee ID
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user.department}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Join Date
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(user.joinDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Login
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user.lastLogin
                          ? formatDateTime(user.lastLogin)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented similarly */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
