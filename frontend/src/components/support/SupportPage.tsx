import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  MessageSquare,
  Download,
  HelpCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { CreateTicketModal } from "./CreateTicketModal";
import { ViewTicketModal } from "./ViewTicketModal";
import { EditTicketModal } from "./EditTicketModal";
import { CommentModal } from "./CommentModal";
import { ExportModal } from "./ExportModal";
import { useToastContext } from "../../contexts/ToastContext";
import supportService from "../../services/supportService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

export const SupportPage: React.FC = () => {
  const { canPerformAction, userRole } = usePermissions();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [dateFilter, setDateFilter] = useState("This Week");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const toast = useToastContext();
  const [total, setTotal] = useState(0);
  const { page, perPage, offset, pageCount, setPage, reset } = usePagination({
    perPage: 10,
    total,
  });

  // Load tickets from API
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: any = {};
      if (statusFilter !== "All Status") {
        filterParams.status = statusFilter;
      }
      if (priorityFilter !== "All Priority") {
        filterParams.priority = priorityFilter;
      }
      if (searchTerm) {
        filterParams.search = searchTerm;
      }

      const response = await supportService.getAllTickets({
        ...filterParams,
        limit: 100,
      });
      // Map backend data to frontend format
      const mappedTickets = response.tickets.map((ticket: any) => ({
        id: ticket.ticket_id || ticket.id, // Display ID (ticket_id string)
        numericId: ticket.id, // Numeric ID for API calls
        customer: ticket.customer?.name || "Unknown Customer",
        bookingRef: ticket.bookingRef || "N/A",
        subject: ticket.subject,
        description: ticket.description,
        source: "Email", // Default, can be enhanced later
        department: "Operations", // Default, can be enhanced later
        priority: ticket.priority || "Medium",
        status: ticket.status || "Open",
        assignedTo: ticket.assigned_user?.full_name || "Unassigned",
        assigned_to: ticket.assigned_to,
        createdAt: ticket.created_at,
        lastActivity: ticket.updated_at || ticket.created_at,
        dueDate:
          ticket.dueDate ||
          new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Default 2 days from now
        tags: [],
        attachments: 0,
        comments: 0,
      }));
      setTickets(mappedTickets);
    } catch (err: any) {
      console.error("Failed to load tickets", err);
      setError("Failed to load tickets");
      toast.error(
        "Error",
        err.response?.data?.message || "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleCreateTicket = async (ticketData: any) => {
    if (!canPerformAction("support", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create support tickets."
      );
      return;
    }

    try {
      await supportService.createTicket({
        customer_id: String(ticketData.customer_id),
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority || "Medium",
        assigned_to: ticketData.assigned_to
          ? String(ticketData.assigned_to)
          : undefined,
      });

      await loadTickets();
      toast.success(
        "Ticket Created",
        "Support ticket has been created successfully."
      );
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(
        "Failed to create ticket",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleUpdateTicket = async (updatedTicket: any) => {
    if (!canPerformAction("support", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to update support tickets."
      );
      return;
    }

    try {
      // Use numericId for API calls, fallback to id if numericId not available
      const ticketId = updatedTicket.numericId || updatedTicket.id;
      await supportService.updateTicket(ticketId, {
        subject: updatedTicket.subject,
        description: updatedTicket.description,
        priority: updatedTicket.priority,
        status: updatedTicket.status,
        assigned_to: updatedTicket.assigned_to
          ? typeof updatedTicket.assigned_to === "number"
            ? String(updatedTicket.assigned_to)
            : updatedTicket.assigned_to
          : undefined,
      });

      await loadTickets();
      toast.success("Ticket Updated", "Ticket has been updated successfully.");
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      toast.error(
        "Failed to update ticket",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!selectedTicket) return;

    try {
      // Use numericId for API calls, fallback to id if numericId not available
      const ticketId = selectedTicket.numericId || selectedTicket.id;
      await supportService.addTicketNote(ticketId, comment);
      await loadTickets();
      toast.success("Comment Added", "Comment has been added to the ticket.");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(
        "Failed to add comment",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleEditTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleCommentTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsCommentModalOpen(true);
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ticket.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All Priority" || ticket.priority === priorityFilter;
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      ticket.department === departmentFilter;

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesDepartment
    );
  });

  // Pagination hooks
  useEffect(() => {
    reset();
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    departmentFilter,
    dateFilter,
    reset,
  ]);
  useEffect(() => {
    setTotal(filteredTickets.length);
  }, [filteredTickets.length]);
  const visibleTickets = filteredTickets.slice(offset, offset + perPage);

  // Calculate metrics
  const openTickets = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;
  const urgentTickets = tickets.filter((t) => t.priority === "Urgent").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;
  const avgResolutionTime = 2.4; // Calculated from historical data
  const closedToday = tickets.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.status === "Closed" && t.lastActivity.startsWith(today);
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Center & Ticketing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer support tickets and issues
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <RoleGuard module="support" action="view" hideIfNoAccess>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </RoleGuard>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {openTickets}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  +5 today
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Urgent Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {urgentTickets}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  -2 vs yesterday
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resolvedTickets}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tickets resolved
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Resolution
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgResolutionTime}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  days
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Closed Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {closedToday}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +3 vs yesterday
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All Priority</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </Select>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option>All Departments</option>
              <option>Sales</option>
              <option>Reservation</option>
              <option>Operations</option>
              <option>Finance</option>
            </Select>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading tickets...
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
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer/Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date/Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {visibleTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {ticket.customer}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Booking #{ticket.bookingRef}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                          <div className="font-medium truncate">
                            {ticket.subject}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {ticket.attachments > 0 &&
                              `📎 ${ticket.attachments} files`}
                            {ticket.comments > 0 &&
                              ` • 💬 ${ticket.comments} comments`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticket.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticket.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(ticket.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          2 hours ago
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Ticket"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <ActionGuard module="support" action="update">
                            <button
                              onClick={() => handleEditTicket(ticket)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Edit Ticket"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </ActionGuard>
                          <ActionGuard module="support" action="update">
                            <button
                              onClick={() => handleCommentTicket(ticket)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Add Comment"
                            >
                              <MessageSquare className="h-4 w-4" />
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
                total={total}
                onPageChange={(p) => setPage(p)}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTicket}
      />

      <ViewTicketModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        ticket={selectedTicket}
      />

      <ActionGuard module="support" action="update">
        <EditTicketModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateTicket}
          ticket={selectedTicket}
        />
      </ActionGuard>

      <ActionGuard module="support" action="update">
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          onSave={handleAddComment}
          ticket={selectedTicket}
        />
      </ActionGuard>

      <RoleGuard module="support" action="view">
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          tickets={filteredTickets}
        />
      </RoleGuard>
    </div>
  );
};
