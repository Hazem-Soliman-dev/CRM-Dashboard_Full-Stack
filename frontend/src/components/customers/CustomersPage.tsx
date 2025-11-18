import React, { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Calendar,
  Clock,
  Users,
  Crown,
  DollarSign,
  TrendingUp,
  User,
  Building,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate, formatCurrency } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import customerService from "../../services/customerService";
import reservationService from "../../services/reservationService";
import activityService from "../../services/activityService";
import { useToastContext } from "../../contexts/ToastContext";
import { AddCustomerModal } from "./AddCustomerModal";
import { ViewCustomerModal } from "./ViewCustomerModal";
import { EditCustomerModal } from "./EditCustomerModal";
import { BookingModal } from "./BookingModal";
import { ActivityModal } from "./ActivityModal";
import { ExportModal } from "./ExportModal";
import { BulkEmailModal } from "./BulkEmailModal";
import { CorporateAccountsModal } from "./CorporateAccountsModal";
import { InternalChatModal } from "../finance/InternalChatModal";
import { CreateTicketModal } from "../support/CreateTicketModal";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";
import supportService from "../../services/supportService";
import { VIPCustomersModal } from "./VIPCustomersModal";
import staffService from "../../services/staffService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

// Component now uses backend API only, no mock data

const customerTypeData = [
  { type: "Individual", count: 1425, percentage: 58, color: "bg-blue-500" },
  { type: "Family/Group", count: 968, percentage: 32, color: "bg-green-500" },
  { type: "Corporate", count: 454, percentage: 10, color: "bg-purple-500" },
];

const recentActivity = [
  {
    id: 1,
    type: "new_customer",
    description: "New customer registered",
    customer: "Emma Brown",
    timestamp: "2 hours ago",
    icon: User,
  },
  {
    id: 2,
    type: "booking",
    description: "Booking completed",
    customer: "TechCorp Solutions",
    timestamp: "4 hours ago",
    icon: Calendar,
  },
  {
    id: 3,
    type: "upgrade",
    description: "Customer upgraded to VIP",
    customer: "Johnson Family",
    timestamp: "6 hours ago",
    icon: Crown,
  },
  {
    id: 4,
    type: "email",
    description: "Email campaign sent",
    customer: "245 customers",
    timestamp: "8 hours ago",
    icon: Users,
  },
];

