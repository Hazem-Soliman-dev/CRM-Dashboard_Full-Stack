import React from 'react';
import { X, Building, Calendar, Mail, Phone, User, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

interface ViewCorporateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

const mockCustomers = [
  { id: 'CU-001', name: 'John Smith', email: 'john.smith@techcorp.com', bookings: 5, value: 12500 },
  { id: 'CU-002', name: 'Sarah Wilson', email: 'sarah.wilson@techcorp.com', bookings: 8, value: 18900 },
  { id: 'CU-003', name: 'Mike Johnson', email: 'mike.johnson@techcorp.com', bookings: 3, value: 7800 }
];

const mockBookingHistory = [
  { id: 'BK-001', service: 'Corporate Retreat', date: '2025-01-10', amount: 25000, participants: 15 },
  { id: 'BK-002', service: 'Team Building Event', date: '2024-12-15', amount: 8500, participants: 8 },
  { id: 'BK-003', service: 'Executive Travel', date: '2024-11-20', amount: 15000, participants: 3 }
];

export const ViewCorporateAccountModal: React.FC<ViewCorporateAccountModalProps> = ({ isOpen, onClose, account }) => {
  if (!isOpen || !account) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {account.companyName} - Account Details
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                        <p className="font-medium text-gray-900 dark:text-white">{account.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Primary Contact</p>
                        <p className="font-medium text-gray-900 dark:text-white">{account.primaryContact}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{account.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{account.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Manager</p>
                      <p className="font-medium text-gray-900 dark:text-white">{account.accountManager}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contract Value</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.contractValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                      <p className="font-medium text-gray-900 dark:text-white">{account.customerCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Renewal Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(account.renewalDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Customers */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Associated Customers
                  </h3>
                  <div className="space-y-3">
                    {mockCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.bookings} bookings</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(customer.value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking History */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Bookings
                  </h3>
                  <div className="space-y-3">
                    {mockBookingHistory.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{booking.service}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(booking.date)} • {booking.participants} participants</p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{account.totalBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Booking Value</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(account.totalRevenue / account.totalBookings || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Booking</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.lastBooking ? formatDate(account.lastBooking) : 'No bookings'}
                      </span>
                    </div>
                    {account.status === 'VIP' && (
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">VIP Account</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      • Create new booking
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      • Add new customer
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      • Schedule meeting
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      • Update contract
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};