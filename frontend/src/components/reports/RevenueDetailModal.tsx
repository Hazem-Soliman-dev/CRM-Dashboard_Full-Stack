import React, { useState } from 'react';
import { X, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RevenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  metric: string;
}

const revenueByCategory = [
  { category: 'Hotels', revenue: 125000, percentage: 44, growth: 12.5 },
  { category: 'Tours', revenue: 89000, percentage: 31, growth: 8.2 },
  { category: 'Flights', revenue: 45000, percentage: 16, growth: -2.1 },
  { category: 'Activities', revenue: 25500, percentage: 9, growth: 15.8 },
];

const dailyRevenueData = [
  { date: '2025-01-01', revenue: 12500, bookings: 8 },
  { date: '2025-01-02', revenue: 15200, bookings: 12 },
  { date: '2025-01-03', revenue: 9800, bookings: 6 },
  { date: '2025-01-04', revenue: 18900, bookings: 15 },
  { date: '2025-01-05', revenue: 22100, bookings: 18 },
  { date: '2025-01-06', revenue: 16700, bookings: 11 },
  { date: '2025-01-07', revenue: 19400, bookings: 14 },
];

export const RevenueDetailModal: React.FC<RevenueDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
}) => {
  const [viewMode, setViewMode] = useState<'trend' | 'category' | 'daily'>('trend');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Revenue Analysis
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
            {/* View Mode Tabs */}
            <div className="flex space-x-1 mb-6">
              {[
                { key: 'trend', label: 'Revenue Trend', icon: TrendingUp },
                { key: 'category', label: 'By Category', icon: BarChart3 },
                { key: 'daily', label: 'Daily Breakdown', icon: Calendar }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key as 'trend' | 'category' | 'daily')}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      viewMode === tab.key
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Revenue Trend View */}
            {viewMode === 'trend' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Revenue Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category View */}
            {viewMode === 'category' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Revenue by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="revenue" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Category Performance
                    </h3>
                    {revenueByCategory.map((category) => (
                      <div key={category.category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{category.category}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(category.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{category.percentage}% of total</span>
                          <span className={`text-sm font-medium ${
                            category.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {category.growth >= 0 ? '+' : ''}{category.growth}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Daily View */}
            {viewMode === 'daily' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Daily Revenue Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value as number) : value,
                          name === 'revenue' ? 'Revenue' : 'Bookings'
                        ]}
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
                    </BarChart>
                  </ResponsiveContainer>
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