export const CustomersPage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const toast = useToastContext();
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [staffFilter, setStaffFilter] = useState("All Agents");
  const [activityFilter, setActivityFilter] = useState("All Activity");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Quick Actions modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  // Contact modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState<any>(null);
  const [totalCustomersPaged, setTotalCustomersPaged] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalCustomersPaged });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [customerRes, staffRes] = await Promise.all([
        customerService.getAllCustomers({
          limit: 100,
          status: statusFilter !== "All Status" ? statusFilter : undefined,
          search: searchTerm || undefined,
        }),
        staffService.getAllStaff(),
      ]);
      setCustomers(customerRes.customers);
      setStaff(staffRes.staff);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(
        "Failed to load data: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "VIP":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Recurring":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleAddCustomer = async (customerData: any) => {
    if (!canPerformAction("customers", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create customers."
      );
      return;
    }

    try {
      console.log("Creating customer:", customerData);
      await customerService.createCustomer(customerData);
      await loadData();
      toast.success(
        "Customer Added",
        "New customer has been created successfully."
      );
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast.error(
        "Failed to add customer: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const openContactChat = (customer: any) => {
    setContactTarget(customer);
    setIsChatOpen(true);
  };
  const openContactTicket = (customer: any) => {
    setContactTarget(customer);
    setIsTicketOpen(true);
  };
  const openContactEmail = (customer: any) => {
    const email = customer.email || "";
    const subject = encodeURIComponent(`Regarding your account`);
    const body = encodeURIComponent(`Hello ${customer.name || ""},\n\n`);
    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      toast.error("No email", "Selected customer has no email address.");
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: any) => {
    if (!canPerformAction("customers", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to update customers."
      );
      return;
    }

    try {
      await customerService.updateCustomer(updatedCustomer.id, updatedCustomer);
      await loadData(); // Refresh data from server
      toast.success(
        "Customer Updated",
        "Customer information has been updated successfully."
      );
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(
        "Failed to update customer: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!canPerformAction("customers", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete customers."
      );
      return;
    }

    if (!window.confirm("Delete this customer?\nThis cannot be undone.")) {
      return;
    }

    try {
      console.log("Deleting customer:", customerId);
      await customerService.deleteCustomer(customerId);

      // IMMEDIATELY remove from UI
      const updatedCustomers = customers.filter((c) => c.id !== customerId);
      setCustomers(updatedCustomers);

      // Close modals
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);

      toast.success("Deleted!", "Customer has been removed.");

      // Reload in background
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      await loadData();
      toast.error(
        "Delete Failed",
        error.response?.data?.message || "Could not delete customer"
      );
    }
  };

  const handleCreateBooking = async (bookingData: any) => {
    if (!selectedCustomer) return;

    try {
      // Calculate return date from start date and duration
      const startDate = bookingData.startDate
        ? new Date(bookingData.startDate)
        : new Date();
      const duration = parseInt(bookingData.duration || "7");
      const returnDate = new Date(startDate);
      returnDate.setDate(returnDate.getDate() + duration);

      // Map service to service_type - check if it's a product/service name or ID
      let serviceType = "Other";
      if (bookingData.service) {
        // If service is a string that matches service types, use it
        const validServiceTypes = [
          "Flight",
          "Hotel",
          "Car Rental",
          "Tour",
          "Package",
          "Other",
        ];
        if (validServiceTypes.includes(bookingData.service)) {
          serviceType = bookingData.service;
        } else {
          // Otherwise default to Other or try to extract from service name
          serviceType = "Other";
        }
      }

      // Create reservation via reservationService
      await reservationService.createReservation({
        customer_id: selectedCustomer.id.toString(),
        supplier_id: bookingData.supplier_id || undefined,
        service_type: bookingData.service_type || serviceType,
        destination: bookingData.destination,
        departure_date: startDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        return_date: returnDate.toISOString().split("T")[0],
        adults: parseInt(bookingData.participants || bookingData.adults || "1"),
        children: parseInt(bookingData.children || "0"),
        infants: parseInt(bookingData.infants || "0"),
        total_amount: parseFloat(
          bookingData.estimatedCost || bookingData.total_amount || "0"
        ),
        notes:
          bookingData.specialRequests ||
          bookingData.notes ||
          `Booking created from customer page`,
      });

      await loadData();
      toast.success(
        "Booking Created",
        "New booking has been created successfully."
      );
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(
        "Failed to create booking",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleLogActivity = async (activityData: any) => {
    if (!selectedCustomer) return;

    try {
      await activityService.logActivity(selectedCustomer.id, activityData);

      await loadData();
      toast.success(
        "Activity Logged",
        "Activity has been recorded successfully."
      );

      // If this activity represents a customer message, also create a support ticket
      try {
        const isMessageType =
          activityData?.type === "message" ||
          activityData?.type === "email" ||
          activityData?.type === "call"; // treat contact attempts as tickets if desired
        if (isMessageType) {
          const subjectBase =
            activityData?.subject ||
            (activityData?.description
              ? (activityData.description as string)
              : "");
          const subject =
            subjectBase.length > 0
              ? `Customer message: ${selectedCustomer.name} - ${
                  subjectBase.length > 80
                    ? `${subjectBase.slice(0, 77)}...`
                    : subjectBase
                }`
              : `Customer message: ${selectedCustomer.name}`;
          await supportService.createTicket({
            customer_id: String(selectedCustomer.id),
            subject,
            description:
              activityData?.description ||
              `Message logged for ${selectedCustomer.name}`,
            priority: "Medium",
            assigned_to: selectedCustomer.assigned_staff_id || undefined,
          });
          toast.success(
            "Ticket Created",
            "Support ticket opened for this customer message."
          );
        }
      } catch (ticketErr: any) {
        console.error("Ticket creation failed:", ticketErr);
        toast.error(
          "Ticket Error",
          ticketErr?.response?.data?.message || "Failed to create support ticket"
        );
      }
    } catch (error: any) {
      console.error("Error logging activity:", error);
      toast.error(
        "Failed to log activity",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleBookCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsBookingModalOpen(true);
  };

  const handleActivityCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsActivityModalOpen(true);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type === typeFilter ? "All Types" : type);
  };

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer) => {
    // For Customer role, only show their own data
    if (userRole === "customer") {
      // Filter by customer ID matching current user's customer ID
      // This should be handled by the backend API, but adding client-side filter as backup
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      return (
        customer.id === currentUser.id ||
        customer.customer_id === currentUser.id
      );
    }

    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesType =
      typeFilter === "All Types" || customer.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || customer.status === statusFilter;
    const matchesStaff =
      staffFilter === "All Agents" || customer.assignedStaff === staffFilter;

    return matchesSearch && matchesType && matchesStatus && matchesStaff;
  });

  React.useEffect(() => {
    resetPage();
  }, [searchTerm, typeFilter, statusFilter, staffFilter, activityFilter, resetPage]);

  React.useEffect(() => {
    setTotalCustomersPaged(filteredCustomers.length);
  }, [filteredCustomers.length]);

  const visibleCustomers =
    filteredCustomers.length === totalCustomersPaged
      ? filteredCustomers.slice(offset, offset + perPage)
      : filteredCustomers;

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) =>
      c.status === "Active" || c.status === "VIP" || c.status === "Recurring"
  ).length;
  const vipCustomers = customers.filter((c) => c.status === "VIP").length;
  const avgCLV =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) /
        customers.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your customer relationships and data
          </p>
        </div>
        <ActionGuard module="customers" action="create">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </ActionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalCustomers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +15% this month
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
                      Active Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeCustomers.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {Math.round((activeCustomers / totalCustomers) * 100)}% of
                      total
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
                <button
                  onClick={() => setIsVIPModalOpen(true)}
                  className="w-full flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg p-2 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      VIP Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {vipCustomers}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      High value clients
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg. CLV
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(avgCLV)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Customer lifetime value
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>Individual</option>
                  <option>Corporate</option>
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </Select>
                <Select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                >
                  <option>All Agents</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                >
                  <option>All Activity</option>
                  <option>Recent Bookings</option>
                  <option>High Value</option>
                  <option>Needs Follow-up</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name/Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Trip
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {visibleCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {customer.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {customer.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {customer.name}
                              </p>
                              {customer.company && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {customer.company}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            <div>{customer.email}</div>
                            <div>{customer.phone}</div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Available
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.assignedStaff}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              customer.status
                            )}`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {customer.totalBookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.lastTrip
                            ? formatDate(customer.lastTrip)
                            : "No trips yet"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.contactMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <ActionGuard module="customers" action="update">
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Edit Customer"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            <ActionGuard module="bookings" action="create">
                              <button
                                onClick={() => handleBookCustomer(customer)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                title="Create Booking"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            <ActionGuard module="customers" action="update">
                              <button
                                onClick={() => handleActivityCustomer(customer)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                title="Log Activity"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            <ActionGuard module="customers" action="delete">
                              <button
                                onClick={() =>
                                  handleDeleteCustomer(customer.id)
                                }
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete Customer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </ActionGuard>
                            {/* Contact actions: chat, ticket, email */}
                            <button
                              onClick={() => openContactChat(customer)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Chat"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openContactTicket(customer)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Create Support Ticket"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openContactEmail(customer)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Send Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
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
                  total={totalCustomersPaged}
                  onPageChange={(p) => setPage(p)}
                  compact
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Types */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerTypeData.map((item) => (
                  <div key={item.type}>
                    <button
                      onClick={() => handleTypeFilter(item.type)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        typeFilter === item.type
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.type}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.count}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.customer}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ActionGuard module="customers" action="create">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                </ActionGuard>
                <RoleGuard module="customers" action="view" hideIfNoAccess>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsExportModalOpen(true)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Export Customer Data
                  </Button>
                </RoleGuard>
                <ActionGuard module="customers" action="update">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsBulkEmailModalOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk Email Campaign
                  </Button>
                </ActionGuard>
                <RoleGuard module="customers" action="view" hideIfNoAccess>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsCorporateModalOpen(true)}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Corporate Accounts
                  </Button>
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Modals */}
      {isChatOpen && contactTarget && (
        <InternalChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          booking={{
            id: contactTarget.id,
            customer: contactTarget.name || contactTarget.email || "Customer",
            tripItem: "N/A",
            paymentStatus: "N/A",
            outstandingBalance: 0,
          }}
        />
      )}
      {isTicketOpen && contactTarget && (
        <CreateTicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          onSave={async (ticketData) => {
            try {
              // Ensure customer_id defaults to selected contact if not chosen in modal
              if (!ticketData.customer_id && contactTarget?.id) {
                ticketData.customer_id = String(contactTarget.id);
              }
              if (!ticketData.subject) {
                ticketData.subject = `Support request - ${contactTarget.name || contactTarget.email || "Customer"}`;
              }
              await supportService.createTicket(ticketData);
              toast.success("Ticket Created", "Support ticket has been created.");
            } catch (error: any) {
              console.error("Failed to create ticket", error);
              toast.error("Failed to create ticket", error.response?.data?.message || error.message);
              throw error;
            }
          }}
        />
      )}
      {/* Modals */}
      <ActionGuard module="customers" action="create">
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddCustomer}
        />
      </ActionGuard>

      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        customer={selectedCustomer}
      />

      <ActionGuard module="customers" action="update">
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateCustomer}
          customer={selectedCustomer}
        />
      </ActionGuard>

      <ActionGuard module="bookings" action="create">
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSave={handleCreateBooking}
          customer={selectedCustomer}
        />
      </ActionGuard>

      <ActionGuard module="customers" action="update">
        <ActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          onSave={handleLogActivity}
          customer={selectedCustomer}
        />
      </ActionGuard>

      {/* Quick Actions Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
      />

      <CorporateAccountsModal
        isOpen={isCorporateModalOpen}
        onClose={() => setIsCorporateModalOpen(false)}
      />

      <VIPCustomersModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        customers={customers}
        onUpdateCustomer={handleUpdateCustomer}
        onLogActivity={handleLogActivity}
      />
    </div>
  );
};
