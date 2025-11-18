import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Key,
  UserX,
  Mail,
  Download,
  Users,
  UserCheck,
  Shield,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { AddUserModal } from "./AddUserModal";
import { ViewUserModal } from "./ViewUserModal";
import { EditUserModal } from "./EditUserModal";
import { InviteUserModal } from "./InviteUserModal";
import { ExportModal } from "./ExportModal";
import { useToastContext } from "../../contexts/ToastContext";
import userService from "../../services/userService";
import roleService from "../../services/roleService";
import departmentService from "../../services/departmentService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

export const UsersPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Date Joined");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const toast = useToastContext();
  const [totalUsersPaged, setTotalUsersPaged] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalUsersPaged });

  // Load users from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: any = {};
      if (roleFilter !== "All Roles") {
        filterParams.role = roleFilter.toLowerCase();
      }
      if (statusFilter !== "All Status") {
        filterParams.status = statusFilter.toLowerCase();
      }
      if (departmentFilter !== "All Departments") {
        filterParams.department = departmentFilter;
      }
      if (searchTerm) {
        filterParams.search = searchTerm;
      }

      const [userRes, roleRes, departmentRes] = await Promise.all([
        userService.getAllUsers({ ...filterParams, limit: 100 }),
        roleService.getAllRoles(),
        departmentService.getAllDepartments(),
      ]);

      // Create a map of department IDs to names for quick lookup
      const departmentMap = new Map(
        (departmentRes.departments || []).map((dept: any) => [
          dept.id?.toString(),
          dept.name,
        ])
      );

      const mappedUsers = userRes.users.map((user: any) => {
        // Get department name from ID, or use the department value if it's already a name
        const departmentId = user.department?.toString();
        const departmentName =
          departmentMap.get(departmentId) || user.department || "General";

        return {
          id: user.id,
          name: user.full_name || user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Agent",
          department: departmentName,
          departmentId: departmentId, // Keep ID for editing
          status: user.status
            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
            : "Active",
          lastLogin: user.last_login || null,
          joinDate: user.created_at,
          avatar: user.avatar_url || null,
          permissions: [], // Can be enhanced later
          tasksCompleted: 0, // Can be calculated from stats later
          avgResponseTime: "0h", // Can be calculated from stats later
          casesClosed: 0, // Can be calculated from stats later
          satisfactionRate: 0, // Can be calculated from stats later
        };
      });
      setUsers(mappedUsers);
      setRoles(roleRes.roles || []);
      setDepartments(departmentRes.departments || []);
    } catch (err: any) {
      console.error("Failed to load users data", err);
      setError("Failed to load users data");
      toast.error(
        "Error",
        err.response?.data?.message || "Failed to load users data"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, departmentFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
      case "sales":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "operations":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "finance":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "reservation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getLastLoginStatus = (lastLogin: string) => {
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1)
      return {
        text: "Online Now",
        color: "text-green-600 dark:text-green-400",
      };
    if (diffHours < 24)
      return {
        text: `${Math.floor(diffHours)} hours ago`,
        color: "text-blue-600 dark:text-blue-400",
      };
    const diffDays = Math.floor(diffHours / 24);
    return {
      text: `${diffDays} days ago`,
      color: "text-gray-600 dark:text-gray-400",
    };
  };

  const handleAddUser = async (userData: any) => {
    if (!canPerformAction("users", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create users."
      );
      return;
    }

    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

      await userService.createUser({
        email: userData.email,
        password: tempPassword,
        full_name: userData.name || userData.full_name,
        phone: userData.phone,
        role: (userData.role || "customer").toLowerCase(),
        department: userData.department,
      });

      await loadData();
      toast.success(
        "User Added",
        "New user has been created successfully. Temporary password has been generated."
      );
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        "Failed to create user",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleUpdateUser = async (updatedUser: any) => {
    if (!canPerformAction("users", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to update users."
      );
      return;
    }

    try {
      await userService.updateUser(updatedUser.id, {
        full_name: updatedUser.name || updatedUser.full_name,
        phone: updatedUser.phone,
        role: updatedUser.role ? updatedUser.role.toLowerCase() : undefined,
        department: updatedUser.department,
        status: (updatedUser.status || "active").toLowerCase(),
      });

      await loadData();
      toast.success(
        "User Updated",
        "User information has been updated successfully."
      );
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(
        "Failed to update user",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleToggleStatus = async (userId: string) => {
    if (!canPerformAction("users", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to modify user status."
      );
      return;
    }

    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user?.status === "Active" ? "inactive" : "active";

      await userService.updateUserStatus(
        userId,
        newStatus as "active" | "inactive"
      );
      await loadData();
      toast.success("Status Updated", `User has been ${newStatus}.`);
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(
        "Failed to update status",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleResetPassword = (userId: string) => {
    toast.info(
      "Password Reset",
      "Password reset email has been sent to the user."
    );
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      user.department === departmentFilter;
    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Reset pagination when filters/search change
  useEffect(() => {
    resetPage();
  }, [searchTerm, roleFilter, departmentFilter, statusFilter, resetPage]);

  useEffect(() => {
    setTotalUsersPaged(filteredUsers.length);
  }, [filteredUsers.length]);

  const visibleUsers =
    filteredUsers.length === totalUsersPaged
      ? filteredUsers.slice(offset, offset + perPage)
      : filteredUsers;

  // Calculate metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const onlineNow = users.filter((u) => {
    if (!u.lastLogin) return false;
    const diffHours =
      (new Date().getTime() - new Date(u.lastLogin).getTime()) /
      (1000 * 60 * 60);
    return diffHours < 1;
  }).length;
  const totalRoles = [...new Set(users.map((u) => u.role))].length;
  // Pending invites feature not implemented - set to 0
  const pendingInvites = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management & Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <ActionGuard module="users" action="create">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </ActionGuard>
          <RoleGuard module="users" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </RoleGuard>
          <ActionGuard module="users" action="create">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  +2 this month
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUsers}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Online now: {onlineNow}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Roles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalRoles}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Admin, Manager, Sales...
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Invites
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingInvites}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Awaiting response
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Login
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Now
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Sarah Johnson
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </Select>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option>All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </Select>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Date Joined</option>
              <option>Last Login</option>
              <option>Recently Added</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading users...
              </p>
            </div>
          )}
          {error && (
            <div className="p-6 text-center">
              <UserX className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {visibleUsers.map((user) => {
                    const loginStatus = user.lastLogin
                      ? getLastLoginStatus(user.lastLogin)
                      : { text: "Never", color: "text-gray-400" };

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <span className={loginStatus.color}>
                              {loginStatus.text}
                            </span>
                          </div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(user.lastLogin)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <ActionGuard module="users" action="update">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            <ActionGuard module="users" action="update">
                              <button
                                onClick={() => handleResetPassword(user.id)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                title="Reset Password"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            <ActionGuard module="users" action="update">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (
                                    window.confirm(
                                      `Are you sure you want to ${
                                        user.status === "Active"
                                          ? "disable"
                                          : "enable"
                                      } this user?`
                                    )
                                  ) {
                                    handleToggleStatus(user.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title={
                                  user.status === "Active"
                                    ? "Disable User"
                                    : "Enable User"
                                }
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                page={page}
                pageCount={pageCount}
                perPage={perPage}
                total={totalUsersPaged}
                onPageChange={(p) => setPage(p)}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ActionGuard module="users" action="create">
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      </ActionGuard>

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      <ActionGuard module="users" action="update">
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateUser}
          user={selectedUser}
        />
      </ActionGuard>

      <ActionGuard module="users" action="create">
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </ActionGuard>

      <RoleGuard module="users" action="view">
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          users={filteredUsers}
        />
      </RoleGuard>
    </div>
  );
};
