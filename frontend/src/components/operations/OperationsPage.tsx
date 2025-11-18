import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  MessageSquare,
  MapPin,
  Users,
  Car,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate, formatCurrency } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { AddOptionalServiceModal } from "./AddOptionalServiceModal";
import { ViewTripModal } from "./ViewTripModal";
import { AssignStaffModal } from "./AssignStaffModal";
import { ReportIssueModal } from "./ReportIssueModal";
import { InternalChatModal } from "./InternalChatModal";
import { CalendarViewModal } from "./CalendarViewModal";
import { TodaysScheduleModal } from "./TodaysScheduleModal";
import { AddStaffModal } from "./AddStaffModal";
import { ViewTaskModal } from "./ViewTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { EditTripModal } from "./EditTripModal";
import { useToastContext } from "../../contexts/ToastContext";
import operationsService, {
  OperationsTrip,
  OptionalService as TripOptionalService,
  AssignStaffPayload,
  TripFilters,
} from "../../services/operationsService";
import taskService, {
  OperationsTask,
  TaskFilters,
  TaskStatus,
  TaskPriority,
} from "../../services/taskService";
import { TripStatus } from "../../services/taskService";
import userService, { CreateUserData } from "../../services/userService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

type AddOptionalServiceFormData = {
  tripId: number;
  serviceName: string;
  price: number;
  category: string;
  description?: string;
  invoiceToFinance?: boolean;
  addedBy?: string;
};

type AssignStaffFormData = AssignStaffPayload & {
  tripId: number;
};

type ReportIssueFormData = {
  tripId: number;
  title: string;
  description: string;
  issueType: string;
  priority: string;
  affectedServices?: string;
  estimatedDelay?: string;
  actionTaken?: string;
  notifyDepartments?: string[];
  requiresImmediateAction?: boolean;
  reportedBy?: string;
  reportedAt?: string;
  status?: string;
};

