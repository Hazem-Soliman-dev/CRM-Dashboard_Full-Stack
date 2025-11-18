import React, { useState } from 'react';
import { X, TrendingUp, Download, Calendar, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { formatCurrency, formatDate } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { exportFinancialReport } from '../../services/exportService';
import { useToastContext } from '../../contexts/ToastContext';

interface FinancialReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  financeData: any[];
}

const monthlyRevenueData = [
  { month: 'Oct', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'Nov', revenue: 52000, expenses: 38000, profit: 14000 },
  { month: 'Dec', revenue: 48000, expenses: 35000, profit: 13000 },
  { month: 'Jan', revenue: 61000, expenses: 42000, profit: 19000 },
];

const profitByServiceData = [
  { name: 'Hotels', value: 35, color: '#3B82F6' },
  { name: 'Flights', value: 25, color: '#10B981' },
  { name: 'Tours', value: 20, color: '#F59E0B' },
  { name: 'Packages', value: 15, color: '#EF4444' },
  { name: 'Activities', value: 5, color: '#8B5CF6' }
];

const agentPerformanceData = [
  { agent: 'Sarah Johnson', bookings: 24, revenue: 28500, profit: 7125 },
  { agent: 'Mike Chen', bookings: 18, revenue: 22000, profit: 5500 },
  { agent: 'Lisa Rodriguez', bookings: 21, revenue: 25200, profit: 6300 },
  { agent: 'David Wilson', bookings: 15, revenue: 18000, profit: 4500 },
  { agent: 'Emma Davis', bookings: 12, revenue: 15800, profit: 3950 }
];

export const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({ 
  isOpen, 
  onClose, 
  financeData 
}) => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const toast = useToastContext();

  const handleExportReport = async () => {
    try {
      setIsExporting(true);

      // Map report type to backend format
      const backendReportType = reportType === 'agent' ? 'agent-performance' : 
                                reportType === 'outstanding' ? 'outstanding-balances' : 
                                reportType;

      const filters = {
        dateRange: dateRange === 'custom' ? { start: startDate, end: endDate } : dateRange,
        reportType: backendReportType
      };

      await exportFinancialReport(backendReportType, filters, exportFormat);
      toast.showToast('Report exported successfully', 'success');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.showToast(error?.response?.data?.message || 'Failed to export report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const totalRevenue = financeData.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalExpenses = financeData.reduce((sum, b) => sum + b.supplierCost, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Financial Reports
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Report Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="overview">Financial Overview</option>
                  <option value="profit">Profit Analysis</option>
                  <option value="agent">Agent Performance</option>
                  <option value="outstanding">Outstanding Balances</option>
                </Select>

                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </Select>

                {dateRange === 'custom' && (
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-auto"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'excel' | 'pdf' | 'csv')}
                  className="w-auto"
                >
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </Select>
                <Button onClick={handleExportReport} disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>
              </div>
            </div>

            {/* Financial Overview */}
            {reportType === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                          {formatCurrency(totalExpenses)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Profit</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {formatCurrency(totalProfit)}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Profit Margin</p>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                          {profitMargin.toFixed(1)}%
                        </p>
                      </div>
                      <PieChart className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Revenue vs Expenses
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Bar dataKey="profit" fill="#10B981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Profit Analysis */}
            {reportType === 'profit' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profit by Service Type
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <RechartsPieChart data={profitByServiceData}>
                        {profitByServiceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profit Breakdown
                  </h3>
                  <div className="space-y-4">
                    {profitByServiceData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Agent Performance */}
            {reportType === 'agent' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Agent Performance Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Agent
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
                          Avg. Booking Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Profit Margin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {agentPerformanceData.map((agent) => (
                        <tr key={agent.agent} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {agent.agent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {agent.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(agent.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(agent.profit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(agent.revenue / agent.bookings)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                            {((agent.profit / agent.revenue) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Outstanding Balances */}
            {reportType === 'outstanding' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue Payments</p>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                          {formatCurrency(financeData.filter(b => b.paymentStatus === 'Overdue').reduce((sum, b) => sum + b.outstandingBalance, 0))}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                          {formatCurrency(financeData.filter(b => b.outstandingBalance > 0 && b.paymentStatus !== 'Overdue').reduce((sum, b) => sum + b.outstandingBalance, 0))}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Collection Rate</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {((financeData.reduce((sum, b) => sum + b.paidAmount, 0) / totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Outstanding Balances by Customer
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Days Overdue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {financeData.filter(b => b.outstandingBalance > 0).map((booking) => {
                          const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(booking.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                          return (
                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {booking.customer}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {booking.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                                {formatCurrency(booking.outstandingBalance)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(booking.dueDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {daysOverdue > 0 ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    {daysOverdue} days
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};