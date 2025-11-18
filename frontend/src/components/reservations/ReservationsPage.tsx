import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Upload,
  Phone,
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { AddReservationModal } from "./AddReservationModal";
import { EditReservationModal } from "./EditReservationModal";
import { ViewReservationModal } from "./ViewReservationModal";
import { NotesModal } from "./NotesModal";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { SupplierResponseTrackerModal } from "./SupplierResponseTrackerModal";
import { TasksModal } from "./TasksModal";
import { AddSupplierModal } from "../categories/AddSupplierModal";
import { useToastContext } from "../../contexts/ToastContext";
import {
  getStatusColor,
  getFinanceStatusColor,
} from "../../utils/statusColors";
import reservationService from "../../services/reservationService";
import taskService from "../../services/taskService";
import staffService from "../../services/staffService";
import supplierService from "../../services/supplierService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

export const ReservationsPage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const [reservations, setReservations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [financeFilter, setFinanceFilter] = useState("All Finance Status");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [activeMetricFilter, setActiveMetricFilter] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSupplierTrackerOpen, setIsSupplierTrackerOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  const toast = useToastContext();
  const [totalReservations, setTotalReservations] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalReservations });

  // Load reservations from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: any = {};
      if (statusFilter !== "All Status") {
        filterParams.status = statusFilter;
      }
      if (dateFromFilter) {
        filterParams.date_from = dateFromFilter;
      }
      if (dateToFilter) {
        filterParams.date_to = dateToFilter;
      }
      if (searchTerm) {
        filterParams.search = searchTerm;
      }

      const [reservationRes, taskRes, staffRes, supplierRes] =
        await Promise.all([
          reservationService.getAllReservations({
            ...filterParams,
            limit: 100,
          }),
          taskService.getTasks({}),
          staffService.getAllStaff(),
          supplierService.getAllSuppliers(),
        ]);

      // Map backend data to frontend format
      const mappedReservations = reservationRes.reservations.map(
        (res: any) => ({
          // Use database id for operations, reservation_id for display
          id: res.id, // Database primary key - required for update/delete operations
          reservation_id: res.reservation_id || res.id, // Display ID for UI
          // Preserve all backend fields needed for editing
          customer_id: res.customer_id,
          supplier_id: res.supplier_id,
          service_type: res.service_type,
          // Display fields
          customer: res.customer?.name || "Unknown Customer",
          customerEmail: res.customer?.email || "",
          customerPhone: res.customer?.phone || "",
          tripItem: `${res.service_type}: ${res.destination}`,
          roomType: res.service_type,
          destination: res.destination,
          departure_date: res.departure_date,
          return_date: res.return_date,
          checkIn: res.departure_date,
          checkOut: res.return_date || res.departure_date,
          totalNights: res.return_date
            ? Math.ceil(
                (new Date(res.return_date).getTime() -
                  new Date(res.departure_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
          adults: res.adults || 0,
          children: res.children || 0,
          infants: res.infants || 0,
          childAges: [],
          rooms: 0,
          mealPlan: "N/A",
          nationality: "N/A",
          supplier: res.supplier?.name || "N/A",
          status: res.status || "Pending",
          financeStatus: res.payment_status || "Pending",
          payment_status: res.payment_status || "Pending",
          assignedAgent: res.created_by_user?.full_name || "N/A",
          created_by: res.created_by,
          specialRequests: res.notes || "",
          notes: res.notes || "",
          createdAt: res.created_at,
          created_at: res.created_at,
          updated_at: res.updated_at,
          dueDate: res.departure_date,
          supplierResponseTime: "Pending",
        })
      );
      setReservations(mappedReservations);
      setTasks(taskRes || []);
      setAgents(staffRes.staff || []);
      setSuppliers(supplierRes || []);
    } catch (err: any) {
      console.error("Failed to load reservations data", err);
      setError("Failed to load reservations data");
      toast.error(
        "Error",
        err.response?.data?.message || "Failed to load reservations data"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFromFilter, dateToFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddReservation = async (reservationData: any) => {
    if (!canPerformAction("reservations", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create reservations."
      );
      return;
    }

    try {
      await reservationService.createReservation({
        customer_id: reservationData.customer_id,
        supplier_id: reservationData.supplier_id,
        service_type: reservationData.service_type || "Other",
        destination: reservationData.destination,
        departure_date:
          reservationData.departure_date || reservationData.checkIn,
        return_date: reservationData.return_date || reservationData.checkOut,
        adults: reservationData.adults || 1,
        children: reservationData.children || 0,
        infants: reservationData.infants || 0,
        total_amount: reservationData.total_amount || 0,
        notes: reservationData.notes || reservationData.specialRequests || "",
      });

      // Close modal and show success
      setIsAddModalOpen(false);

      // Reload data
      await loadData();

      toast.success(
        "Reservation Created",
        "New reservation has been added successfully."
      );
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast.error(
        "Failed to create reservation",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsViewModalOpen(true);
  };

  const handleEditReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleUpdateReservation = async (reservationData: any) => {
    if (!canPerformAction("reservations", "update")) {
      toast.error("Access Denied", "You do not have permission to update.");
      return;
    }

    if (!selectedReservation) {
      toast.error("Error", "No reservation selected for update");
      return;
    }

    try {
      // Ensure proper data types
      // Note: customer_id cannot be updated per backend interface
      const updateData: any = {
        supplier_id: reservationData.supplier_id
          ? parseInt(String(reservationData.supplier_id), 10)
          : undefined,
        service_type: reservationData.service_type,
        destination: reservationData.destination,
        departure_date: reservationData.departure_date,
        return_date: reservationData.return_date || undefined,
        adults: parseInt(String(reservationData.adults), 10),
        children: parseInt(String(reservationData.children || 0), 10),
        infants: parseInt(String(reservationData.infants || 0), 10),
        total_amount: parseFloat(String(reservationData.total_amount || 0)),
        status: reservationData.status,
        notes: reservationData.notes || "",
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("Updating reservation:", selectedReservation.id, updateData);
      await reservationService.updateReservation(
        selectedReservation.id,
        updateData
      );

      // Close modal FIRST
      setIsEditModalOpen(false);
      setSelectedReservation(null);

      // Then reload
      await loadData();

      // Then notify
      toast.success("Updated!", "Reservation updated successfully.");
    } catch (error: any) {
      console.error("Error updating:", error);
      toast.error(
        "Failed to Update",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!canPerformAction("reservations", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete reservations."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this reservation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      console.log("Deleting reservation:", reservationId);
      await reservationService.deleteReservation(reservationId);

      // IMMEDIATELY remove from UI for instant feedback
      const updatedReservations = reservations.filter(
        (r) => r.id !== reservationId
      );
      setReservations(updatedReservations);

      // Close any open modals
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);

      // Clear selected reservation
      setSelectedReservation(null);

      // Success feedback IMMEDIATELY
      toast.success("Deleted!", "Reservation has been removed.");

      // Reload in background to sync
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error: any) {
      console.error("Delete failed:", error);

      // If delete failed, reload to show current state
      await loadData();

      toast.error(
        "Delete Failed",
        error.response?.data?.message || "Could not delete reservation"
      );
    }
  };

  const handleNotesReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsNotesModalOpen(true);
  };

  const handleUploadDocument = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsUploadModalOpen(true);
  };

  const handleConfirmReservation = async (reservationId: string) => {
    if (!canPerformAction("reservations", "update")) {
      toast.error("Access Denied", "You do not have permission to confirm.");
      return;
    }

    try {
      console.log("Confirming reservation:", reservationId);

      // Update status to Confirmed
      await reservationService.updateReservationStatus(
        reservationId,
        "Confirmed"
      );

      // Update payment status to Partial
      await reservationService.updatePaymentStatus(reservationId, "Partial");

      // Reload to show changes
      await loadData();

      toast.success("Confirmed!", "Reservation status updated to Confirmed.");
    } catch (error: any) {
      console.error("Confirm failed:", error);

      // Reload on failure
      await loadData();

      toast.error(
        "Confirm Failed",
        error.response?.data?.message || "Could not confirm reservation"
      );
    }
  };

  const handleSupplierContact = (reservation: any) => {
    toast.info(
      "Supplier Contact",
      `Contacting ${reservation.supplier} for ${reservation.customer}`
    );
  };

  const handleAddNote = async (note: string) => {
    // This handler is kept for backward compatibility but the modal now handles everything
    // The modal will call the API directly, so we just need to reload data
    await loadData();
  };

  const handleDocumentUpload = async (documentData: any) => {
    // This handler is kept for backward compatibility but the modal now handles everything
    // The modal will call the API directly, so we just need to reload data
    await loadData();
  };

  const handleMetricClick = (metricType: string) => {
    setActiveMetricFilter(metricType);
    switch (metricType) {
      case "new":
        setStatusFilter("New");
        break;
      case "pending":
        setStatusFilter("Pending");
        break;
      case "overdue":
        // Filter by overdue reservations (past due date)
        setStatusFilter("All Status");
        break;
      case "ready":
        setStatusFilter("Reserved");
        break;
      case "tasks":
        setIsTasksModalOpen(true);
        break;
      default:
        setStatusFilter("All Status");
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter((reservation) => {
    // For Customer role, only show their own reservations
    if (userRole === "customer") {
      // Filter by customer_id matching current user's ID
      // This should be handled by the backend API, but adding client-side filter as backup
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return reservation.customer_id === currentUser.id;
    }

    const matchesSearch =
      reservation.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.reservation_id || reservation.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || reservation.status === statusFilter;
    const matchesSupplier =
      supplierFilter === "All Suppliers" ||
      reservation.supplier === supplierFilter;
    const matchesAgent =
      agentFilter === "All Agents" || reservation.assignedAgent === agentFilter;
    const matchesFinance =
      financeFilter === "All Finance Status" ||
      reservation.financeStatus === financeFilter;

    let matchesDateRange = true;
    if (dateFromFilter && dateToFilter) {
      const checkInDate = new Date(reservation.checkIn);
      const fromDate = new Date(dateFromFilter);
      const toDate = new Date(dateToFilter);
      matchesDateRange = checkInDate >= fromDate && checkInDate <= toDate;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSupplier &&
      matchesAgent &&
      matchesFinance &&
      matchesDateRange
    );
  });

  // Reset page when filters/search change
  useEffect(() => {
    resetPage();
  }, [
    searchTerm,
    statusFilter,
    supplierFilter,
    agentFilter,
    financeFilter,
    dateFromFilter,
    dateToFilter,
    resetPage,
  ]);

  useEffect(() => {
    setTotalReservations(filteredReservations.length);
  }, [filteredReservations.length]);

  const visibleReservations =
    filteredReservations.length === totalReservations
      ? filteredReservations.slice(offset, offset + perPage)
      : filteredReservations;
  // Calculate metrics
  const newAssignments = reservations.filter((r) => r.status === "New").length;
  const pendingConfirmations = reservations.filter(
    (r) => r.status === "Pending" || r.status === "Awaiting Supplier"
  ).length;
  const overdueReservations = reservations.filter((r) => {
    const dueDate = new Date(r.dueDate);
    const today = new Date();
    return dueDate < today && (r.status === "New" || r.status === "Pending");
  }).length;
  const readyToExecute = reservations.filter(
    (r) => r.status === "Reserved" || r.status === "Confirmed"
  ).length;
  const tasksDueToday = tasks.filter(
    (t) => t.status === "Due Today" || t.status === "Overdue"
  ).length;

  const isOverdue = (reservation: any) => {
    const dueDate = new Date(reservation.dueDate);
    const today = new Date();
    return (
      dueDate < today &&
      (reservation.status === "New" || reservation.status === "Pending")
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reservation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage confirmed bookings and coordinate with suppliers
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <RoleGuard module="reservations" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsSupplierTrackerOpen(true)}
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Supplier Response Tracker</span>
            </Button>
          </RoleGuard>
          <ActionGuard module="suppliers" action="create">
            <Button
              variant="outline"
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Supplier</span>
            </Button>
          </ActionGuard>
          <ActionGuard module="reservations" action="create">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Reservation
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "new" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <CardContent className="p-4" onClick={() => handleMetricClick("new")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {newAssignments}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New Assignments
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  From Sales
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "pending" ? "ring-2 ring-yellow-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingConfirmations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Confirmations
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Awaiting suppliers
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "overdue" ? "ring-2 ring-red-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("overdue")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueReservations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue Reservations
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Need attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "ready" ? "ring-2 ring-green-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("ready")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {readyToExecute}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to Execute
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Confirmed bookings
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "tasks" ? "ring-2 ring-purple-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("tasks")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasksDueToday}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks Due Today
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Follow-ups needed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>New</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Awaiting Supplier</option>
              <option>Reserved</option>
              <option>Cancelled</option>
            </Select>

            <Select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option>All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
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
              value={financeFilter}
              onChange={(e) => setFinanceFilter(e.target.value)}
            >
              <option>All Finance Status</option>
              <option>Pending</option>
              <option>Payment Requested</option>
              <option>Deposit Paid</option>
              <option>Paid</option>
              <option>Fully Paid</option>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading reservations...
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trip/Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pax Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Finance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {visibleReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isOverdue(reservation)
                          ? "bg-red-50 dark:bg-red-900/10"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isOverdue(reservation) && (
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {reservation.reservation_id || reservation.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {reservation.customer}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                          <div className="font-medium">
                            {reservation.tripItem}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {reservation.roomType}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {reservation.destination}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>
                            {formatDate(reservation.checkIn)} -{" "}
                            {formatDate(reservation.checkOut)}
                          </div>
                          {reservation.totalNights > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {reservation.totalNights} nights
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>
                            {reservation.adults} Adults
                            {reservation.children > 0
                              ? `, ${reservation.children} Child`
                              : ""}
                          </div>
                          {reservation.children > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Ages: {reservation.childAges.join(", ")}
                            </div>
                          )}
                          {reservation.rooms > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {reservation.rooms} room
                              {reservation.rooms > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {reservation.supplier}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFinanceStatusColor(
                            reservation.financeStatus
                          )}`}
                        >
                          {reservation.financeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewReservation(reservation)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <ActionGuard module="reservations" action="update">
                            <button
                              onClick={() => handleEditReservation(reservation)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Edit Reservation"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="reservations" action="delete">
                            <button
                              onClick={() =>
                                handleDeleteReservation(reservation.id)
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Reservation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="reservations" action="update">
                            <button
                              onClick={() =>
                                handleNotesReservation(reservation)
                              }
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Internal Notes"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="reservations" action="update">
                            <button
                              onClick={() => handleUploadDocument(reservation)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Upload Document"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="reservations" action="update">
                            <button
                              onClick={() => handleSupplierContact(reservation)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              title="Contact Supplier"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          {(reservation.status === "Pending" ||
                            reservation.status === "Awaiting Supplier" ||
                            reservation.status === "New") && (
                            <ActionGuard module="reservations" action="update">
                              <button
                                onClick={() =>
                                  handleConfirmReservation(reservation.id)
                                }
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Confirm Reservation"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                          )}
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
                total={totalReservations}
                onPageChange={(p) => setPage(p)}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reservations found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or add a new reservation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ActionGuard module="reservations" action="create">
        <AddReservationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddReservation}
        />
      </ActionGuard>

      <ActionGuard module="reservations" action="update">
        <EditReservationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateReservation}
          reservation={selectedReservation}
        />
      </ActionGuard>

      <ViewReservationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        reservation={selectedReservation}
      />

      <ActionGuard module="reservations" action="update">
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          onSave={handleAddNote}
          reservation={selectedReservation}
        />
      </ActionGuard>

      <ActionGuard module="reservations" action="update">
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={handleDocumentUpload}
          reservation={selectedReservation}
        />
      </ActionGuard>

      <RoleGuard module="reservations" action="view">
        <SupplierResponseTrackerModal
          isOpen={isSupplierTrackerOpen}
          onClose={() => setIsSupplierTrackerOpen(false)}
          reservations={reservations}
        />
      </RoleGuard>

      <RoleGuard module="tasks" action="view">
        <TasksModal
          isOpen={isTasksModalOpen}
          onClose={() => setIsTasksModalOpen(false)}
          tasks={tasks}
          onTaskUpdate={setTasks}
        />
      </RoleGuard>

      <ActionGuard module="suppliers" action="create">
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSave={async (supplierData) => {
            console.log("Adding new supplier:", supplierData);
            toast.success(
              "Supplier Added",
              "New supplier has been added successfully."
            );
          }}
        />
      </ActionGuard>
    </div>
  );
};
