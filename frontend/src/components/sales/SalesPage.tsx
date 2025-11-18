import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Users,
  Send,
  BookOpen,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { ActionGuard } from "../auth/ActionGuard";
import { CreateCaseModal } from "./CreateCaseModal";
import { EditCaseModal } from "./EditCaseModal";
import { ViewCaseModal } from "./ViewCaseModal";
import { NotesModal } from "./NotesModal";
import { ScheduleModal } from "./ScheduleModal";
import { TodaysTasksWidget } from "./TodaysTasksWidget";
import { TodaysTasksModal } from "./TodaysTasksModal";
import { useToastContext } from "../../contexts/ToastContext";
import salesService from "../../services/salesService";
import staffService from "../../services/staffService";
import departmentService from "../../services/departmentService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

export const SalesPage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const [cases, setCases] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  // Pagination state (primary tables default to 10 per page)
  const [totalCases, setTotalCases] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalCases });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isTodaysTasksModalOpen, setIsTodaysTasksModalOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] =
    useState<any>(null);

  // Task state management
  const [tasks, setTasks] = useState<any[]>([]);

  const toast = useToastContext();

  // Load sales cases from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: any = {};
      if (statusFilter !== "All Status") {
        filterParams.status = statusFilter;
      }
      if (searchTerm) {
        filterParams.search = searchTerm;
      }

      const [caseRes, agentRes, departmentRes] = await Promise.all([
        salesService.getAllSalesCases({ ...filterParams, limit: 200 }),
        staffService.getAllStaff(),
        departmentService.getAllDepartments(),
      ]);

      const cases = caseRes.cases || [];
      const mappedCases = cases.map((caseItem: any) => ({
        // ID fields - store both for display and API operations
        id: caseItem.id, // Database ID for API operations
        displayId: caseItem.case_id || caseItem.id, // Display ID for UI
        case_id: caseItem.case_id || caseItem.id, // Keep for compatibility
        // Customer info
        customer_id: caseItem.customer_id,
        customer: caseItem.customer?.name || "Unknown Customer",
        customerEmail: caseItem.customer?.email || "",
        customerPhone: caseItem.customer?.phone || "",
        // Case details
        type: "B2C", // Default, can be enhanced
        status: caseItem.status || "Open",
        quotationStatus: caseItem.status === "Quoted" ? "Sent" : "Draft",
        linkedItems: [],
        departments: [],
        // Case values
        value: caseItem.value || 0,
        probability: caseItem.probability || 0,
        expected_close_date: caseItem.expected_close_date || "",
        // Assignment
        assigned_to: caseItem.assigned_to,
        assignedAgent:
          caseItem.assigned_user?.full_name ||
          caseItem.assigned_to?.name ||
          "Unassigned",
        // Dates & notes
        lastActivity: caseItem.updated_at
          ? formatDate(caseItem.updated_at)
          : "N/A",
        notes: caseItem.description || "",
        description: caseItem.description || "",
        createdAt: caseItem.created_at,
        // Keep original for reference
        _original: caseItem,
      }));
      setCases(mappedCases);
      // Set initial total to fetched count; effect below will sync with filtered length
      setTotalCases(mappedCases.length);
      setAgents(agentRes.staff || []);
      setDepartments(departmentRes.departments || []);
    } catch (err: any) {
      console.error("Failed to load sales data", err);
      setError("Failed to load sales data");
      toast.error(
        "Error",
        err.response?.data?.message || "Failed to load sales data"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Awaiting Reply":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "Quotation Sent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Won":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Lost":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getQuotationStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "Sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleCreateCase = async (caseData: any) => {
    if (!canPerformAction("sales", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create sales cases."
      );
      return;
    }

    try {
      // Ensure required fields are properly typed
      const createData = {
        customer_id: parseInt(caseData.customer_id) || caseData.customer_id,
        title: caseData.title || `Case for ${caseData.customer}`,
        description: caseData.description || caseData.notes || "",
        value: parseFloat(caseData.value) || 0,
        probability: parseInt(caseData.probability) || 50,
        assigned_to: caseData.assigned_to
          ? parseInt(caseData.assigned_to)
          : caseData.assignedAgent
          ? parseInt(caseData.assignedAgent)
          : undefined,
        expected_close_date: caseData.expected_close_date || undefined,
      };

      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(createData).filter(
          ([_, v]) => v !== undefined && v !== null && v !== ""
        )
      );

      await salesService.createSalesCase(cleanData as any);

      await loadData();
      toast.success(
        "Case Created",
        "New sales case has been created successfully."
      );
    } catch (error: any) {
      console.error("Error creating sales case:", error);
      toast.error(
        "Failed to create case",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsViewModalOpen(true);
  };

  const handleNotesCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsNotesModalOpen(true);
  };

  const handleEditCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsEditModalOpen(true);
  };

  const handleUpdateCase = async () => {
    try {
      // Refresh data from API first to get latest data
      await loadData();
      
      // Close modal after data is refreshed
      setIsEditModalOpen(false);
      
      // Update selectedCase if it's still open
      if (selectedCase) {
        const updatedCases = await salesService.getAllSalesCases({});
        const updatedCase = updatedCases.cases.find((c: any) => c.id === selectedCase.id);
        if (updatedCase) {
          // Map the updated case to match our format
          const mappedCase = {
            id: updatedCase.id,
            displayId: updatedCase.case_id || updatedCase.id,
            case_id: updatedCase.case_id || updatedCase.id,
            customer_id: updatedCase.customer_id,
            customer: updatedCase.customer?.name || "Unknown Customer",
            customerEmail: updatedCase.customer?.email || "",
            customerPhone: updatedCase.customer?.phone || "",
            type: updatedCase.case_type || "B2C",
            status: updatedCase.status || "Open",
            quotationStatus: updatedCase.quotation_status || "Draft",
            value: updatedCase.value || 0,
            probability: updatedCase.probability || 0,
            expected_close_date: updatedCase.expected_close_date || "",
            assigned_to: updatedCase.assigned_to,
            assignedAgent: updatedCase.assigned_user?.full_name || "Unassigned",
            lastActivity: updatedCase.updated_at ? formatDate(updatedCase.updated_at) : "N/A",
            notes: updatedCase.description || "",
            description: updatedCase.description || "",
            createdAt: updatedCase.created_at,
            _original: updatedCase,
          };
          setSelectedCase(mappedCase);
        }
      } else {
        // Clear selected case if modal was closed
        setSelectedCase(null);
      }
      
      toast.success("Case Updated", "Sales case has been updated successfully.");
    } catch (error: any) {
      console.error("Error updating case:", error);
      toast.error("Error", error.response?.data?.message || "Failed to update case");
    }
  };

  const handleDeleteCase = async (caseItem: any) => {
    if (!canPerformAction("sales", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete sales cases."
      );
      return;
    }

    const displayId = caseItem.displayId || caseItem.case_id || caseItem.id;

    if (
      !window.confirm(
        `Are you sure you want to delete sales case ${displayId}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Use the database ID for deletion, not the display case_id
      const databaseId = caseItem.id || caseItem._original?.id;

      if (!databaseId) {
        toast.error("Error", "Cannot delete: Case ID not found");
        return;
      }

      // Delete from API using database ID
      await salesService.deleteSalesCase(databaseId);

      // Remove immediately from UI for instant feedback
      setCases((prevCases) => prevCases.filter((c) => c.id !== caseItem.id));

      // Close all modals FIRST to prevent UI showing deleted data
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);
      // Clear selected case
      setSelectedCase(null);

      toast.success(
        "Case Deleted",
        `Sales case ${displayId} has been deleted successfully.`
      );

      // Reload data to ensure sync
      await loadData();
    } catch (error: any) {
      console.error("Error deleting case:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete case. Please try again.";
      toast.error("Failed to Delete Case", errorMessage);

      // Reload data in case of partial failure
      await loadData();
    }
  };

  const handleAddNote = async (note: string) => {
    if (!selectedCase) return;

    try {
      // Get the current description from the database by fetching the latest case data
      let currentDescription = "";
      try {
        const latestCase = await salesService.getSalesCaseById(selectedCase.id);
        currentDescription = latestCase.description || "";
      } catch (fetchError) {
        // If fetch fails, use the cached description
        currentDescription = selectedCase.description || selectedCase.notes || "";
      }

      // Format: timestamp: note content
      const timestamp = new Date().toLocaleString();
      const updatedDescription = currentDescription
        ? `${currentDescription}\n\n${timestamp}: ${note}`
        : `${timestamp}: ${note}`;

      await salesService.updateSalesCase(selectedCase.id, {
        description: updatedDescription,
      });

      // Reload data to get the updated case
      await loadData();
      
      // Fetch the updated case directly to get latest data
      try {
        const updatedCase = await salesService.getSalesCaseById(selectedCase.id);
        if (updatedCase) {
          // Map the updated case to match our format
          const mappedCase = {
            id: updatedCase.id,
            displayId: updatedCase.case_id || updatedCase.id,
            case_id: updatedCase.case_id || updatedCase.id,
            customer_id: updatedCase.customer_id,
            customer: updatedCase.customer?.name || "Unknown Customer",
            customerEmail: updatedCase.customer?.email || "",
            customerPhone: updatedCase.customer?.phone || "",
            type: updatedCase.case_type || "B2C",
            status: updatedCase.status || "Open",
            quotationStatus: updatedCase.quotation_status || "Draft",
            value: updatedCase.value || 0,
            probability: updatedCase.probability || 0,
            expected_close_date: updatedCase.expected_close_date || "",
            assigned_to: updatedCase.assigned_to,
            assignedAgent: updatedCase.assigned_user?.full_name || "Unassigned",
            lastActivity: updatedCase.updated_at ? formatDate(updatedCase.updated_at) : "N/A",
            notes: updatedCase.description || "",
            description: updatedCase.description || "",
            createdAt: updatedCase.created_at,
            _original: updatedCase,
          };
          setSelectedCase(mappedCase);
        }
      } catch (fetchError) {
        console.warn("Could not fetch updated case, using cached data");
        // Fallback to updating with what we know
        setSelectedCase({
          ...selectedCase,
          description: updatedDescription,
          notes: updatedDescription,
        });
      }

      toast.success(
        "Note Added",
        "Note has been added to the sales case successfully."
      );
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast.error(
        "Failed to add note",
        error.response?.data?.message || error.message
      );
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleScheduleTask = async (taskData: any) => {
    if (!selectedCase) return;

    try {
      // Prepare complete task data
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || `Task for ${selectedCase.customer}`,
        customer: selectedCase.customer,
        customerName: selectedCase.customer,
        caseId: selectedCase.id,
        scheduledAt: taskData.scheduledAt || taskData.dueDate,
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        location: taskData.location || "",
        assignedTo: taskData.assignedTo,
        status: "Pending",
        priority: taskData.priority || "Medium",
        taskType: taskData.taskType || taskData.type || "Follow-up",
        description: taskData.description || "",
        notes: taskData.notes || `Related to sales case: ${selectedCase.id}`,
      };

      // Save task to state
      setTasks((prevTasks) => [...prevTasks, newTask]);

      // Close modal
      setIsScheduleModalOpen(false);

      // Reset selected case and load fresh data
      await loadData();
      setSelectedCase(null);

      toast.success(
        "Task Scheduled",
        `"${newTask.title}" has been created and scheduled successfully.`
      );
    } catch (error: any) {
      console.error("Error scheduling task:", error);
      toast.error(
        "Failed to schedule task",
        error.response?.data?.message || error.message
      );
    }
  };

  // Filter tasks for today
  const loadTodaysTasks = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter((task) => {
      const taskDate = task.dueDate || task.scheduledAt;
      return taskDate === today || task.status === "Overdue";
    });
  }, [tasks]);

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Get task details
  const getTaskDetails = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  // Get today's tasks
  const todaysTasks = loadTodaysTasks();

  // Filter cases
  const filteredCases = cases.filter((caseItem) => {
    // For Customer role, only show their own cases
    if (userRole === "customer") {
      // Filter by customer_id matching current user's ID
      // This should be handled by the backend API, but adding client-side filter as backup
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      return caseItem.customer_id === currentUser.id;
    }

    const matchesSearch =
      caseItem.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.displayId || caseItem.id)
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "All Types" || caseItem.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || caseItem.status === statusFilter;
    const matchesAgent =
      agentFilter === "All Agents" || caseItem.assignedAgent === agentFilter;
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      caseItem.departments.some((dept: any) => dept === departmentFilter);

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesAgent &&
      matchesDepartment
    );
  });

  // Client-side fallback: if client-only filters are active, compute and slice locally
  useEffect(() => {
    // When filters or search change, reset to page 1
    resetPage();
  }, [
    searchTerm,
    typeFilter,
    statusFilter,
    agentFilter,
    departmentFilter,
    resetPage,
  ]);

  useEffect(() => {
    const hasClientOnlyFilters =
      typeFilter !== "All Types" ||
      agentFilter !== "All Agents" ||
      departmentFilter !== "All Departments" ||
      userRole === "customer";
    if (hasClientOnlyFilters) {
      setTotalCases(filteredCases.length);
    }
  }, [
    filteredCases.length,
    typeFilter,
    agentFilter,
    departmentFilter,
    userRole,
  ]);

  const visibleCases = filteredCases.slice(offset, offset + perPage);

  // Calculate comprehensive stats
  const activeLeads = cases.filter(
    (c) =>
      c.status === "New" || c.status === "In Progress" || c.status === "Open"
  ).length;
  const quotationsSent = cases.filter(
    (c) => c.quotationStatus === "Sent" || c.status === "Quoted"
  ).length;
  const bookingsCreated = cases.filter((c) => c.status === "Won").length;
  const awaitingResponse = cases.filter(
    (c) => c.status === "Awaiting Reply" || c.status === "In Progress"
  ).length;
  const lostCases = cases.filter((c) => c.status === "Lost").length;

  // Calculate total values
  const totalCaseValue = cases.reduce((sum, c) => sum + (c.value || 0), 0);
  const avgCaseValue =
    cases.length > 0 ? (totalCaseValue / cases.length).toFixed(2) : 0;
  const totalProbability =
    cases.length > 0
      ? Math.round(
          cases.reduce((sum, c) => sum + (c.probability || 0), 0) / cases.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sales Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage sales cases and track progress
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <ActionGuard module="sales" action="create">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Case
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Stats - full width */}
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeLeads}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Leads
                  </p>
                  <p className="text-xs text-gray-500">
                    Value: ${totalCaseValue.toLocaleString()}
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
                    {quotationsSent}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quotations Sent
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg Value: ${avgCaseValue}
                  </p>
                </div>
                <Send className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bookingsCreated}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bookings Created
                  </p>
                  <p className="text-xs text-green-600">
                    Won Cases: Success Path
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {awaitingResponse}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Awaiting Response
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg Probability: {totalProbability}%
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
                    {lostCases}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lost Cases
                  </p>
                  <p className="text-xs text-red-600">Review & Learn</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content grid: filters+table (left) and tasks (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        <div className="col-span-6 md:col-span-6">
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option>All Types</option>
                    <option>B2C</option>
                    <option>B2B</option>
                  </Select>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Awaiting Reply</option>
                    <option>Quotation Sent</option>
                    <option>Won</option>
                    <option>Lost</option>
                  </Select>
                  <Select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                  >
                    <option>All Agents</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.name}>
                        {agent.name}
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
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cases Table */}
            <Card>
              <CardContent className="p-0">
                {loading && (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading sales cases...
                    </p>
                  </div>
                )}
                {error && (
                  <div className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                {!loading && !error && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Case ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quotation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Linked Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Departments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Last Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {visibleCases.map((caseItem) => (
                          <tr
                            key={caseItem.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {caseItem.displayId ||
                                caseItem.case_id ||
                                caseItem.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {caseItem.customer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {caseItem.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                <div>{caseItem.customerEmail}</div>
                                <div className="text-xs">
                                  {caseItem.customerPhone}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  caseItem.status
                                )}`}
                              >
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuotationStatusColor(
                                  caseItem.quotationStatus
                                )}`}
                              >
                                {caseItem.quotationStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                              <div className="space-y-1">
                                {caseItem.linkedItems.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                                    >
                                      {item}
                                    </div>
                                  )
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {caseItem.departments.join(", ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {caseItem.lastActivity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewCase(caseItem)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="View Case"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <ActionGuard module="sales" action="update">
                                  <button
                                    onClick={() => handleNotesCase(caseItem)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    title="Notes"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </button>
                                </ActionGuard>
                                <ActionGuard module="sales" action="update">
                                  <button
                                    onClick={() => handleEditCase(caseItem)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    title="Edit Case"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </ActionGuard>
                                <ActionGuard module="sales" action="delete">
                                  <button
                                    onClick={() => handleDeleteCase(caseItem)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete Case"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </ActionGuard>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      page={page}
                      pageCount={pageCount}
                      perPage={perPage}
                      total={totalCases}
                      loading={loading}
                      onPageChange={(p) => setPage(p)}
                      compact
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-6 md:col-span-2 lg:col-span-2">
          {/* Today's Tasks Widget - Above table on mobile, sidebar on large screens */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <TodaysTasksWidget
              tasks={todaysTasks}
              onViewAll={() => {
                setSelectedTaskForDetails(null);
                setIsTodaysTasksModalOpen(true);
              }}
              onViewDetails={(task) => {
                setSelectedTaskForDetails(task);
                setIsTodaysTasksModalOpen(true);
              }}
              onStatusChange={updateTaskStatus}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActionGuard module="sales" action="create">
        <CreateCaseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateCase}
        />
      </ActionGuard>

      <ActionGuard module="sales" action="update">
        <EditCaseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateCase}
          caseData={selectedCase}
        />
      </ActionGuard>

      <ViewCaseModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        caseData={selectedCase}
      />

      <ActionGuard module="sales" action="update">
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          onSave={handleAddNote}
          caseData={selectedCase}
        />
      </ActionGuard>

      <ActionGuard module="sales" action="update">
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSave={handleScheduleTask}
          caseData={selectedCase}
        />
      </ActionGuard>

      <TodaysTasksModal
        isOpen={isTodaysTasksModalOpen}
        onClose={() => {
          setIsTodaysTasksModalOpen(false);
          setSelectedTaskForDetails(null);
        }}
        tasks={tasks}
        onTaskUpdate={setTasks}
        onStatusChange={updateTaskStatus}
        onViewCase={(caseId) => {
          const caseItem = cases.find((c) => c.id === caseId);
          if (caseItem) {
            setIsTodaysTasksModalOpen(false);
            setSelectedTaskForDetails(null);
            handleViewCase(caseItem);
          }
        }}
        initialSelectedTask={selectedTaskForDetails}
      />
    </div>
  );
};
