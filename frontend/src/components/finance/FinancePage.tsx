import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  MessageSquare,
  FileText,
  CheckCircle,
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatCurrency, formatDate } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { ViewPaymentModal } from "./ViewPaymentModal";
import { EditPaymentModal } from "./EditPaymentModal";
import { IssueInvoiceModal } from "./IssueInvoiceModal";
import { SupplierInvoiceModal } from "./SupplierInvoiceModal";
import { FinancialReportsModal } from "./FinancialReportsModal";
import { ExportModal } from "./ExportModal";
import { InternalChatModal } from "./InternalChatModal";
import { useToastContext } from "../../contexts/ToastContext";
import paymentService from "../../services/paymentService";
import reservationService from "../../services/reservationService";
import staffService from "../../services/staffService";
import supplierService from "../../services/supplierService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

export const FinancePage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [activeMetricFilter, setActiveMetricFilter] = useState("");

  // Modal states
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] =
    useState(false);
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isIssueInvoiceModalOpen, setIsIssueInvoiceModalOpen] = useState(false);
  const [isSupplierInvoiceModalOpen, setIsSupplierInvoiceModalOpen] =
    useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const toast = useToastContext();
  const [totalFinance, setTotalFinance] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalFinance });

  // Load finance data from APIs
  const loadFinanceData = useCallback(async () => {
    try {
      // Get reservations, payments, staff, and suppliers
      const [
        reservationsResponse,
        paymentsResponse,
        staffResponse,
        suppliersResponse,
      ] = await Promise.all([
        reservationService.getAllReservations({ limit: 100 }),
        paymentService.getAllPayments({ limit: 1000 }),
        staffService.getAllStaff(),
        supplierService.getAllSuppliers(),
      ]);

      const reservations = reservationsResponse.reservations || [];
      const payments = paymentsResponse.payments || [];
      setAgents(Array.isArray(staffResponse?.staff) ? staffResponse.staff : (Array.isArray(staffResponse) ? staffResponse : []));
      setSuppliers(Array.isArray(suppliersResponse) ? suppliersResponse : []);

      // Combine reservations with payment data
      const combinedData = reservations.map((reservation: any) => {
        const reservationPayments = payments.filter(
          (p: any) =>
            p.booking_id === reservation.reservation_id ||
            p.booking_id === reservation.id
        );
        const paidAmount = reservationPayments
          .filter((p: any) => p.payment_status === "Completed")
          .reduce((sum: number, p: any) => sum + p.amount, 0);
        const totalAmount = reservation.total_amount || 0;
        const outstandingBalance = Math.max(0, totalAmount - paidAmount);

        // Determine payment status
        let paymentStatus = "Pending";
        if (paidAmount >= totalAmount) {
          paymentStatus = "Fully Paid";
        } else if (paidAmount > 0) {
          paymentStatus =
            outstandingBalance > 0 &&
            new Date(reservation.departure_date) < new Date()
              ? "Overdue"
              : "Partially Paid";
        } else if (
          outstandingBalance > 0 &&
          new Date(reservation.departure_date) < new Date()
        ) {
          paymentStatus = "Overdue";
        }

        // Get last payment
        const lastPayment = reservationPayments
          .filter((p: any) => p.payment_status === "Completed")
          .sort(
            (a: any, b: any) =>
              new Date(b.payment_date).getTime() -
              new Date(a.payment_date).getTime()
          )[0];

        // Calculate profit (assuming 25% margin for now, can be enhanced)
        const supplierCost = totalAmount * 0.75; // 75% supplier cost, 25% profit
        const profit = totalAmount - supplierCost;
        const profitMargin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

        return {
          id: reservation.id, // Use database ID for operations
          reservation_id: reservation.reservation_id || reservation.id, // Display ID
          customer_id: reservation.customer_id,
          customer: reservation.customer || { id: reservation.customer_id, name: reservation.customer?.name || "Unknown Customer" },
          customerName: reservation.customer?.name || "Unknown Customer",
          tripItem: `${reservation.service_type}: ${reservation.destination}`,
          destination: reservation.destination,
          totalAmount,
          paidAmount,
          outstandingBalance,
          paymentStatus,
          invoiceStatus:
            reservation.payment_status === "Paid"
              ? "Paid"
              : reservation.payment_status === "Partial"
              ? "Sent"
              : outstandingBalance > 0 &&
                new Date(reservation.departure_date) < new Date()
              ? "Overdue"
              : "Issued",
          supplierCost,
          profit,
          profitMargin,
          agent: reservation.created_by_user?.full_name || "N/A",
          dueDate: reservation.departure_date,
          lastPayment: lastPayment?.payment_date || null,
          paymentMethod: lastPayment?.payment_method || null,
          invoiceDate: reservation.created_at,
          supplierDueDate: reservation.departure_date, // Can be enhanced with actual supplier due date
          supplierPaid: false, // Can be enhanced with actual supplier payment tracking
          createdAt: reservation.created_at,
        };
      });

      setFinanceData(combinedData);
    } catch (error: any) {
      console.error("Failed to load finance data", error);
      toast.error(
        "Error",
        error.response?.data?.message || "Failed to load finance data"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Fully Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Deposit Paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Issued":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600 dark:text-green-400";
    if (margin >= 20) return "text-blue-600 dark:text-blue-400";
    if (margin >= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleMetricClick = (metricType: string) => {
    setActiveMetricFilter(metricType);
    switch (metricType) {
      case "pending":
        setStatusFilter("Pending");
        break;
      case "overdue":
        setStatusFilter("Overdue");
        break;
      case "ready":
        setStatusFilter("Fully Paid");
        break;
      case "total":
        setStatusFilter("All Status");
        break;
      default:
        setStatusFilter("All Status");
    }
  };

  const handleRecordPayment = async (paymentData: any) => {
    if (!canPerformAction("payments", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to record payments."
      );
      return;
    }

    try {
      // Find the reservation for this booking
      const reservation = financeData.find(
        (b) => b.id === paymentData.bookingId
      );
      if (!reservation) {
        toast.error("Error", "Reservation not found");
        return;
      }

      // Create payment via API - convert IDs to integers
      await paymentService.createPayment({
        booking_id: paymentData.bookingId.toString(),
        customer_id: (paymentData.customerId || reservation.customer).toString(),
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod || paymentData.method,
        payment_status: "Completed",
        payment_date: paymentData.date ? new Date(paymentData.date).toISOString() : new Date().toISOString(),
        notes: paymentData.notes,
      });

      // Reload finance data
      await loadFinanceData();
      toast.success(
        "Payment Recorded",
        "Payment has been successfully recorded and booking updated."
      );
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast.error(
        "Failed to record payment",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleIssueInvoice = async (invoiceData: any) => {
    if (!canPerformAction("finance", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to issue invoices."
      );
      return;
    }

    // The invoice is already created by the modal, just reload the data
    await loadFinanceData();
  };

  const handleSupplierPayment = (bookingId: string) => {
    setFinanceData((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, supplierPaid: true } : booking
      )
    );
    toast.success(
      "Supplier Payment",
      "Supplier payment has been marked as completed."
    );
  };

  const handleViewPayment = (booking: any) => {
    setSelectedBooking(booking);
    setIsViewPaymentModalOpen(true);
  };

  const handleEditPayment = async (payment: any) => {
    if (!canPerformAction("payments", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to edit payments."
      );
      return;
    }
    setSelectedPayment(payment);
    setIsEditPaymentModalOpen(true);
  };

  const handleDeletePayment = async (payment: any) => {
    if (!canPerformAction("payments", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete payments."
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete payment ${payment.payment_id || payment.id}? This action cannot be undone.`)) {
      return;
    }

    try {
      await paymentService.deletePayment(payment.id);
      await loadFinanceData();
      toast.success("Success", "Payment deleted successfully");
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast.error(
        "Error",
        error.response?.data?.message || error.message || "Failed to delete payment"
      );
    }
  };

  const handleUpdatePayment = async () => {
    await loadFinanceData();
  };

  const handleChat = (booking: any) => {
    setSelectedBooking(booking);
    setIsChatModalOpen(true);
  };

  const handleIssueInvoiceClick = (booking: any) => {
    setSelectedBooking(booking);
    setIsIssueInvoiceModalOpen(true);
  };

  const isOverdue = (booking: any) => {
    const dueDate = new Date(booking.dueDate);
    const today = new Date();
    return dueDate < today && booking.outstandingBalance > 0;
  };

  // Filter finance data
  const filteredData = financeData.filter((booking) => {
    // For Customer role, only show their own bookings
    if (userRole === "customer") {
      // Filter by customer_id matching current user's ID
      // This should be handled by the backend API, but adding client-side filter as backup
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      return booking.customer_id === currentUser.id;
    }

    const matchesSearch =
      (booking.customerName || booking.customer?.name || booking.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.reservation_id || booking.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || booking.paymentStatus === statusFilter;
    const matchesAgent =
      agentFilter === "All Agents" || booking.agent === agentFilter;

    let matchesDateRange = true;
    if (dateFromFilter && dateToFilter) {
      const bookingDate = new Date(booking.createdAt);
      const fromDate = new Date(dateFromFilter);
      const toDate = new Date(dateToFilter);
      matchesDateRange = bookingDate >= fromDate && bookingDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesAgent && matchesDateRange;
  });

  // Reset page on filters/search changes
  useEffect(() => {
    resetPage();
  }, [searchTerm, statusFilter, agentFilter, supplierFilter, dateFromFilter, dateToFilter, resetPage]);

  useEffect(() => {
    setTotalFinance(filteredData.length);
  }, [filteredData.length]);

  const visibleFinance =
    filteredData.length === totalFinance
      ? filteredData.slice(offset, offset + perPage)
      : filteredData;

  // Calculate metrics
  const totalPaymentsReceived = financeData.reduce(
    (sum, b) => sum + b.paidAmount,
    0
  );
  const pendingClientPayments = financeData.reduce(
    (sum, b) => sum + b.outstandingBalance,
    0
  );
  const supplierPaymentsDue = financeData
    .filter((b) => !b.supplierPaid)
    .reduce((sum, b) => sum + b.supplierCost, 0);
  const readyForClosure = financeData.filter(
    (b) => b.paymentStatus === "Fully Paid" && b.supplierPaid
  ).length;
  const totalProfit = financeData.reduce((sum, b) => sum + b.profit, 0);
  const totalRevenue = financeData.reduce((sum, b) => sum + b.totalAmount, 0);
  const avgProfitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Accounting Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor payments, invoices, and financial operations
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <RoleGuard module="finance" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </RoleGuard>
          <RoleGuard
            module="reports"
            action="view"
            resource="financial"
            hideIfNoAccess
          >
            <Button
              variant="outline"
              onClick={() => setIsReportsModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </Button>
          </RoleGuard>
          <ActionGuard module="payments" action="create">
            <Button onClick={() => setIsRecordPaymentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeMetricFilter === "total" ? "ring-2 ring-green-500" : ""
          }`}
        >
          <CardContent
            className="p-4"
            onClick={() => handleMetricClick("total")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalPaymentsReceived)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Payments Received
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  This month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
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
                  {formatCurrency(pendingClientPayments)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Client Payments
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Outstanding
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(supplierPaymentsDue)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supplier Payments Due
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Due this week
                </p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

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
                  {readyForClosure}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready for Closure
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Bookings
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgProfitMargin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Profit Margin
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  This month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Deposit Paid</option>
              <option>Partially Paid</option>
              <option>Fully Paid</option>
              <option>Overdue</option>
            </Select>

            <Select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <option>All Agents</option>
              {agents.map((agent: any) => (
                <option key={agent.id} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </Select>

            <Select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option>All Suppliers</option>
              {suppliers.map((supplier: any) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
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
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance Table */}
      <Card>
        <CardContent className="p-0">
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
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Outstanding Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Supplier Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {visibleFinance.map((booking) => (
                  <tr
                    key={booking.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isOverdue(booking) ? "bg-red-50 dark:bg-red-900/10" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {isOverdue(booking) && (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.reservation_id || booking.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.customerName || booking.customer?.name || booking.customer}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        <div className="font-medium">{booking.tripItem}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.outstandingBalance)}
                      </div>
                      {booking.outstandingBalance > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {formatDate(booking.dueDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(
                          booking.invoiceStatus
                        )}`}
                      >
                        {booking.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(booking.supplierCost)}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs ${
                            booking.supplierPaid
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {booking.supplierPaid ? "✓ Paid" : "⏳ Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.profit)}
                      </div>
                      <div
                        className={`text-xs font-medium ${getProfitMarginColor(
                          booking.profitMargin
                        )}`}
                      >
                        {booking.profitMargin}% margin
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewPayment(booking)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Payment Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <ActionGuard module="finance" action="update">
                          <button
                            onClick={() => handleChat(booking)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Internal Chat"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </ActionGuard>
                        <ActionGuard module="finance" action="create">
                          <button
                            onClick={() => handleIssueInvoiceClick(booking)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            title="Issue Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </ActionGuard>
                        {!booking.supplierPaid && (
                          <ActionGuard module="finance" action="update">
                            <button
                              onClick={() => handleSupplierPayment(booking.id)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              title="Mark Supplier Paid"
                            >
                              <CheckCircle className="h-4 w-4" />
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
              total={totalFinance}
              onPageChange={(p) => setPage(p)}
              compact
            />
          </div>
        </CardContent>
      </Card>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No financial records found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or record a new payment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ActionGuard module="payments" action="create">
        <RecordPaymentModal
          isOpen={isRecordPaymentModalOpen}
          onClose={() => setIsRecordPaymentModalOpen(false)}
          onSave={handleRecordPayment}
          bookings={financeData}
        />
      </ActionGuard>

      <ViewPaymentModal
        isOpen={isViewPaymentModalOpen}
        onClose={() => setIsViewPaymentModalOpen(false)}
        booking={selectedBooking}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
        onRefresh={loadFinanceData}
      />

      <ActionGuard module="payments" action="update">
        <EditPaymentModal
          isOpen={isEditPaymentModalOpen}
          onClose={() => setIsEditPaymentModalOpen(false)}
          onSave={handleUpdatePayment}
          payment={selectedPayment}
        />
      </ActionGuard>

      <ActionGuard module="finance" action="create">
        <IssueInvoiceModal
          isOpen={isIssueInvoiceModalOpen}
          onClose={() => setIsIssueInvoiceModalOpen(false)}
          onSave={handleIssueInvoice}
          booking={selectedBooking}
        />
      </ActionGuard>

      <ActionGuard module="finance" action="view">
        <SupplierInvoiceModal
          isOpen={isSupplierInvoiceModalOpen}
          onClose={() => setIsSupplierInvoiceModalOpen(false)}
          booking={selectedBooking}
        />
      </ActionGuard>

      <RoleGuard module="reports" action="view" resource="financial">
        <FinancialReportsModal
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
          financeData={financeData}
        />
      </RoleGuard>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredData}
        filters={{
          statusFilter,
          agentFilter,
          supplierFilter,
          dateFromFilter,
          dateToFilter
        }}
      />

      <ActionGuard module="finance" action="update">
        <InternalChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          booking={selectedBooking}
        />
      </ActionGuard>
    </div>
  );
};