export const OperationsPage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const [trips, setTrips] = useState<OperationsTrip[]>([]);
  const [tasks, setTasks] = useState<OperationsTask[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [destinationFilter, setDestinationFilter] =
    useState("All Destinations");
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [activeMetricFilter, setActiveMetricFilter] = useState("");

  // Modal states
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isViewTripModalOpen, setIsViewTripModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<OperationsTrip | null>(null);
  const [selectedTask, setSelectedTask] = useState<OperationsTask | null>(null);
  const [users, setUsers] = useState<Array<{ id: number; full_name: string }>>(
    []
  );

  // Task filters
  const [taskStatusFilter, setTaskStatusFilter] = useState("All Status");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All Priority");
  const [taskDateFromFilter, setTaskDateFromFilter] = useState("");
  const [taskDateToFilter, setTaskDateToFilter] = useState("");
  const [taskSearchTerm, setTaskSearchTerm] = useState("");

  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
  } = useToastContext();

  const optionalServices = useMemo(() => {
    return trips.flatMap((trip) =>
      trip.optionalServices.map((service) => ({
        ...service,
        tripId: trip.id,
        tripCode: trip.tripCode,
        customerName: trip.customerName,
      }))
    );
  }, [trips]);

  // Pagination: Trips (10 per page)
  const [totalTripsCount, setTotalTripsCount] = useState(0);
  const {
    page: tripsPage,
    perPage: tripsPerPage,
    offset: tripsOffset,
    pageCount: tripsPageCount,
    setPage: setTripsPage,
    reset: resetTripsPage,
  } = usePagination({ perPage: 10, total: totalTripsCount });

  // Pagination: Tasks (10 per page)
  const [totalOpsTasksCount, setTotalOpsTasksCount] = useState(0);
  const {
    page: tasksPage,
    perPage: tasksPerPage,
    offset: tasksOffset,
    pageCount: tasksPageCount,
    setPage: setTasksPage,
    reset: resetTasksPage,
  } = usePagination({ perPage: 10, total: totalOpsTasksCount });

  const loadTrips = useCallback(async () => {
    setIsTripsLoading(true);
    setTripsError(null);
    try {
      const filterParams: TripFilters = {};
      if (statusFilter !== "All Status") {
        filterParams.status = statusFilter as TripStatus;
      }
      if (searchTerm) {
        filterParams.search = searchTerm;
      }
      if (dateFromFilter) {
        filterParams.startDateFrom = dateFromFilter;
      }
      if (dateToFilter) {
        filterParams.startDateTo = dateToFilter;
      }
      const data = await operationsService.getTrips(filterParams);
      setTrips(data);
    } catch (error: any) {
      console.error("Failed to load trips", error);

      // Handle 429 rate limit error
      if (error.response?.status === 429) {
        setTripsError(
          "Rate limit exceeded. Please wait a moment and try again."
        );
        showError(
          "Too Many Requests",
          "Rate limit exceeded. Please wait a moment before trying again."
        );
      } else {
        setTripsError("Failed to load operations trips");
        showError(
          "Error loading trips",
          error.response?.data?.message ||
            "Unable to load operations trips. Please try again."
        );
      }
    } finally {
      setIsTripsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, dateFromFilter, dateToFilter]);

  const loadTasks = useCallback(async () => {
    setTasksError(null);
    try {
      const filterParams: TaskFilters = {};
      if (taskStatusFilter !== "All Status") {
        filterParams.status = taskStatusFilter as TaskStatus;
      }
      if (taskPriorityFilter !== "All Priority") {
        filterParams.priority = taskPriorityFilter as TaskPriority;
      }
      if (taskDateFromFilter) {
        filterParams.dateFrom = taskDateFromFilter;
      }
      if (taskDateToFilter) {
        filterParams.dateTo = taskDateToFilter;
      }
      const data = await taskService.getTasks(filterParams);
      setTasks(data);
    } catch (error: any) {
      console.error("Failed to load tasks", error);

      // Handle 429 rate limit error
      if (error.response?.status === 429) {
        setTasksError(
          "Rate limit exceeded. Please wait a moment and try again."
        );
        showError(
          "Too Many Requests",
          "Rate limit exceeded. Please wait a moment before trying again."
        );
      } else {
        setTasksError("Failed to load operations tasks");
        showError(
          "Error loading tasks",
          error.response?.data?.message ||
            "Unable to load operations tasks. Please try again."
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    taskStatusFilter,
    taskPriorityFilter,
    taskDateFromFilter,
    taskDateToFilter,
  ]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    // Load users for task assignment
    const loadUsers = async () => {
      try {
        const response = await userService.getAllUsers({ limit: 100 });
        // userService now returns { users: User[], ... }
        const usersList = response.users || [];
        setUsers(
          usersList.map((u: any) => ({
            id: parseInt(u.id.toString()),
            full_name: u.full_name,
          }))
        );
      } catch (error: any) {
        console.error("Failed to load users", error);

        // Handle 429 rate limit error
        if (error.response?.status === 429) {
          showError(
            "Too Many Requests",
            "Rate limit exceeded. Please wait a moment before trying again."
          );
        }
        // Set empty array on error to prevent crashes
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case "Planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "In Progress":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Issue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "Delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleMetricClick = (metricType: string) => {
    setActiveMetricFilter(metricType);
    switch (metricType) {
      case "ready":
        setStatusFilter("Planned");
        break;
      case "progress":
        setStatusFilter("In Progress");
        break;
      case "issues":
        setStatusFilter("Issue");
        break;
      case "tasks":
        setIsScheduleModalOpen(true);
        break;
      default:
        setStatusFilter("All Status");
    }
  };

  const handleAddOptionalService = async (
    serviceData: AddOptionalServiceFormData
  ) => {
    if (!canPerformAction("operations", "create")) {
      showError(
        "Access Denied",
        "You do not have permission to add optional services."
      );
      return;
    }

    try {
      const createdService = await operationsService.addOptionalService(
        serviceData.tripId,
        {
          serviceName: serviceData.serviceName,
          category: serviceData.category,
          price: serviceData.price,
          addedBy: serviceData.addedBy || "Operations Team",
          addedDate: new Date().toISOString().split("T")[0],
          status: "Added",
          invoiced: serviceData.invoiceToFinance ?? false,
        }
      );

      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === serviceData.tripId
            ? {
                ...trip,
                optionalServices: [createdService, ...trip.optionalServices],
              }
            : trip
        )
      );

      showSuccess(
        "Optional Service Added",
        "Service has been added and will be invoiced to Finance."
      );
      await loadTrips();
    } catch (error) {
      console.error("Failed to add optional service", error);
      showError("Error", "Unable to add optional service. Please try again.");
    }
  };

  const handleViewTrip = (trip: OperationsTrip) => {
    setSelectedTrip(trip);
    setIsViewTripModalOpen(true);
  };

  const handleEditTrip = (trip: OperationsTrip) => {
    setSelectedTrip(trip);
    setIsEditTripModalOpen(true);
  };

  const handleUpdateTrip = async (tripId: number, tripData: any) => {
    if (!canPerformAction("operations", "update")) {
      showError("Access Denied", "You do not have permission to update trips.");
      return;
    }

    try {
      const updatedTrip = await operationsService.updateTrip(tripId, tripData);
      setTrips((prev) =>
        prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      );
      await loadTrips();
      showSuccess("Trip Updated", "Trip has been updated successfully.");
      setIsEditTripModalOpen(false);
    } catch (error: any) {
      console.error("Failed to update trip", error);
      showError(
        "Error",
        error.response?.data?.message ||
          "Unable to update trip. Please try again."
      );
    }
  };

  const handleAssignStaff = (trip: OperationsTrip) => {
    setSelectedTrip(trip);
    setIsAssignStaffModalOpen(true);
  };

  const handleReportIssue = (trip: OperationsTrip) => {
    setSelectedTrip(trip);
    setIsReportIssueModalOpen(true);
  };

  const handleChat = (trip: OperationsTrip) => {
    setSelectedTrip(trip);
    setIsChatModalOpen(true);
  };

  const handleAssignStaffUpdate = async (staffData: AssignStaffFormData) => {
    if (!canPerformAction("operations", "update")) {
      showError(
        "Access Denied",
        "You do not have permission to update trip staff."
      );
      return;
    }

    try {
      const updatedTrip = await operationsService.assignStaff(
        staffData.tripId,
        {
          assignedGuide: staffData.assignedGuide,
          assignedDriver: staffData.assignedDriver,
          transport: staffData.transport,
          transportDetails: staffData.transportDetails,
        }
      );

      setTrips((prev) =>
        prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      );
      await loadTrips();
      showSuccess(
        "Staff Assigned",
        "Trip assignments have been updated successfully."
      );
    } catch (error) {
      console.error("Failed to assign staff", error);
      showError("Error", "Unable to update trip staff. Please try again.");
    }
  };

  const handleReportIssueSubmit = async (issueData: ReportIssueFormData) => {
    if (!canPerformAction("operations", "update")) {
      showError(
        "Access Denied",
        "You do not have permission to update trip status."
      );
      return;
    }

    try {
      const updatedTrip = await operationsService.updateTripStatus(
        issueData.tripId,
        "Issue"
      );
      setTrips((prev) =>
        prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      );
      await loadTrips();
      showWarning(
        "Issue Reported",
        "Issue has been logged and relevant teams notified."
      );
    } catch (error) {
      console.error("Failed to report issue", error);
      showError("Error", "Unable to update trip status. Please try again.");
    }
  };

  const handleCloseTrip = async (tripId: number) => {
    if (!canPerformAction("operations", "update")) {
      showError(
        "Access Denied",
        "You do not have permission to update trip status."
      );
      return;
    }

    try {
      const updatedTrip = await operationsService.updateTripStatus(
        tripId,
        "Completed"
      );
      setTrips((prev) =>
        prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      );
      await loadTrips();
      showSuccess(
        "Trip Completed",
        "Trip has been marked as completed and finalized."
      );
    } catch (error) {
      console.error("Failed to close trip", error);
      showError("Error", "Unable to close trip. Please try again.");
    }
  };

  const handleViewTask = (task: OperationsTask) => {
    setSelectedTask(task);
    setIsViewTaskModalOpen(true);
  };

  const handleEditTask = (task: OperationsTask) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (taskId: number, taskData: any) => {
    if (!canPerformAction("operations", "update")) {
      showError("Access Denied", "You do not have permission to update tasks.");
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      await loadTasks();
      showSuccess("Task Updated", "Task has been updated successfully.");
      setIsEditTaskModalOpen(false);
    } catch (error: any) {
      console.error("Failed to update task", error);
      showError(
        "Error",
        error.response?.data?.message ||
          "Unable to update task. Please try again."
      );
    }
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    // For Customer role, only show their own trips
    if (userRole === "customer") {
      // In real app, filter by trip.customer_id === currentUserId
      return trip.customerName === "Ahmed Hassan"; // Demo: show only first customer's trips
    }

    const matchesSearch =
      trip.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tripCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || trip.status === statusFilter;
    const matchesDestination =
      destinationFilter === "All Destinations" ||
      trip.destinations.some((dest) =>
        dest.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    const matchesStaff =
      staffFilter === "All Staff" ||
      (trip.assignedGuide?.toLowerCase().includes(staffFilter.toLowerCase()) ??
        false) ||
      (trip.assignedDriver?.toLowerCase().includes(staffFilter.toLowerCase()) ??
        false);

    let matchesDateRange = true;
    if (dateFromFilter && dateToFilter) {
      const tripDate = trip.startDate ? new Date(trip.startDate) : null;
      const fromDate = new Date(dateFromFilter);
      const toDate = new Date(dateToFilter);
      matchesDateRange = tripDate
        ? tripDate >= fromDate && tripDate <= toDate
        : false;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDestination &&
      matchesStaff &&
      matchesDateRange
    );
  });

  // Filter tasks (client-side filtering for search term)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search is handled client-side since backend doesn't support search param
      const matchesSearch =
        !taskSearchTerm ||
        task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.taskId.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        (task.customerName
          ?.toLowerCase()
          .includes(taskSearchTerm.toLowerCase()) ??
          false);

      return matchesSearch;
    });
  }, [tasks, taskSearchTerm]);

  // Reset and update pagination totals for trips when filters change
  useEffect(() => {
    resetTripsPage();
  }, [searchTerm, statusFilter, destinationFilter, staffFilter, dateFromFilter, dateToFilter, resetTripsPage]);
  useEffect(() => {
    setTotalTripsCount(filteredTrips.length);
  }, [filteredTrips.length]);
  const visibleTrips = filteredTrips.slice(tripsOffset, tripsOffset + tripsPerPage);

  // Reset and update pagination totals for tasks when filters change
  useEffect(() => {
    resetTasksPage();
  }, [taskSearchTerm, taskStatusFilter, taskPriorityFilter, taskDateFromFilter, taskDateToFilter, resetTasksPage]);
  useEffect(() => {
    setTotalOpsTasksCount(filteredTasks.length);
  }, [filteredTasks.length]);
  const visibleOpsTasks = filteredTasks.slice(tasksOffset, tasksOffset + tasksPerPage);

  // Calculate metrics
  const newBookingsReady = trips.filter((t) => t.status === "Planned").length;
  const dailyTasks = tasks.filter(
    (t) => t.status === "Pending" || t.status === "In Progress"
  ).length;
  const tripsInProgress = trips.filter(
    (t) => t.status === "In Progress"
  ).length;
  const optionalServicesAdded = optionalServices.filter((s) => {
    const today = new Date().toISOString().split("T")[0];
    return s.addedDate === today;
  }).length;
  const pendingConfirmations = trips.filter(
    (t) => t.status === "Planned"
  ).length;
  const overdueIssues = trips.filter((t) => t.status === "Issue").length;

  const isOverdue = (trip: OperationsTrip) => {
    if (!trip.startDate) return false;
    const startDate = new Date(trip.startDate);
    const today = new Date();
    return (
      startDate < today &&
      (trip.status === "Planned" || trip.status === "Issue")
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Operations Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage daily travel execution and field operations
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <RoleGuard module="operations" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Today's Schedule</span>
            </Button>
          </RoleGuard>
          <RoleGuard module="calendar" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar View</span>
            </Button>
          </RoleGuard>
          <ActionGuard module="operations" action="create">
            <Button onClick={() => setIsAddServiceModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Optional Service
            </Button>
          </ActionGuard>
          <ActionGuard module="operations" action="create">
            <Button
              variant="outline"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add New Staff</span>
            </Button>
          </ActionGuard>
        </div>
      </div>

      {(tripsError || tasksError) && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {tripsError && <p>{tripsError}</p>}
          {tasksError && <p>{tasksError}</p>}
        </div>
      )}

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "ready" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("ready")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {newBookingsReady}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New Bookings Ready
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  To be planned
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
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
                  {dailyTasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Daily Tasks
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Today
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "progress" ? "ring-2 ring-green-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("progress")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tripsInProgress}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trips in Progress
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Active now
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {optionalServicesAdded}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optional Services
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Added today
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingConfirmations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Confirmations
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  From suppliers
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "issues" ? "ring-2 ring-red-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("issues")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueIssues}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue Issues
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Need attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Operations Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Trip Statistics */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trip Statistics
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Trips:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {trips.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Planned:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {trips.filter((t) => t.status === "Planned").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    In Progress:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {trips.filter((t) => t.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed:
                  </span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {trips.filter((t) => t.status === "Completed").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Issues:
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {trips.filter((t) => t.status === "Issue").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Task Statistics */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Statistics
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Tasks:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Pending:
                  </span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {tasks.filter((t) => t.status === "Pending").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    In Progress:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {tasks.filter((t) => t.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {tasks.filter((t) => t.status === "Completed").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delayed:
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {tasks.filter((t) => t.status === "Delayed").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Priority Statistics */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Priority
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    High Priority:
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {tasks.filter((t) => t.priority === "High").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Medium Priority:
                  </span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {tasks.filter((t) => t.priority === "Medium").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Low Priority:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {tasks.filter((t) => t.priority === "Low").length}
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completion Rate:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tasks.length > 0
                      ? Math.round(
                          (tasks.filter((t) => t.status === "Completed")
                            .length /
                            tasks.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Services Statistics */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Optional Services
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Services:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {optionalServices.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Added:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {
                      optionalServices.filter((s) => s.status === "Added")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Confirmed:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {
                      optionalServices.filter((s) => s.status === "Confirmed")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Value:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(
                      optionalServices.reduce(
                        (sum, s) => sum + Number(s.price || 0),
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Invoiced:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {optionalServices.filter((s) => s.invoiced).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Issue</option>
              <option>Completed</option>
              <option>Delayed</option>
            </Select>

            <Select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
            >
              <option>All Destinations</option>
              <option>Luxor</option>
              <option>Aswan</option>
              <option>Cairo</option>
              <option>Hurghada</option>
              <option>Desert</option>
            </Select>

            <Select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option>All Staff</option>
              <option>Ahmed</option>
              <option>Mahmoud</option>
              <option>Fatma</option>
              <option>Hassan</option>
              <option>Omar</option>
              <option>Nour</option>
              <option>Khaled</option>
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
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Itinerary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transport
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Optional Services
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isTripsLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading trips...
                    </td>
                  </tr>
                ) : (
                  visibleTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isOverdue(trip) ? "bg-red-50 dark:bg-red-900/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isOverdue(trip) && (
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {trip.tripCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {trip.customerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trip.customerCount} pax
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{trip.itinerary}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trip.startDate
                              ? formatDate(trip.startDate)
                              : "TBD"}{" "}
                            - {trip.endDate ? formatDate(trip.endDate) : "TBD"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trip.duration}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{trip.assignedGuide}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Car className="h-3 w-3 text-gray-400" />
                            <span>{trip.assignedDriver}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{trip.transport}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trip.transportDetails}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOperationStatusColor(
                            trip.status
                          )}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {trip.optionalServices.length > 0 ? (
                            trip.optionalServices.map(
                              (service: TripOptionalService, index: number) => (
                                <div
                                  key={index}
                                  className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded"
                                >
                                  {service.serviceName}:{" "}
                                  {formatCurrency(service.price)}
                                </div>
                              )
                            )
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewTrip(trip)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Full Itinerary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <ActionGuard module="operations" action="update">
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Edit Trip"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="operations" action="update">
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setIsAddServiceModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Add/Edit Service"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="operations" action="update">
                            <button
                              onClick={() => handleChat(trip)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Internal Chat"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="operations" action="update">
                            <button
                              onClick={() => handleAssignStaff(trip)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              title="Assign Vehicle/Staff"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          {trip.status !== "Completed" && (
                            <ActionGuard module="operations" action="update">
                              <button
                                onClick={() => handleCloseTrip(trip.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Close Trip"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                          )}
                          {trip.status === "Issue" ||
                          trip.status === "In Progress" ? (
                            <ActionGuard module="operations" action="update">
                              <button
                                onClick={() => handleReportIssue(trip)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Report Issue"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              page={tripsPage}
              pageCount={tripsPageCount}
              perPage={tripsPerPage}
              total={totalTripsCount}
              onPageChange={(p) => setTripsPage(p)}
              compact
            />
          </div>
        </CardContent>
      </Card>

      {filteredTrips.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No trips found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or check back later for new
              assignments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tasks Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Operations Tasks
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and track operational tasks
            </p>
          </div>
        </div>

        {/* Task Filters */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              <Select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
              </Select>

              <Select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
              >
                <option>All Priority</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={taskDateFromFilter}
                onChange={(e) => setTaskDateFromFilter(e.target.value)}
              />

              <Input
                type="date"
                placeholder="To Date"
                value={taskDateToFilter}
                onChange={(e) => setTaskDateToFilter(e.target.value)}
              />

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={taskSearchTerm}
                  onChange={(e) => setTaskSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tasksError ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-red-500 dark:text-red-400"
                      >
                        {tasksError}
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    visibleOpsTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.taskId}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          {task.location && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {task.location}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {task.customerName || "N/A"}
                          </div>
                          {task.trip && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {task.trip.tripCode}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-400" />
                            {task.assignedToName || "Unassigned"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {task.scheduledAt
                              ? formatDate(task.scheduledAt)
                              : "Not scheduled"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : task.status === "Delayed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewTask(task)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="View Task"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <ActionGuard module="operations" action="update">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Edit Task"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination
                page={tasksPage}
                pageCount={tasksPageCount}
                perPage={tasksPerPage}
                total={totalOpsTasksCount}
                onPageChange={(p) => setTasksPage(p)}
                compact
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ActionGuard module="operations" action="create">
        <AddOptionalServiceModal
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          onSave={handleAddOptionalService}
          trips={trips}
          selectedTrip={selectedTrip}
        />
      </ActionGuard>

      <ViewTripModal
        isOpen={isViewTripModalOpen}
        onClose={() => setIsViewTripModalOpen(false)}
        trip={selectedTrip}
        onEdit={
          selectedTrip
            ? () => {
                setIsViewTripModalOpen(false);
                setIsEditTripModalOpen(true);
              }
            : undefined
        }
      />

      <ActionGuard module="operations" action="update">
        <AssignStaffModal
          isOpen={isAssignStaffModalOpen}
          onClose={() => setIsAssignStaffModalOpen(false)}
          onSave={handleAssignStaffUpdate}
          trip={selectedTrip}
        />
      </ActionGuard>

      <ActionGuard module="operations" action="update">
        <ReportIssueModal
          isOpen={isReportIssueModalOpen}
          onClose={() => setIsReportIssueModalOpen(false)}
          onSave={handleReportIssueSubmit}
          trip={selectedTrip}
        />
      </ActionGuard>

      <ActionGuard module="operations" action="update">
        <InternalChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          trip={selectedTrip}
        />
      </ActionGuard>

      <RoleGuard module="calendar" action="view">
        <CalendarViewModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          trips={trips}
          tasks={tasks}
        />
      </RoleGuard>

      <RoleGuard module="operations" action="view">
        <TodaysScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          tasks={tasks}
          trips={trips}
        />
      </RoleGuard>

      <ActionGuard module="operations" action="create">
        <AddStaffModal
          isOpen={isAddStaffModalOpen}
          onClose={() => setIsAddStaffModalOpen(false)}
          onSave={async (staffData) => {
            if (!canPerformAction("operations", "create")) {
              showError(
                "Access Denied",
                "You do not have permission to add staff members."
              );
              return;
            }

            try {
              // Map staff type to user role (operations staff use 'operations' role)
              const role = "operations";

              // Generate a temporary password (staff should change on first login)
              const tempPassword = `TempPass${Math.random()
                .toString(36)
                .slice(-8)}`;

              await userService.createUser({
                email: staffData.email,
                password: tempPassword,
                full_name: staffData.full_name,
                phone: staffData.phone,
                role: role as 'admin' | 'customer' | 'sales' | 'reservation' | 'finance' | 'operations',
                department: staffData.department,
              });
              showSuccess(
                "Staff Added",
                `New staff member has been added successfully. Temporary password: ${tempPassword}`
              );
            } catch (error: any) {
              console.error("Failed to add staff", error);
              showError(
                "Error",
                error.response?.data?.message ||
                  "Unable to add staff member. Please try again."
              );
            }
          }}
        />
      </ActionGuard>

      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={() => setIsViewTaskModalOpen(false)}
        task={selectedTask}
        onEdit={() => {
          setIsViewTaskModalOpen(false);
          setIsEditTaskModalOpen(true);
        }}
      />

      <ActionGuard module="operations" action="update">
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSave={handleUpdateTask}
          task={selectedTask}
          trips={trips}
          users={users}
        />
      </ActionGuard>

      <ActionGuard module="operations" action="update">
        <EditTripModal
          isOpen={isEditTripModalOpen}
          onClose={() => setIsEditTripModalOpen(false)}
          onSave={handleUpdateTrip}
          trip={selectedTrip}
        />
      </ActionGuard>
    </div>
  );
};
