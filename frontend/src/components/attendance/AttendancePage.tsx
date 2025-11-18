import React, { useState, useCallback, useEffect } from "react";
import {
  Download,
  Search,
  Calendar,
  Clock,
  Users,
  UserCheck,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { ExportModal } from "./ExportModal";
import { CalendarViewModal } from "./CalendarViewModal";
import { LeaveRequestModal } from "./LeaveRequestModal";
import { TimeAdjustmentModal } from "./TimeAdjustmentModal";
import { AddReasonModal } from "./AddReasonModal";
import { useToastContext } from "../../contexts/ToastContext";
import attendanceService from "../../services/attendanceService";
import staffService from "../../services/staffService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

// Defining department statistics for display.
const departmentStats = [
  { department: "sales", attendance: 85, color: "bg-blue-500" },
  { department: "operations", attendance: 92, color: "bg-green-500" },
  { department: "finance", attendance: 88, color: "bg-purple-500" },
  { department: "reservation", attendance: 90, color: "bg-orange-500" },
];

export const AttendancePage: React.FC = () => {
  const { userRole } = useAuth();
  const {
    canAccessModule,
    userRole: mappedRole,
    canSelfAttend,
  } = usePermissions();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedRole = (mappedRole || userRole || "").toLowerCase();
  const selfMode =
    !canAccessModule("attendance") &&
    canSelfAttend &&
    normalizedRole !== "customer";
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [dateFilter, setDateFilter] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [total, setTotal] = useState(0);
  const { page, perPage, offset, pageCount, setPage, reset } = usePagination({
    perPage: 10,
    total,
  });

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);
  const [isTimeAdjustmentModalOpen, setIsTimeAdjustmentModalOpen] =
    useState(false);
  const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const toast = useToastContext();

  // Load attendance data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (selfMode) {
        const today = await attendanceService.getTodayAttendance();
        setTodayRecord(today);
        setAttendance([]);
        setStaff([]);
        setLeaveRequests([]);
      } else {
        const [attendanceRes, staffRes, leaveRes] = await Promise.all([
          attendanceService.getAttendance({
            date_from: dateFilter.from,
            date_to: dateFilter.to,
            status: statusFilter !== "All Status" ? statusFilter : undefined,
            staff_id: staffFilter !== "All Staff" ? staffFilter : undefined,
          }),
          staffService.getAllStaff(),
          attendanceService.getLeaveRequests(),
        ]);
        setAttendance(attendanceRes.attendance || []);
        setStaff(staffRes.staff || []);
        setLeaveRequests(leaveRes.requests || []);
      }
    } catch (err: any) {
      console.error("Failed to load attendance data", err);
      setError("Failed to load data. Please try again.");
      toast.error(
        "Error",
        err.response?.data?.message || "Failed to load attendance data"
      );
    } finally {
      setLoading(false);
    }
  }, [dateFilter, searchTerm, statusFilter, staffFilter, toast, selfMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clock in/out handlers
  const handleClockIn = async () => {
    try {
      console.log("Clocking in...");
      await attendanceService.clockIn();
      await loadData();
      toast.success("Clocked In!", "You have successfully clocked in.");
    } catch (error: any) {
      console.error("Error clocking in:", error);
      toast.error(
        "Failed to Clock In",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleClockOut = async () => {
    try {
      console.log("Clocking out...");
      await attendanceService.clockOut();
      await loadData();
      toast.success("Clocked Out!", "You have successfully clocked out.");
    } catch (error: any) {
      console.error("Error clocking out:", error);
      toast.error(
        "Failed to Clock Out",
        error.response?.data?.message || error.message
      );
    }
  };

  // Self-mode minimal UI
  if (selfMode) {
    const isWorking = !!todayRecord && !todayRecord.clock_out;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Attendance (Today)</h1>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString()}{" "}
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-medium">
                  {todayRecord
                    ? todayRecord.status || (isWorking ? "Working" : "On Time")
                    : "Not clocked in"}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  In:{" "}
                  {todayRecord?.clock_in
                    ? new Date(todayRecord.clock_in).toLocaleTimeString()
                    : "-"}{" "}
                  · Out:{" "}
                  {todayRecord?.clock_out
                    ? new Date(todayRecord.clock_out).toLocaleTimeString()
                    : "-"}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleClockIn}
                  disabled={
                    !!todayRecord &&
                    !!todayRecord.clock_in &&
                    !todayRecord.clock_out
                  }
                >
                  <Clock className="mr-2 h-4 w-4" /> Clock In
                </Button>
                <Button
                  onClick={handleClockOut}
                  disabled={!todayRecord || !!todayRecord?.clock_out}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenTimeAdjustment = (employee: any) => {
    setSelectedEmployee(employee);
    setIsTimeAdjustmentModalOpen(true);
  };

  const handleTimeAdjustment = async (adjustmentData: any) => {
    try {
      console.log(
        "Adjusting time for:",
        selectedEmployee?.employee,
        adjustmentData
      );
      // Use user_id or employee_id from selectedEmployee
      const employeeId =
        selectedEmployee?.user_id ||
        selectedEmployee?.employee_id ||
        selectedEmployee?.id;
      await attendanceService.updateAttendance(employeeId, {
        date: adjustmentData.date || dateFilter.from,
        clock_in: adjustmentData.clockIn,
        clock_out: adjustmentData.clockOut,
        notes: adjustmentData.reason || "Time adjustment",
      });
      // Close modal
      setIsTimeAdjustmentModalOpen(false);
      setSelectedEmployee(null);
      // Reload data
      await loadData();
      toast.success(
        "Time Adjusted!",
        "Attendance time has been adjusted successfully."
      );
    } catch (error: any) {
      console.error("Error adjusting time:", error);
      toast.error(
        "Failed to Adjust",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleCreateLeaveRequest = async (leaveData: any) => {
    try {
      console.log("Creating leave request:", leaveData);
      await attendanceService.createLeaveRequest({
        leave_type: leaveData.type,
        start_date: leaveData.startDate,
        end_date: leaveData.endDate,
        reason: leaveData.reason,
      });
      // Close modal
      setIsLeaveRequestModalOpen(false);
      // Reload data
      await loadData();
      toast.success(
        "Leave Request Created!",
        "Your leave request has been submitted successfully."
      );
    } catch (error: any) {
      console.error("Error creating leave request:", error);
      toast.error(
        "Failed to Create",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleApproveLeave = async (requestId: string) => {
    try {
      console.log("Approving leave:", requestId);
      await attendanceService.approveLeaveRequest(requestId);
      await loadData();
      toast.success(
        "Leave Approved!",
        "Leave request has been approved successfully."
      );
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast.error(
        "Failed to Approve",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleDenyLeave = async (requestId: string) => {
    try {
      console.log("Rejecting leave:", requestId);
      await attendanceService.rejectLeaveRequest(
        requestId,
        "Rejected by manager"
      );
      await loadData();
      toast.success(
        "Leave Rejected!",
        "Leave request has been rejected successfully."
      );
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast.error(
        "Failed to Reject",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleAddReason = async (reasonData: any) => {
    try {
      console.log("Adding absence reason:", reasonData);
      // This would update attendance with the reason
      await attendanceService.updateAttendance(reasonData.employeeId, {
        date: reasonData.date || dateFilter.from,
        notes: reasonData.reason,
        status: "Absent",
      });
      // Close modal
      setIsAddReasonModalOpen(false);
      // Reload data
      await loadData();
      toast.success(
        "Reason Added!",
        "Absence reason has been recorded successfully."
      );
    } catch (error: any) {
      console.error("Error adding reason:", error);
      toast.error(
        "Failed to Add",
        error.response?.data?.message || error.message
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Working":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "On Leave":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    // For non-admin users, only show their own attendance
    if (userRole !== "admin") {
      // Filter by user_id matching current user's ID
      // This should be handled by the backend API, but adding client-side filter as backup
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      return (
        record.user_id === currentUser.id || record.user?.id === currentUser.id
      );
    }
    const recordEmployee = record.employee || "";
    const matchesSearch = recordEmployee
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      record.department === departmentFilter;
    const matchesStatus =
      statusFilter === "All Status" || record.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination handling
  useEffect(() => {
    reset();
  }, [
    searchTerm,
    departmentFilter,
    statusFilter,
    staffFilter,
    dateFilter.from,
    dateFilter.to,
    reset,
  ]);
  useEffect(() => {
    setTotal(filteredAttendance.length);
  }, [filteredAttendance.length]);
  const visibleAttendance = filteredAttendance.slice(offset, offset + perPage);

  // Calculate metrics - handle both frontend and backend status values
  const activeToday = attendance.filter(
    (a) =>
      a.status === "On Time" ||
      a.status === "Present" ||
      a.status === "Late" ||
      a.status === "Working" ||
      a.status === "Half Day"
  ).length;
  const onLeave = attendance.filter(
    (a) => a.status === "On Leave" || a.status === "Leave"
  ).length;
  const lateToday = attendance.filter((a) => a.status === "Late").length;
  // Calculate real stats from data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const absencesThisMonth = attendance.filter((record) => {
    const recordDate = new Date(record.date || record.created_at);
    return (
      recordDate.getMonth() === currentMonth &&
      recordDate.getFullYear() === currentYear &&
      (record.status === "Absent" || record.status === "Late")
    );
  }).length;

  const totalOvertimeHours = attendance.reduce((total, record) => {
    const hours = record.total_hours || 0;
    const standardHours = 8; // Assuming 8 hours is standard
    return total + Math.max(0, hours - standardHours);
  }, 0);
  const totalOvertime = `${Math.round(totalOvertimeHours)}h`;

  const upcomingVacations = leaveRequests.filter((request) => {
    const startDate = new Date(request.start_date);
    return (
      startDate > new Date() &&
      (request.status === "Pending" || request.status === "Approved")
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance & Shift Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor team attendance and manage schedules
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Input
            type="date"
            name="from"
            value={dateFilter.from}
            onChange={handleDateChange}
          />
          <Input
            type="date"
            name="to"
            value={dateFilter.to}
            onChange={handleDateChange}
          />
          <Select
            value={viewMode === "table" ? "Today" : "Calendar"}
            onChange={() => {}}
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </Select>
          <ActionGuard module="attendance" action="create">
            <Button
              variant="outline"
              onClick={() => setIsAddReasonModalOpen(true)}
            >
              Add Reason
            </Button>
          </ActionGuard>
          <RoleGuard module="attendance" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeToday}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active Today
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {onLeave}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      On Leave
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {lateToday}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Late Today
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {absencesThisMonth}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Absences This Month
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalOvertime}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Overtime
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {upcomingVacations}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upcoming Vacations
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Calendar View
              </button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option>All Departments</option>
              <option>Sales</option>
              <option>Operations</option>
              <option>Finance</option>
              <option>Reservation</option>
              <option>Support</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>On Time</option>
              <option>Late</option>
              <option>Working</option>
              <option>On Leave</option>
              <option>Absent</option>
            </Select>

            <Select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option>All Staff</option>
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Today's Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10">
                          <p>Loading attendance data...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-10 text-red-500"
                        >
                          <p>{error}</p>
                        </td>
                      </tr>
                    ) : (
                      visibleAttendance.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {(
                                      record.employee ||
                                      record.employee_name ||
                                      ""
                                    )
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {record.employee ||
                                    record.employee_name ||
                                    "Unknown"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {record.department || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {record.shift || "Day"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.checkIn || record.clock_in
                              ? record.checkIn ||
                                (record.clock_in
                                  ? new Date(
                                      record.clock_in
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A")
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.checkOut || record.clock_out
                              ? record.checkOut ||
                                (record.clock_out
                                  ? new Date(
                                      record.clock_out
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A")
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {record.totalHours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenTimeAdjustment(record)}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  perPage={perPage}
                  total={total}
                  onPageChange={(p) => setPage(p)}
                  compact
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Attendance Widget */}
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(currentTime.toISOString())}
                </div>

                <div className="flex w-full gap-2">
                  <Button className="w-full" onClick={handleClockIn}>
                    Check In
                  </Button>
                  <Button className="w-full" onClick={handleClockOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Check-in:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      08:55 AM
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Hours Today:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      5h 37m
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <RoleGuard module="attendance" action="update" hideIfNoAccess>
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals (3 items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests
                    .filter((req) => req.status === "Pending")
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.employee}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.type}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleApproveLeave(request.id)}
                            className="flex-1"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDenyLeave(request.id)}
                            className="flex-1"
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Department Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept: any) => (
                  <div key={dept.department}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {dept.department}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {dept.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dept.color}`}
                        style={{ width: `${dept.attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RoleGuard module="attendance" action="view">
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          attendance={filteredAttendance}
        />
      </RoleGuard>

      <RoleGuard module="attendance" action="view">
        <CalendarViewModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          attendance={attendance}
        />
      </RoleGuard>

      <ActionGuard module="attendance" action="create">
        <LeaveRequestModal
          isOpen={isLeaveRequestModalOpen}
          onClose={() => setIsLeaveRequestModalOpen(false)}
          onSave={handleCreateLeaveRequest}
        />
      </ActionGuard>

      <ActionGuard module="attendance" action="update">
        <TimeAdjustmentModal
          isOpen={isTimeAdjustmentModalOpen}
          onClose={() => setIsTimeAdjustmentModalOpen(false)}
          employee={selectedEmployee}
          onSave={handleTimeAdjustment}
        />
      </ActionGuard>

      <ActionGuard module="attendance" action="create">
        <AddReasonModal
          isOpen={isAddReasonModalOpen}
          onClose={() => setIsAddReasonModalOpen(false)}
          onSave={handleAddReason}
        />
      </ActionGuard>
    </div>
  );
};
