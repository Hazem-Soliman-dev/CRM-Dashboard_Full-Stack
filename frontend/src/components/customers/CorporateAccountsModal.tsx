import React, { useState, useEffect } from 'react';
import { X, Building, Users, DollarSign, Calendar, Eye, Edit, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/format';
import { AddCorporateAccountModal } from './AddCorporateAccountModal';
import { ViewCorporateAccountModal } from './ViewCorporateAccountModal';
import { EditCorporateAccountModal } from './EditCorporateAccountModal';
import customerService from '../../services/customerService';
import reservationService from '../../services/reservationService';
import paymentService from '../../services/paymentService';
import { Customer } from '../../services/customerService';
import { useToastContext } from '../../contexts/ToastContext';

interface CorporateAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CorporateAccountsModal: React.FC<CorporateAccountsModalProps> = ({ isOpen, onClose }) => {
  const toast = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCorporateAccounts();
    }
  }, [isOpen]);

  const loadCorporateAccounts = async () => {
    try {
      setLoading(true);
      // Get all corporate customers
      const { customers } = await customerService.getAllCustomers({ 
        type: 'Corporate',
        limit: 1000 
      });

      // Transform customers to corporate accounts format with aggregated stats
      const corporateAccounts = await Promise.all(
        customers.map(async (customer: Customer) => {
          try {
            // Get customer reservations and payments for stats
            const [reservationsRes, paymentsRes] = await Promise.all([
              reservationService.getCustomerReservations(customer.id, 1, 1000),
              paymentService.getCustomerPayments(customer.id, 1, 1000)
            ]);

            const reservations = reservationsRes.reservations || [];
            const payments = paymentsRes.payments || [];
            
            const totalBookings = reservations.length;
            const totalRevenue = payments
              .filter(p => p.payment_status === 'Completed')
              .reduce((sum, p) => sum + p.amount, 0);
            
            const lastBooking = reservations.length > 0
              ? reservations.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0].created_at
              : null;

            return {
              id: customer.id,
              companyName: customer.name,
              primaryContact: customer.name, // Use customer name as primary contact
              email: customer.email,
              phone: customer.phone || '',
              customerCount: 1, // Individual customer record
              totalBookings,
              totalRevenue,
              lastBooking,
              status: customer.status === 'Active' ? 'Active' : 'Inactive',
              accountManager: customer.assigned_staff?.full_name || 'Unassigned',
              contractValue: totalRevenue, // Use revenue as contract value estimate
              renewalDate: null // Not available in current schema
            };
          } catch (error) {
            console.error(`Error loading stats for customer ${customer.id}:`, error);
            return {
              id: customer.id,
              companyName: customer.name,
              primaryContact: customer.name,
              email: customer.email,
              phone: customer.phone || '',
              customerCount: 1,
              totalBookings: 0,
              totalRevenue: 0,
              lastBooking: null,
              status: customer.status === 'Active' ? 'Active' : 'Inactive',
              accountManager: customer.assigned_staff?.full_name || 'Unassigned',
              contractValue: 0,
              renewalDate: null
            };
          }
        })
      );

      setAccounts(corporateAccounts);
    } catch (error: any) {
      console.error('Error loading corporate accounts:', error);
      toast.error('Error', error.userMessage || 'Failed to load corporate accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.primaryContact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = accounts.reduce((sum, account) => sum + account.totalRevenue, 0);
  const totalCustomers = accounts.reduce((sum, account) => sum + account.customerCount, 0);
  const totalBookings = accounts.reduce((sum, account) => sum + account.totalBookings, 0);

  const handleViewAccount = (account: any) => {
    setSelectedAccount(account);
    setIsViewModalOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleAddAccount = async (accountData: any) => {
    setAccounts(prev => [accountData, ...prev]);
  };

  const handleUpdateAccount = async (updatedAccount: any) => {
    setAccounts(prev => prev.map(account => account.id === updatedAccount.id ? updatedAccount : account));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Building className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Corporate Accounts
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
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Accounts</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {accounts.length}
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

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

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Customers</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                        {totalCustomers}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Bookings</p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                        {totalBookings}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search corporate accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="mt-4 sm:mt-0" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Corporate Account
                </Button>
              </div>

              {/* Corporate Accounts Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Primary Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Account Manager
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {account.companyName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {account.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {account.primaryContact}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {account.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {account.customerCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {account.totalBookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(account.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                              {account.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {account.accountManager}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewAccount(account)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View Account Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditAccount(account)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Edit Account"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Corporate Account Modal */}
      <AddCorporateAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAccount}
      />

      {/* View Corporate Account Modal */}
      <ViewCorporateAccountModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        account={selectedAccount}
      />

      {/* Edit Corporate Account Modal */}
      <EditCorporateAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateAccount}
        account={selectedAccount}
      />
    </>
  );
};