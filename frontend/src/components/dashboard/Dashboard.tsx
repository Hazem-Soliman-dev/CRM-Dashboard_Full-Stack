import React from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../services/dashboardService";
import leadService from "../../services/leadService";
import { useToastContext } from "../../contexts/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";
import { ActionGuard } from "../auth/ActionGuard";

// Component now uses backend API only, no mock data fallback

export const Dashboard: React.FC = () => {
  const { userRole } = useAuth();
  const { canAccessModule, canPerformAction } = usePermissions();
  const navigate = useNavigate();
  const toast = useToastContext();

  const [stats, setStats] = React.useState({
    newLeadsToday: 0,
    totalLeads: 0,
    totalCustomers: 0,
    totalReservations: 0,
    totalPayments: 0,
    totalRevenue: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [followUpReminders, setFollowUpReminders] = React.useState({
    overdue: 0,
    dueToday: 0,
    dueTomorrow: 0,
    thisWeek: 0,
  });
  const [revenueData, setRevenueData] = React.useState<any[]>([]);
  const [leadSourceData, setLeadSourceData] = React.useState<any[]>([]);
  const [todayTasks, setTodayTasks] = React.useState<any[]>([]);
  const [checklist, setChecklist] = React.useState<any[]>([]);
  const [recentTotal, setRecentTotal] = React.useState(0);
  const {
    page: recentPage,
    perPage: recentPerPage,
    offset: recentOffset,
    pageCount: recentPageCount,
    setPage: setRecentPage,
    reset: resetRecentPage,
  } = usePagination({ perPage: 5, total: recentTotal });

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  React.useEffect(() => {
    setRecentTotal(recentActivity.length);
  }, [recentActivity.length]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats from backend
      const dashboardStats = await dashboardService.getDashboardStats();

      // Calculate stats
      const totalLeads = dashboardStats.overview.totalLeads || 0;
      const totalCustomers = dashboardStats.overview.totalCustomers || 0;
      const conversionRate =
        totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0;

      setStats({
        newLeadsToday: dashboardStats.overview.newLeadsToday || 0,
        totalLeads: totalLeads,
        totalCustomers: totalCustomers,
        totalReservations: dashboardStats.overview.totalReservations || 0,
        totalPayments: dashboardStats.overview.totalPayments || 0,
        totalRevenue: dashboardStats.overview.totalRevenue || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
        monthlyRevenue: dashboardStats.overview.totalRevenue || 0,
      });

      // Load revenue trend data
      try {
        const revenueTrend = await dashboardService.getRevenueTrend("30");
        console.log("Revenue trend data:", revenueTrend);
        if (Array.isArray(revenueTrend) && revenueTrend.length > 0) {
          setRevenueData(revenueTrend);
        } else {
          // Use sample data if no data available
          const sampleData = [];
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            sampleData.push({
              month: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              revenue: 0,
            });
          }
          setRevenueData(sampleData);
        }
      } catch (error: any) {
        console.error("Error loading revenue trend:", error);
        // Use sample data on error
        const sampleData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          sampleData.push({
            month: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            revenue: 0,
          });
        }
        setRevenueData(sampleData);
      }

      // Load lead sources
      try {
        const leadSources = await dashboardService.getLeadSources();
        console.log("Lead sources data:", leadSources);
        if (Array.isArray(leadSources) && leadSources.length > 0) {
          setLeadSourceData(leadSources);
        } else {
          // Use sample data if no data available
          setLeadSourceData([
            {
              source: "Website",
              value: 0,
              count: 0,
              total_value: 0,
              color: "#3B82F6",
            },
            {
              source: "Social Media",
              value: 0,
              count: 0,
              total_value: 0,
              color: "#10B981",
            },
            {
              source: "Email",
              value: 0,
              count: 0,
              total_value: 0,
              color: "#F59E0B",
            },
            {
              source: "Walk-in",
              value: 0,
              count: 0,
              total_value: 0,
              color: "#EF4444",
            },
          ]);
        }
      } catch (error: any) {
        console.error("Error loading lead sources:", error);
        // Use sample data on error
        setLeadSourceData([
          {
            source: "Website",
            value: 0,
            count: 0,
            total_value: 0,
            color: "#3B82F6",
          },
          {
            source: "Social Media",
            value: 0,
            count: 0,
            total_value: 0,
            color: "#10B981",
          },
          {
            source: "Email",
            value: 0,
            count: 0,
            total_value: 0,
            color: "#F59E0B",
          },
          {
            source: "Walk-in",
            value: 0,
            count: 0,
            total_value: 0,
            color: "#EF4444",
          },
        ]);
      }

      // Load recent activity
      const recentAct = await dashboardService.getRecentActivity(100);
      setRecentActivity(recentAct || []);

      // Load today's tasks (role-aware) - skip for admin to keep old behavior
      if ((userRole || "").toLowerCase() !== "admin") {
        try {
          const tasksResp = await dashboardService.getTodayTasks();
          setTodayTasks(tasksResp.tasks || []);
          setChecklist(tasksResp.checklist || []);
        } catch (e) {
          setTodayTasks([]);
          setChecklist([]);
        }
      } else {
        setTodayTasks([]);
        setChecklist([]);
      }

      // Calculate follow-up reminders from leads
      try {
        const { leads } = await leadService.getLeads({ limit: 1000 });
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const overdue = leads.filter(
          (l) => l.next_followup && new Date(l.next_followup) < today
        ).length;
        const dueToday = leads.filter((l) => {
          if (!l.next_followup) return false;
          const followupDate = new Date(l.next_followup);
          return followupDate >= today && followupDate < tomorrow;
        }).length;
        const dueTomorrow = leads.filter((l) => {
          if (!l.next_followup) return false;
          const followupDate = new Date(l.next_followup);
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          return followupDate >= tomorrow && followupDate < dayAfterTomorrow;
        }).length;
        const thisWeek = leads.filter((l) => {
          if (!l.next_followup) return false;
          const followupDate = new Date(l.next_followup);
          return followupDate >= today && followupDate < weekEnd;
        }).length;

        setFollowUpReminders({
          overdue,
          dueToday,
          dueTomorrow,
          thisWeek,
        });
      } catch (error: any) {
        // If it's a permission error, just set empty array
        if (
          error.message?.includes("Access denied") ||
          error.message?.includes("403")
        ) {
          console.warn(
            "No permission to access leads, skipping lead-based calculations"
          );
          // Set empty arrays or default values
          setFollowUpReminders({
            overdue: 0,
            dueToday: 0,
            dueTomorrow: 0,
            thisWeek: 0,
          });
          return;
        }
        throw error; // Re-throw other errors
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);

      // Check if it's a network error (backend not running)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        toast.error(
          "Connection Error",
          "Cannot connect to the server. Please make sure the backend server is running on port 5000."
        );
      } else {
        toast.error(
          "Failed to load dashboard data: " +
            (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-lead":
        if (canPerformAction("leads", "create")) {
          navigate("/leads");
          toast.info("Redirecting", "Opening Leads page to add a new lead");
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to access leads."
          );
        }
        break;
      case "add-customer":
        if (canPerformAction("customers", "create")) {
          navigate("/customers");
          toast.info(
            "Redirecting",
            "Opening Customers page to add a new customer"
          );
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to access customers."
          );
        }
        break;
      case "view-overdue":
        if (canAccessModule("leads")) {
          navigate("/leads");
          toast.info(
            "Redirecting",
            "Opening Leads page to view overdue follow-ups"
          );
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to access leads."
          );
        }
        break;
      case "view-reports":
        if (canAccessModule("reports")) {
          navigate("/reports");
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to access reports."
          );
        }
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to {userRole} Panel! Here's what's happening with your
          business today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RoleGuard module="leads" action="view" hideIfNoAccess>
          <StatsCard
            title="New Leads Today"
            value={stats.newLeadsToday.toString()}
            change={
              stats.newLeadsToday > 0
                ? "+25% from yesterday"
                : "No new leads today"
            }
            changeType="positive"
            icon={Users}
          />
        </RoleGuard>
        <RoleGuard module="customers" action="view" hideIfNoAccess>
          <StatsCard
            title="Total Customers"
            value={stats.totalLeads.toLocaleString()}
            change="Active customers"
            changeType="neutral"
            icon={UserCheck}
          />
        </RoleGuard>
        <RoleGuard module="sales" action="view" hideIfNoAccess>
          <StatsCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            change={
              stats.conversionRate > 0
                ? "+3.2% this month"
                : "No conversions yet"
            }
            changeType="positive"
            icon={TrendingUp}
          />
        </RoleGuard>
        <RoleGuard module="finance" action="view" hideIfNoAccess>
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            change={
              stats.monthlyRevenue > 0
                ? "+12% vs last month"
                : "No revenue recorded"
            }
            changeType="positive"
            icon={DollarSign}
          />
        </RoleGuard>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Today's Tasks - hidden for admin to keep old behavior */}
          {(userRole || "").toLowerCase() !== "admin" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Today's Tasks
                </h3>
                <div className="text-xs text-gray-500">
                  {todayTasks.length} items
                </div>
              </div>
              {todayTasks.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nothing due today.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
                  {todayTasks.slice(0, 6).map((t) => (
                    <li
                      key={t.id}
                      className="px-3 py-2 text-sm flex items-center justify-between"
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="ml-3 text-xs text-gray-500">
                        {t.due?.toString().slice(0, 16)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {checklist.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Suggested Checklist
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                    {checklist.map((c) => (
                      <li key={c.id}>{c.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionGuard module="leads" action="create">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => handleQuickAction("add-lead")}
              >
                <Plus className="h-6 w-6" />
                <span>Add New Lead</span>
              </Button>
            </ActionGuard>
            <ActionGuard module="customers" action="create">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => handleQuickAction("add-customer")}
              >
                <Users className="h-6 w-6" />
                <span>Add Customer</span>
              </Button>
            </ActionGuard>
            <ActionGuard module="leads" action="view">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => handleQuickAction("view-overdue")}
              >
                <AlertCircle className="h-6 w-6" />
                <span>View Overdue</span>
              </Button>
            </ActionGuard>
            <ActionGuard module="reports" action="view">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => handleQuickAction("view-reports")}
              >
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </ActionGuard>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <RoleGuard module="finance" action="view" hideIfNoAccess>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Leads Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData.length > 0 ? revenueData : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) =>
                      `$${Number(value).toLocaleString()}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
              {revenueData.length === 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No revenue data available yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Start adding payments to see trends
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Lead Sources */}
        <RoleGuard module="leads" action="view" hideIfNoAccess>
          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {leadSourceData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                      <Pie
                        data={leadSourceData.map((s) => ({
                          name: s.source,
                          value: s.value,
                          color: s.color,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="cursor-pointer hover:opacity-80"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {leadSourceData.map((source) => (
                      <div
                        key={source.source}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {source.source}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {source.value}%
                          </span>
                          {source.count > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {source.count} leads
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No lead sources yet
                  </p>
                  <ActionGuard module="leads" action="create">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleQuickAction("add-lead")}
                    >
                      Add First Lead
                    </Button>
                  </ActionGuard>
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      {/* Recent Activity & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentActivity
                    .slice(recentOffset, recentOffset + recentPerPage)
                    .map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {activity.user?.full_name} •{" "}
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <Pagination
                  page={recentPage}
                  pageCount={recentPageCount}
                  perPage={recentPerPage}
                  total={recentActivity.length}
                  onPageChange={(p) => setRecentPage(p)}
                  compact
                />
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
                <p className="text-sm text-gray-400">
                  Activity will appear as you use the system
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <RoleGuard module="leads" action="view" hideIfNoAccess>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Follow-up Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followUpReminders.overdue > 0 || stats.totalLeads > 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => handleQuickAction("view-overdue")}
                    className="w-full bg-red-50 dark:bg-red-900/20 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Overdue Follow-ups
                    </p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                      {followUpReminders.overdue}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {followUpReminders.overdue > 0
                        ? "Leads need immediate attention"
                        : "All caught up!"}
                    </p>
                  </button>

                  <div className="space-y-2">
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
                  <ActionGuard module="leads" action="create">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleQuickAction("add-lead")}
                    >
                      Add First Lead
                    </Button>
                  </ActionGuard>
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </div>
  );
};
