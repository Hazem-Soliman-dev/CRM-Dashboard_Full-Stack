import React, { useState } from 'react';
import { X, Calendar, Users, TrendingUp, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  sourceData: any[];
}

const bookingsByDestination = [
  { destination: 'Luxor', bookings: 89, percentage: 32 },
  { destination: 'Cairo', bookings: 76, percentage: 27 },
  { destination: 'Aswan', bookings: 54, percentage: 19 },
  { destination: 'Hurghada', bookings: 38, percentage: 14 },
  { destination: 'Sharm El Sheikh', bookings: 23, percentage: 8 },
];

const bookingsByPackageType = [
  { type: 'Individual', bookings: 156, revenue: 189000 },
  { type: 'Family/Group', bookings: 89, revenue: 145000 },
  { type: 'Corporate', bookings: 34, revenue: 98000 },
];

const monthlyBookingTrend = [
  { month: 'Aug', bookings: 156, completed: 142, cancelled: 14 },
  { month: 'Sep', bookings: 172, completed: 158, cancelled: 14 },
  { month: 'Oct', bookings: 164, completed: 151, cancelled: 13 },
  { month: 'Nov', bookings: 185, completed: 169, cancelled: 16 },
  { month: 'Dec', bookings: 198, completed: 182, cancelled: 16 },
  { month: 'Jan', bookings: 182, completed: 165, cancelled: 17 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const BookingsDetailModal: React.FC<BookingsDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  sourceData 
}) => {
  const [viewMode, setViewMode] = useState<'funnel' | 'destination' | 'trend' | 'package'>('funnel');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bookings Analysis
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
                { key: 'funnel', label: 'Conversion Funnel', icon: TrendingUp },
                { key: 'destination', label: 'By Destination', icon: Users },
                { key: 'trend', label: 'Monthly Trend', icon: Calendar },
                { key: 'package', label: 'Package Types', icon: Filter }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key as any)}
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

            {/* Conversion Funnel View */}
            {viewMode === 'funnel' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Conversion Funnel
                  </h3>
                  <div className="space-y-4">
                    {data.map((stage, index) => {
                      const percentage = index === 0 ? 100 : (stage.value / data[0].value) * 100;
                      const conversionRate = index > 0 ? (stage.value / data[index - 1].value) * 100 : 100;
                      return (
                        <div key={stage.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{stage.name}</span>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">{stage.value}</span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {index > 0 && `${conversionRate.toFixed(1)}% conversion`}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: stage.fill
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Source Distribution
                  </h3>
                  <div className="space-y-3">
                    {sourceData.map((source) => (
                      <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{source.count}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{source.value}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Destination View */}
            {viewMode === 'destination' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bookings by Destination
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByDestination}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="destination" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {bookingsByDestination.map((dest) => (
                      <div key={dest.destination} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{dest.destination}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{dest.bookings}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${dest.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trend View */}
            {viewMode === 'trend' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Monthly Booking Trend
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyBookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" name="Total Bookings" />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Package Types View */}
            {viewMode === 'package' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bookings by Package Type
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Package Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Avg. Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {bookingsByPackageType.map((pkg) => (
                        <tr key={pkg.type} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {pkg.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(pkg.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(pkg.revenue / pkg.bookings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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