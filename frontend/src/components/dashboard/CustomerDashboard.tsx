import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, FileText, HelpCircle, Download, Eye } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import reservationService from '../../services/reservationService';
import paymentService from '../../services/paymentService';
import supportService from '../../services/supportService';
import { Reservation } from '../../services/reservationService';
import { Payment } from '../../services/paymentService';
import { SupportTicket } from '../../services/supportService';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = currentUser.id;

      if (!customerId) {
        toast.error('Error', 'User ID not found');
        setLoading(false);
        return;
      }

      // Load customer data in parallel
      const [reservationsRes, paymentsRes, ticketsRes] = await Promise.all([
        reservationService.getCustomerReservations(customerId, 1, 100),
        paymentService.getCustomerPayments(customerId, 1, 100),
        supportService.getAllTickets({ customer_id: customerId, limit: 100 })
      ]);

      setBookings(reservationsRes.reservations || []);
      setPayments(paymentsRes.payments || []);
      setTickets(ticketsRes.tickets || []);
    } catch (error: any) {
      console.error('Error loading customer data:', error);
      toast.error('Error', error.userMessage || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'view-bookings':
        navigate('/reservations');
        break;
      case 'view-payments':
        navigate('/finance');
        break;
      case 'create-ticket':
        navigate('/support');
        break;
      case 'update-profile':
        toast.info('Profile Update', 'Opening profile settings');
        break;
    }
  };

  // Transform reservations to bookings format for display
  const customerBookings = bookings.map(booking => ({
    id: booking.id,
    service: booking.service_type || 'Service',
    destination: booking.destination,
    startDate: booking.departure_date,
    endDate: booking.return_date || booking.departure_date,
    status: booking.status,
    amount: booking.total_amount,
    participants: (booking.adults || 0) + (booking.children || 0) + (booking.infants || 0)
  }));

  const upcomingBookings = customerBookings.filter(b => {
    const startDate = new Date(b.startDate);
    return startDate > new Date();
  });

  const totalSpent = payments
    .filter(p => p.payment_status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  
  const outstandingBalance = bookings
    .filter(b => b.payment_status === 'Pending' || b.payment_status === 'Partial')
    .reduce((sum, b) => {
      const paid = payments
        .filter(p => p.booking_id === b.id && p.payment_status === 'Completed')
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + (b.total_amount - paid);
    }, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Travel Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your bookings and account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Upcoming Trips"
          value={upcomingBookings.length.toString()}
          change={upcomingBookings.length > 0 ? "Next trip in 30 days" : "No upcoming trips"}
          changeType="neutral"
          icon={Calendar}
        />
        <StatsCard
          title="Total Bookings"
          value={customerBookings.length.toString()}
          change="Lifetime bookings"
          changeType="neutral"
          icon={FileText}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change="Lifetime value"
          changeType="neutral"
          icon={CreditCard}
        />
        <StatsCard
          title="Open Tickets"
          value={openTickets.toString()}
          change={openTickets > 0 ? "Support needed" : "All resolved"}
          changeType={openTickets > 0 ? "negative" : "positive"}
          icon={HelpCircle}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('view-bookings')}
            >
              <Calendar className="h-6 w-6" />
              <span>View My Bookings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('view-payments')}
            >
              <CreditCard className="h-6 w-6" />
              <span>Payment History</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('create-ticket')}
            >
              <HelpCircle className="h-6 w-6" />
              <span>Get Support</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('update-profile')}
            >
              <FileText className="h-6 w-6" />
              <span>Update Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{booking.service}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.destination}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.participants} participants
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {booking.status}
                        </span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {formatCurrency(booking.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Voucher
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming trips</p>
                <p className="text-sm text-gray-400">Your future bookings will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Payment processed successfully
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Deposit for Luxor Temple Tour • 3 days ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Booking confirmed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Luxor Temple Tour confirmed • 5 days ago
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                  <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Support ticket created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Dietary requirements inquiry • 1 day ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Total Spent</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {formatCurrency(outstandingBalance)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Outstanding Balance</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {payments.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Total Payments</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};