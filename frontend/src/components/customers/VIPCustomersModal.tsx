import React, { useState } from 'react';
import { X, Crown, Eye, Edit, MessageSquare, Star, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatDate, formatCurrency } from '../../utils/format';
import { ViewCustomerModal } from './ViewCustomerModal';
import { EditCustomerModal } from './EditCustomerModal';
import { ActivityModal } from './ActivityModal';

interface VIPCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  onUpdateCustomer: (customer: any) => Promise<void>;
  onLogActivity: (activity: any) => Promise<void>;
}

export const VIPCustomersModal: React.FC<VIPCustomersModalProps> = ({ 
  isOpen, 
  onClose, 
  customers, 
  onUpdateCustomer,
  onLogActivity 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Filter VIP customers
  const vipCustomers = customers.filter(customer => customer.status === 'VIP');
  
  // Apply search filter
  const filteredVipCustomers = vipCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate VIP metrics
  const totalVipRevenue = vipCustomers.reduce((sum, customer) => sum + customer.totalValue, 0);
  const avgVipValue = vipCustomers.length > 0 ? totalVipRevenue / vipCustomers.length : 0;
  const totalVipBookings = vipCustomers.reduce((sum, customer) => sum + customer.totalBookings, 0);

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleMessageCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsActivityModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  VIP Customers ({filteredVipCustomers.length})
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
              {/* VIP Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total VIP Customers</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                        {vipCustomers.length}
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Total VIP Revenue</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {formatCurrency(totalVipRevenue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg. Customer Value</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {formatCurrency(avgVipValue)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Bookings</p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                        {totalVipBookings}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Input
                  placeholder="Search VIP customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* VIP Customers Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 dark:bg-purple-900/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Crown className="h-4 w-4" />
                            <span>VIP Customer</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Contact Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Customer Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Last Trip
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Account Manager
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredVipCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                  <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                  {customer.name}
                                  <Star className="h-4 w-4 text-yellow-400 ml-2" />
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {customer.id}
                                </div>
                                {customer.company && (
                                  <div className="text-xs text-gray-400">
                                    {customer.company}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                {customer.contactMethod} preferred
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(customer.totalValue)}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              High value customer
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.totalBookings}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total bookings
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {customer.lastTrip ? formatDate(customer.lastTrip) : 'No trips yet'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {customer.assignedStaff}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewCustomer(customer)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View VIP Customer Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditCustomer(customer)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Edit VIP Customer"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleMessageCustomer(customer)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                title="Message VIP Customer"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredVipCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {vipCustomers.length === 0 ? 'No VIP Customers Yet' : 'No VIP Customers Found'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {vipCustomers.length === 0 
                      ? 'VIP customers will appear here when they meet the criteria.'
                      : 'Try adjusting your search terms.'
                    }
                  </p>
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

      {/* View Customer Modal */}
      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        customer={selectedCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onUpdateCustomer}
        customer={selectedCustomer}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={onLogActivity}
        customer={selectedCustomer}
      />
    </>
  );
};