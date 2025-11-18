import React, { useState } from 'react';
import { X, Clock, AlertTriangle, CheckCircle, Phone, Mail, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { formatDate } from '../../utils/format';

interface SupplierResponseTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: any[];
}

const mockSupplierStats = [
  {
    supplier: 'Steigenberger Hotels',
    totalRequests: 24,
    avgResponseTime: '1.2 days',
    responseRate: 95,
    pendingRequests: 3,
    overdueRequests: 1,
    rating: 4.8
  },
  {
    supplier: 'EgyptAir',
    totalRequests: 18,
    avgResponseTime: '0.8 days',
    responseRate: 98,
    pendingRequests: 2,
    overdueRequests: 0,
    rating: 4.9
  },
  {
    supplier: 'Cairo Tours',
    totalRequests: 32,
    avgResponseTime: '2.1 days',
    responseRate: 87,
    pendingRequests: 5,
    overdueRequests: 2,
    rating: 4.3
  },
  {
    supplier: 'Hilton Hotels',
    totalRequests: 15,
    avgResponseTime: '1.5 days',
    responseRate: 92,
    pendingRequests: 1,
    overdueRequests: 0,
    rating: 4.6
  },
  {
    supplier: 'Nile Cruise Co',
    totalRequests: 12,
    avgResponseTime: '3.2 days',
    responseRate: 78,
    pendingRequests: 4,
    overdueRequests: 3,
    rating: 3.9
  }
];

export const SupplierResponseTrackerModal: React.FC<SupplierResponseTrackerModalProps> = ({ 
  isOpen, 
  onClose, 
  reservations 
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [searchTerm, setSearchTerm] = useState('');

  const getUrgencyColor = (days: number) => {
    if (days >= 3) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    if (days >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 dark:text-green-400';
    if (rate >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const pendingReservations = reservations.filter(r => 
    r.status === 'Pending' || r.status === 'Awaiting Supplier'
  );

  const filteredStats = mockSupplierStats.filter(stat => {
    const matchesSupplier = supplierFilter === 'All Suppliers' || stat.supplier === supplierFilter;
    const matchesSearch = stat.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesUrgency = true;
    if (urgencyFilter === 'High Priority') {
      matchesUrgency = stat.overdueRequests > 0;
    } else if (urgencyFilter === 'Medium Priority') {
      matchesUrgency = stat.pendingRequests > 2;
    }

    return matchesSupplier && matchesSearch && matchesUrgency;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Supplier Response Tracker
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pending</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      {pendingReservations.length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue Responses</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                      {mockSupplierStats.reduce((sum, s) => sum + s.overdueRequests, 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Response Time</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">1.6 days</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Response Rate</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">90%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option>All Urgency</option>
                <option>High Priority</option>
                <option>Medium Priority</option>
                <option>Low Priority</option>
              </Select>
              
              <Select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                <option>All Suppliers</option>
                {mockSupplierStats.map(stat => (
                  <option key={stat.supplier} value={stat.supplier}>{stat.supplier}</option>
                ))}
              </Select>
              
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {/* Supplier Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Requests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Response Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Overdue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStats.map((stat) => (
                      <tr key={stat.supplier} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {stat.supplier}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {stat.totalRequests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            parseFloat(stat.avgResponseTime) <= 1 ? 'text-green-600 dark:text-green-400' :
                            parseFloat(stat.avgResponseTime) <= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {stat.avgResponseTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getResponseRateColor(stat.responseRate)}`}>
                            {stat.responseRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {stat.pendingRequests}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stat.overdueRequests > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {stat.overdueRequests}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${getRatingColor(stat.rating)}`}>
                              {stat.rating}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Call Supplier"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Email Supplier"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Requests by Booking */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pending Supplier Requests
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Request Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Days Pending
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingReservations.map((reservation) => {
                        const daysPending = Math.floor((new Date().getTime() - new Date(reservation.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {reservation.reservation_id || reservation.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {reservation.customer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {reservation.supplier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(reservation.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {daysPending} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(daysPending)}`}>
                                {daysPending >= 3 ? 'High' : daysPending >= 2 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Call Supplier"
                                >
                                  <Phone className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  title="Email Supplier"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};