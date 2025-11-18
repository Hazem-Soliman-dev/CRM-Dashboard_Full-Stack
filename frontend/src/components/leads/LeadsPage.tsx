import React, { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  MessageSquare,
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import leadService from "../../services/leadService";
import { useToastContext } from "../../contexts/ToastContext";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { AddLeadModal } from "./AddLeadModal";
import { ViewLeadModal } from "./ViewLeadModal";
import { EditLeadModal } from "./EditLeadModal";
import { MessageModal } from "./MessageModal";
import { OverdueLeadsModal } from "./OverdueLeadsModal";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";
import supportService from "../../services/supportService";
import customerService from "../../services/customerService";

export const LeadsPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [leadSourceData, setLeadSourceData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    newToday: 0,
    total: 0,
    conversionRate: 0,
  });
  const [followUpReminders, setFollowUpReminders] = useState({
    overdue: 0,
    dueToday: 0,
    dueTomorrow: 0,
    thisWeek: 0,
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const toast = useToastContext();
  const { addNotification } = useNotificationContext();
  const [totalLeads, setTotalLeads] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalLeads });

  const loadLeads = React.useCallback(async () => {
    try {
      setLoading(true);

      // Load leads from backend API
      const { leads: leadsData } = await leadService.getAllLeads({
        limit: 100,
        source: sourceFilter !== "All Sources" ? sourceFilter : undefined,
        type: typeFilter !== "All Types" ? typeFilter : undefined,
        status: statusFilter !== "All Status" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      setLeads(leadsData);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const newToday = leadsData.filter((l: any) =>
        l.created_at.startsWith(today)
      ).length;

      // Calculate lead sources
      const sources = leadsData.reduce((acc: any, lead: any) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {});

      const total = leadsData.length;
      const sourceData = Object.entries(sources).map(
        ([source, count]: [string, any]) => ({
          source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          color: getSourceColor(source),
        })
      );

      setLeadSourceData(sourceData);
      setStats({
        newToday,
        total,
        conversionRate: total > 0 ? Math.round((newToday / total) * 100) : 0,
      });

      // Calculate follow-up reminders
      const now = new Date();
      const today_date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const tomorrow = new Date(today_date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekFromNow = new Date(today_date);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const overdue = leadsData.filter(
        (l: any) => l.next_followup && new Date(l.next_followup) < today_date
      ).length;
      const dueToday = leadsData.filter((l: any) => {
        if (!l.next_followup) return false;
        const followupDate = new Date(l.next_followup);
        return followupDate >= today_date && followupDate < tomorrow;
      }).length;
      const dueTomorrow = leadsData.filter((l: any) => {
        if (!l.next_followup) return false;
        const followupDate = new Date(l.next_followup);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return followupDate >= tomorrow && followupDate < dayAfterTomorrow;
      }).length;
      const thisWeek = leadsData.filter((l: any) => {
        if (!l.next_followup) return false;
        const followupDate = new Date(l.next_followup);
        return followupDate >= today_date && followupDate < weekFromNow;
      }).length;

      setFollowUpReminders({
        overdue,
        dueToday,
        dueTomorrow,
        thisWeek,
      });
    } catch (error: any) {
      console.error("Error loading leads:", error);
      toast.error(
        "Failed to load leads: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter, typeFilter, statusFilter, searchTerm]);

  React.useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      Website: "bg-blue-500",
      "Social Media": "bg-green-500",
      Email: "bg-yellow-500",
      "Walk-in": "bg-red-500",
      Referral: "bg-purple-500",
      "Cold Call": "bg-orange-500",
    };
    return colors[source] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Contacted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Qualified":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Proposal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Negotiation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "Closed Won":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Closed Lost":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleAddLead = async (leadData: any) => {
    if (!canPerformAction("leads", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to create leads."
      );
      return;
    }

    try {
      const newLead = await leadService.createLead(leadData);
      setLeads((prev) => [newLead, ...prev]);
      toast.success("Lead Added", "New lead has been created successfully.");

      // Add notification
      addNotification({
        type: "lead",
        title: "New Lead Created",
        message: `Lead ${leadData.name} has been added to the system`,
        entityId: newLead.id,
      });

      loadLeads(); // Refresh data
    } catch (error: any) {
      console.error("Error adding lead:", error);
      toast.error(
        "Failed to add lead: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleUpdateLead = async (updatedLead: any) => {
    if (!canPerformAction("leads", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to update leads."
      );
      return;
    }

    try {
      await leadService.updateLead(updatedLead.id, updatedLead);
      await loadLeads(); // Refresh data from server
      toast.success(
        "Lead Updated",
        "Lead information has been updated successfully."
      );
    } catch (error: any) {
      console.error("Error updating lead:", error);
      toast.error(
        "Failed to update lead: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSendMessage = async (
    message: string,
    type: "message" | "note"
  ) => {
    if (!selectedLead) return;

    try {
      // Update lead notes with the message
      const currentNotes = selectedLead.notes || "";
      const timestamp = new Date().toLocaleString();
      const messagePrefix = type === "message" ? "Message" : "Note";
      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n[${messagePrefix} - ${timestamp}]: ${message}`
        : `[${messagePrefix} - ${timestamp}]: ${message}`;

      await leadService.updateLead(selectedLead.id, {
        notes: updatedNotes,
      });

      await loadLeads();
      toast.success(
        "Message Sent",
        `${messagePrefix} has been saved successfully.`
      );

      // Additionally: create an individual support ticket for this lead message
      try {
        // Ensure a customer exists to associate the ticket
        let customerId: string | undefined;
        try {
          const customers = await customerService.getAllCustomers({
            search: selectedLead.email,
            limit: 1,
          });
          if (customers.customers && customers.customers.length > 0) {
            customerId = customers.customers[0].id;
          } else {
            const newCustomer = await customerService.createCustomer({
              name: selectedLead.name,
              email: selectedLead.email,
              phone: selectedLead.phone,
              company: selectedLead.company,
              type: selectedLead.type === "B2B" ? "Corporate" : "Individual",
            });
            customerId = newCustomer.id;
          }
        } catch (e) {
          // If customer lookup/creation fails, skip ticket creation but notify
          console.error("Customer lookup/creation failed for ticket:", e);
        }

        if (customerId) {
          const subjectBase =
            message.length > 80 ? `${message.slice(0, 77)}...` : message;
          const ticket = await supportService.createTicket({
            customer_id: customerId,
            subject: `Lead message: ${selectedLead.name} - ${subjectBase}`,
            description: message,
            priority: "Medium",
            assigned_to: selectedLead.agent_id,
          });
          toast.success(
            "Ticket Created",
            `Support ticket ${ticket.ticket_id || ticket.id} created for this message.`
          );
        } else {
          toast.info(
            "Ticket Skipped",
            "Could not link to a customer; ticket was not created."
          );
        }
      } catch (ticketError: any) {
        console.error("Error creating support ticket:", ticketError);
        toast.error(
          "Ticket Error",
          ticketError?.response?.data?.message || "Failed to create support ticket"
        );
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(
        "Failed to send message",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEditLead = (lead: any) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleMessageLead = (lead: any) => {
    setSelectedLead(lead);
    setIsMessageModalOpen(true);
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesSource =
      sourceFilter === "All Sources" || lead.source === sourceFilter;
    const matchesType = typeFilter === "All Types" || lead.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || lead.status === statusFilter;
    const matchesAgent =
      agentFilter === "All Agents" || lead.agent?.full_name === agentFilter;

    return (
      matchesSearch &&
      matchesSource &&
      matchesType &&
      matchesStatus &&
      matchesAgent
    );
  });

  React.useEffect(() => {
    resetPage();
  }, [searchTerm, sourceFilter, typeFilter, statusFilter, agentFilter, resetPage]);

  React.useEffect(() => {
    setTotalLeads(filteredLeads.length);
  }, [filteredLeads.length]);

  const visibleLeads =
    filteredLeads.length === totalLeads
      ? filteredLeads.slice(offset, offset + perPage)
      : filteredLeads;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leads Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your sales leads
          </p>
        </div>
        <ActionGuard module="leads" action="create">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </ActionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      New Leads Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.newToday}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {stats.newToday > 0
                        ? "+25% from yesterday"
                        : "No new leads today"}
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
                      Total Leads
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Active pipeline
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.conversionRate}%
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {stats.conversionRate > 0
                        ? "+3.2% this month"
                        : "No conversions yet"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option>All Sources</option>
                  <option>Website</option>
                  <option>Social Media</option>
                  <option>Email</option>
                  <option>Walk-in</option>
                  <option>Referral</option>
                </Select>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>B2B</option>
                  <option>B2C</option>
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                  <option>Closed Won</option>
                  <option>Closed Lost</option>
                </Select>
                <Select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <option>All Agents</option>
                  <option>Sarah Johnson</option>
                  <option>Mike Chen</option>
                  <option>Lisa Rodriguez</option>
                  <option>David Wilson</option>
                  <option>Emma Davis</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardContent className="p-0">
              {filteredLeads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lead ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Source
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
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Follow Up
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {visibleLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {lead.lead_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {lead.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              <div>{lead.email}</div>
                              <div>{lead.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {lead.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {lead.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {lead.agent?.full_name || "Unassigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(lead.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {lead.last_contact
                              ? formatDate(lead.last_contact)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewLead(lead)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <ActionGuard module="leads" action="update">
                                <button
                                  onClick={() => handleEditLead(lead)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  title="Edit Lead"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </ActionGuard>
                              <ActionGuard module="leads" action="update">
                                <button
                                  onClick={() => handleMessageLead(lead)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                  title="Send Message"
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
                    total={totalLeads}
                    onPageChange={(p) => setPage(p)}
                    compact
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No leads found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {leads.length === 0
                      ? "Get started by adding your first lead."
                      : "Try adjusting your search criteria."}
                  </p>
                  <ActionGuard module="leads" action="create">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lead
                    </Button>
                  </ActionGuard>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leads by Source */}
          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {leadSourceData.length > 0 ? (
                <div className="space-y-4">
                  {leadSourceData.map((item) => (
                    <div key={item.source}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.source}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.percentage}%
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.count} leads
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No lead sources yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Follow-up Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followUpReminders.overdue > 0 || stats.total > 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsOverdueModalOpen(true)}
                    className="w-full bg-red-50 dark:bg-red-900/20 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        Overdue Follow-ups
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                      {followUpReminders.overdue}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                      {followUpReminders.overdue > 0
                        ? "Leads need immediate attention"
                        : "All caught up!"}
                    </p>
                  </button>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Due Today
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {followUpReminders.dueToday}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Due Tomorrow
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {followUpReminders.dueTomorrow}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        This Week
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {followUpReminders.thisWeek}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No follow-ups scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ActionGuard module="leads" action="create">
        <AddLeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddLead}
        />
      </ActionGuard>

      <ViewLeadModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        lead={selectedLead}
        onUpdate={handleUpdateLead}
      />

      <ActionGuard module="leads" action="update">
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateLead}
          lead={selectedLead}
        />
      </ActionGuard>

      <ActionGuard module="leads" action="update">
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          onSend={handleSendMessage}
          lead={selectedLead}
        />
      </ActionGuard>

      <OverdueLeadsModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
      />
    </div>
  );
};
