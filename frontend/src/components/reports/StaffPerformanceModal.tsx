import React, { useState } from 'react';
import { X, Users, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaffPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

const detailedStaffData = [
  {
    name: 'Ahmed (Sales)',
    department: 'Sales',
    conversion: 85,
    confirmed: 98,
    onTime: 92,
    avgHandling: 2.1,
    totalBookings: 45,
    revenue: 89500,
    customerSatisfaction: 4.8
  },
  {
    name: 'Fatma (Reservation)',
    department: 'Reservation',
    conversion: 88,
    confirmed: 96,
    onTime: 95,
    avgHandling: 1.8,
    totalBookings: 52,
    revenue: 76200,
    customerSatisfaction: 4.9
  },
  {
    name: 'Omar (Operations)',
    department: 'Operations',
    conversion: 92,
    confirmed: 99,
    onTime: 88,
    avgHandling: 2.5,
    totalBookings: 38,
    revenue: 45800,
    customerSatisfaction: 4.7
  },
  {
    name: 'Nour (Finance)',
    department: 'Finance',
    conversion: 95,
    confirmed: 97,
    onTime: 94,
    avgHandling: 2.1,
    totalBookings: 28,
    revenue: 34200,
    customerSatisfaction: 4.6
  }
];

const departmentPerformance = [
  { department: 'Sales', efficiency: 87, satisfaction: 4.8, revenue: 189500 },
  { department: 'Reservation', efficiency: 93, satisfaction: 4.9, revenue: 156200 },
  { department: 'Operations', efficiency: 89, satisfaction: 4.7, revenue: 98800 },
  { department: 'Finance', efficiency: 91, satisfaction: 4.6, revenue: 78400 }
];

export const StaffPerformanceModal: React.FC<StaffPerformanceModalProps> = ({ 
  isOpen, 
  onClose, 
}) => {
  const [viewMode, setViewMode] = useState<'individual' | 'department' | 'comparison'>('individual');
  const [selectedStaff, setSelectedStaff] = useState(detailedStaffData[0]);

  const getPerformanceColor = (value: number, type: 'percentage' | 'rating' | 'days') => {
    if (type === 'rating') {
      if (value >= 4.5) return 'text-green-600 dark:text-green-400';
      if (value >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    } else if (type === 'days') {
      if (value <= 2) return 'text-green-600 dark:text-green-400';
      if (value <= 3) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    } else {
      if (value >= 90) return 'text-green-600 dark:text-green-400';
      if (value >= 80) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Staff Performance Analysis
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
                { key: 'individual', label: 'Individual Performance', icon: Users },
                { key: 'department', label: 'Department Overview', icon: Target },
                { key: 'comparison', label: 'Performance Comparison', icon: TrendingUp }
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

            {/* Individual Performance View */}
            {viewMode === 'individual' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Staff Member</h3>
                  {detailedStaffData.map((staff) => (
                    <button
                      key={staff.name}
                      onClick={() => setSelectedStaff(staff)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedStaff.name === staff.name
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{staff.department}</div>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {selectedStaff.name} - Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.conversion, 'percentage')}`}>
                          {selectedStaff.conversion}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.confirmed, 'percentage')}`}>
                          {selectedStaff.confirmed}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Confirmation Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.onTime, 'percentage')}`}>
                          {selectedStaff.onTime}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.avgHandling, 'days')}`}>
                          {selectedStaff.avgHandling}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Handling (days)</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Bookings</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {selectedStaff.totalBookings}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Revenue Generated</span>
                      </div>
                      <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {formatCurrency(selectedStaff.revenue)}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Satisfaction</span>
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(selectedStaff.customerSatisfaction, 'rating')}`}>
                        {selectedStaff.customerSatisfaction}/5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department Overview */}
            {viewMode === 'department' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Department Performance Overview
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                    <Bar dataKey="satisfaction" fill="#10B981" name="Satisfaction" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Comparison */}
            {viewMode === 'comparison' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Staff Performance Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Conversion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Confirmed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          On-Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Satisfaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {detailedStaffData.map((staff) => (
                        <tr key={staff.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {staff.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {staff.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPerformanceColor(staff.conversion, 'percentage')}`}>
                              {staff.conversion}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPerformanceColor(staff.confirmed, 'percentage')}`}>
                              {staff.confirmed}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPerformanceColor(staff.onTime, 'percentage')}`}>
                              {staff.onTime}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPerformanceColor(staff.customerSatisfaction, 'rating')}`}>
                              {staff.customerSatisfaction}/5
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(staff.revenue)}
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