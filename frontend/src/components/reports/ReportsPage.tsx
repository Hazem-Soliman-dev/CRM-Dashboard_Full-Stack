import React, { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Eye,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { RevenueDetailModal } from "./RevenueDetailModal";
import { BookingsDetailModal } from "./BookingsDetailModal";
import { StaffPerformanceModal } from "./StaffPerformanceModal";
import { ExportModal } from "./ExportModal";
import {
  exportReportExcel,
  exportReportPdf,
} from "../../services/exportService";
import { ReportBuilderModal } from "./ReportBuilderModal";

const revenueData = [
  { month: "Aug", revenue: 245000, bookings: 156, profit: 61250 },
  { month: "Sep", revenue: 268000, bookings: 172, profit: 67000 },
  { month: "Oct", revenue: 252000, bookings: 164, profit: 63000 },
  { month: "Nov", revenue: 289000, bookings: 185, profit: 72250 },
  { month: "Dec", revenue: 312000, bookings: 198, profit: 78000 },
  { month: "Jan", revenue: 284500, bookings: 182, profit: 71125 },
];

const bookingSourceData = [
  { name: "Website", value: 45, count: 324, color: "#3B82F6" },
  { name: "Social Media", value: 25, count: 180, color: "#10B981" },
  { name: "Agent", value: 20, count: 144, color: "#F59E0B" },
  { name: "Walk-in", value: 10, count: 72, color: "#EF4444" },
];

const conversionFunnelData = [
  { name: "Leads", value: 1247, fill: "#3B82F6" },
  { name: "Quotations", value: 856, fill: "#10B981" },
  { name: "Bookings", value: 542, fill: "#F59E0B" },
  { name: "Completed", value: 489, fill: "#8B5CF6" },
];

const topSellingItems = [
  {
    item: "Steigenberger Luxor Hotel",
    category: "Hotel",
    bookings: 42,
    revenue: 58400,
    profit: 14200,
  },
  {
    item: "Valley of Kings Tour",
    category: "Tour",
    bookings: 38,
    revenue: 22800,
    profit: 6800,
  },
  {
    item: "Cairo Flight Package",
    category: "Flight",
    bookings: 35,
    revenue: 42000,
    profit: 6300,
  },
  {
    item: "Nile Cruise 4 Days",
    category: "Package",
    bookings: 28,
    revenue: 39200,
    profit: 11800,
  },
  {
    item: "Hurghada Diving",
    category: "Activity",
    bookings: 24,
    revenue: 18000,
    profit: 7200,
  },
];

const paymentStatusData = [
  { status: "Paid", amount: 198400, percentage: 70, color: "#10B981" },
  { status: "Partially Paid", amount: 61300, percentage: 22, color: "#F59E0B" },
  { status: "Overdue", amount: 24800, percentage: 8, color: "#EF4444" },
];

const staffPerformanceData = [
  {
    name: "Ahmed (Sales)",
    conversion: 85,
    confirmed: 98,
    onTime: 92,
    avgHandling: "2.1 days",
  },
  {
    name: "Fatma (Reservation)",
    conversion: 88,
    confirmed: 96,
    onTime: 95,
    avgHandling: "1.8 days",
  },
  {
    name: "Omar (Operations)",
    conversion: 92,
    confirmed: 99,
    onTime: 88,
    avgHandling: "2.5 days",
  },
  {
    name: "Nour (Finance)",
    conversion: 95,
    confirmed: 97,
    onTime: 94,
    avgHandling: "2.1 days",
  },
];

const recentReports = [
  {
    name: "Monthly Revenue Report",
    type: "PDF",
    generated: "2025-01-15",
    size: "2.4 MB",
  },
  {
    name: "Client Analysis",
    type: "Excel",
    generated: "2025-01-14",
    size: "1.8 MB",
  },
  {
    name: "Supplier Performance",
    type: "PDF",
    generated: "2025-01-13",
    size: "3.1 MB",
  },
  {
    name: "Staff Performance Review",
    type: "Excel",
    generated: "2025-01-12",
    size: "1.2 MB",
  },
];

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("This Month");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [chartPeriod, setChartPeriod] = useState("Monthly");

  // Modal states
  const [isRevenueDetailOpen, setIsRevenueDetailOpen] = useState(false);
  const [isBookingsDetailOpen, setIsBookingsDetailOpen] = useState(false);
  const [isStaffPerformanceOpen, setIsStaffPerformanceOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReportBuilderOpen, setIsReportBuilderOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  // Calculate current metrics
  const currentMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const revenueChange =
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100;
  const bookingsChange =
    ((currentMonth.bookings - previousMonth.bookings) /
      previousMonth.bookings) *
    100;

  const totalClients = 2847;
  const clientsChange = 15.3;
  const totalProfit = currentMonth.profit;
  const profitChange = 9.7;
  const outstandingBalance = 24800;
  const outstandingChange = -31;
  const conversionRate = 68;
  const conversionChange = 2.3;

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
    switch (metric) {
      case "revenue":
        setIsRevenueDetailOpen(true);
        break;
      case "bookings":
        setIsBookingsDetailOpen(true);
        break;
      case "clients":
        // Navigate to customers page with filter
        console.log("Navigate to customers page");
        break;
      case "profit":
        setIsRevenueDetailOpen(true);
        break;
      case "outstanding":
        // Navigate to finance page with overdue filter
        console.log("Navigate to finance page with overdue filter");
        break;
      case "conversion":
        setIsBookingsDetailOpen(true);
        break;
    }
  };

  const handleSourceClick = (source: string) => {
    setSourceFilter(source);
    // Apply filter to all charts and data
  };

  const handleConversionStageClick = (stage: string) => {
    console.log(`Navigate to ${stage} pipeline`);
    // Navigate to appropriate page with filter
  };

  const handleTopItemClick = (item: any) => {
    console.log("View item performance trends:", item);
    // Open item performance modal
  };

  const handlePaymentStatusClick = (status: string) => {
    console.log(`Navigate to finance page with ${status} filter`);
    // Navigate to finance page with payment status filter
  };

  const handleStaffClick = (staff: any) => {
    setIsStaffPerformanceOpen(true);
  };

  const getReportIdFromName = (name: string) => {
    if (name === "Monthly Revenue Report") return "monthly-revenue";
    if (name === "Client Analysis") return "client-analysis";
    if (name === "Supplier Performance") return "supplier-performance";
    if (name === "Staff Performance Review") return "staff-performance";
    return "monthly-revenue";
  };

  const handleReportDownload = async (report: any) => {
    const id = getReportIdFromName(report.name);
    if (report.type === "PDF") {
      await exportReportPdf(id);
    } else if (report.type === "Excel") {
      const filters = {
        dateRange,
        category: categoryFilter,
        agent: agentFilter,
        source: sourceFilter,
      };
      await exportReportExcel(id, filters);
    }
  };

  const handleExportPDF = async () => {
    try {
      const reportId = "monthly-revenue";
      const filters = {
        dateRange,
        category: categoryFilter !== 'All Categories' ? categoryFilter : undefined,
        agent: agentFilter !== 'All Agents' ? agentFilter : undefined,
        source: sourceFilter !== 'All Sources' ? sourceFilter : undefined,
      };
      await exportReportPdf(reportId, filters);
    } catch (error: any) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const reportId = "monthly-revenue";
      const filters = {
        dateRange,
        category: categoryFilter !== 'All Categories' ? categoryFilter : undefined,
        agent: agentFilter !== 'All Agents' ? agentFilter : undefined,
        source: sourceFilter !== 'All Sources' ? sourceFilter : undefined,
      };
      await exportReportExcel(reportId, filters);
    } catch (error: any) {
      console.error('Excel export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </Select>
          <ActionGuard module="reports" action="view">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </ActionGuard>
          <ActionGuard module="reports" action="view">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <RoleGuard module="finance" action="view" hideIfNoAccess>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick("revenue")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg mb-2">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentMonth.revenue)}
                  </p>
                  <p
                    className={`text-xs ${
                      revenueChange >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    } mt-1`}
                  >
                    {revenueChange >= 0 ? "+" : ""}
                    {revenueChange.toFixed(1)}% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard module="reservations" action="view" hideIfNoAccess>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick("bookings")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg mb-2">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentMonth.bookings}
                  </p>
                  <p
                    className={`text-xs ${
                      bookingsChange >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    } mt-1`}
                  >
                    {bookingsChange >= 0 ? "+" : ""}
                    {bookingsChange.toFixed(1)}% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("clients")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg mb-2">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalClients.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    clientsChange >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  } mt-1`}
                >
                  +{clientsChange}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RoleGuard module="finance" action="view" hideIfNoAccess>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick("profit")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg mb-2">
                    <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Profit
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalProfit)}
                  </p>
                  <p
                    className={`text-xs ${
                      profitChange >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    } mt-1`}
                  >
                    +{profitChange}% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard module="finance" action="view" hideIfNoAccess>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMetricClick("outstanding")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg mb-2">
                    <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Outstanding
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(outstandingBalance)}
                  </p>
                  <p
                    className={`text-xs ${
                      outstandingChange >= 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    } mt-1`}
                  >
                    {outstandingChange}% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("conversion")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg mb-2">
                  <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversionRate}%
                </p>
                <p
                  className={`text-xs ${
                    conversionChange >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  } mt-1`}
                >
                  +{conversionChange}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {report.type} • {report.size}
                    </p>
                    <p className="text-xs text-gray-400">
                      Generated {formatDate(report.generated)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleReportDownload(report)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Download Report"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Global Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Global Filters:
                  </span>
                </div>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All Categories</option>
                  <option>Hotel</option>
                  <option>Tour</option>
                  <option>Flight</option>
                  <option>Package</option>
                  <option>Activity</option>
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
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option>All Sources</option>
                  <option>Website</option>
                  <option>Social Media</option>
                  <option>Agent</option>
                  <option>Walk-in</option>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setIsReportBuilderOpen(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <RoleGuard module="finance" action="view" hideIfNoAccess>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue Trend</CardTitle>
                  <div className="flex space-x-2">
                    {["Monthly", "Quarterly", "Yearly"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          chartPeriod === period
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Bookings Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <RechartsPieChart data={bookingSourceData}>
                      {bookingSourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => handleSourceClick(entry.name)}
                        />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {bookingSourceData.map((source) => (
                    <button
                      key={source.name}
                      onClick={() => handleSourceClick(source.name)}
                      className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {source.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.value}%
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {source.count} bookings
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => {
                    const percentage =
                      index === 0
                        ? 100
                        : (stage.value / conversionFunnelData[0].value) * 100;
                    return (
                      <button
                        key={stage.name}
                        onClick={() => handleConversionStageClick(stage.name)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {stage.name}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {stage.value}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: stage.fill,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {topSellingItems.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleTopItemClick(item)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.item}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.bookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(item.profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopItemClick(item);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Performance Trends"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentStatusData.map((status) => (
                  <button
                    key={status.status}
                    onClick={() => handlePaymentStatusClick(status.status)}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {status.status}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(status.amount)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ({status.percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${status.percentage}%`,
                          backgroundColor: status.color,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Confirmation Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        On-Time Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Handling Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {staffPerformanceData.map((staff, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleStaffClick(staff)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {staff.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                staff.conversion >= 90
                                  ? "text-green-600 dark:text-green-400"
                                  : staff.conversion >= 80
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {staff.conversion}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              staff.confirmed >= 95
                                ? "text-green-600 dark:text-green-400"
                                : staff.confirmed >= 90
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {staff.confirmed}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              staff.onTime >= 95
                                ? "text-green-600 dark:text-green-400"
                                : staff.onTime >= 90
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {staff.onTime}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {staff.avgHandling}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStaffClick(staff);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Performance Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ActionGuard module="reports" action="view">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsReportBuilderOpen(true)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Custom Report Builder
                  </Button>
                </ActionGuard>
                <RoleGuard module="finance" action="view" hideIfNoAccess>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsRevenueDetailOpen(true)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Analysis
                  </Button>
                </RoleGuard>
                <RoleGuard module="users" action="view" hideIfNoAccess>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsStaffPerformanceOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Staff Performance
                  </Button>
                </RoleGuard>
                <ActionGuard module="reports" action="view">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExportExcel}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </ActionGuard>
              </div>
            </CardContent>
          </Card>

          {/* KPI Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>KPI Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Revenue Spike
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Revenue increased by 12.5% this week
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Conversion Goal
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    68% conversion rate - 2% above target
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Seasonal Trend
                    </span>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Peak season approaching - prepare inventory
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RoleGuard module="finance" action="view">
        <RevenueDetailModal
          isOpen={isRevenueDetailOpen}
          onClose={() => setIsRevenueDetailOpen(false)}
          data={revenueData}
          metric={selectedMetric}
        />
      </RoleGuard>

      <RoleGuard module="reservations" action="view">
        <BookingsDetailModal
          isOpen={isBookingsDetailOpen}
          onClose={() => setIsBookingsDetailOpen(false)}
          data={conversionFunnelData}
          sourceData={bookingSourceData}
        />
      </RoleGuard>

      <RoleGuard module="users" action="view">
        <StaffPerformanceModal
          isOpen={isStaffPerformanceOpen}
          onClose={() => setIsStaffPerformanceOpen(false)}
          data={staffPerformanceData}
        />
      </RoleGuard>

      <ActionGuard module="reports" action="view">
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          filters={{ dateRange, categoryFilter, agentFilter, sourceFilter }}
          reportId="monthly-revenue"
        />
      </ActionGuard>

      <ActionGuard module="reports" action="view">
        <ReportBuilderModal
          isOpen={isReportBuilderOpen}
          onClose={() => setIsReportBuilderOpen(false)}
        />
      </ActionGuard>
    </div>
  );
};
