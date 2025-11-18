import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';
import { useToastContext } from '../../contexts/ToastContext';
import { ActionGuard } from '../auth/ActionGuard';
import paymentService from '../../services/paymentService';
import invoiceService from '../../services/invoiceService';

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onEditPayment?: (payment: any) => void;
  onDeletePayment?: (payment: any) => void;
  onRefresh?: () => void;
}

export const ViewPaymentModal: React.FC<ViewPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  booking,
  onEditPayment,
  onDeletePayment,
  onRefresh
}) => {
  const toast = useToastContext();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);

  const fetchHistory = React.useCallback(async () => {
    if (!booking) return;
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        paymentService.getPaymentsByBooking(booking.id, 1, 100),
        invoiceService.getInvoicesForBooking(booking.id)
      ]);
      setPaymentHistory(paymentsRes.payments || []);
      setInvoiceHistory(invoicesRes.invoices || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Error', 'Failed to load payment and invoice history');
    }
  }, [booking, toast]);

  React.useEffect(() => {
    if (booking && isOpen) {
      fetchHistory();
    }
  }, [booking, isOpen, fetchHistory]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'record-payment':
        toast.success('Payment Recorded', `New payment of $500 recorded for ${booking.customer}`);
        // In real app, this would open payment recording modal
        break;
      case 'send-reminder':
        toast.success('Reminder Sent', `Payment reminder sent to ${booking.customer}`);
        // In real app, this would send automated reminder email
        break;
      case 'generate-receipt':
        toast.success('Receipt Generated', `Payment receipt generated for booking ${booking.id}`);
        // In real app, this would generate and download PDF receipt
        break;
      case 'update-terms':
        toast.success('Terms Updated', `Payment terms updated for booking ${booking.id}`);
        // In real app, this would open payment terms editor
        break;
    }
  };

  if (!isOpen || !booking) return null;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Deposit Paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Issued': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const paymentProgress = (booking.paidAmount / booking.totalAmount) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Payment Details - {booking.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.paidAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.outstandingBalance)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.dueDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{paymentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment History
                  </h3>
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.payment_method}</p>
                            <p className="text-xs text-gray-400">Ref: {payment.transaction_id || payment.reference || 'N/A'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Status: <span className={`font-medium ${
                                payment.payment_status === 'Completed' ? 'text-green-600' :
                                payment.payment_status === 'Pending' ? 'text-yellow-600' :
                                payment.payment_status === 'Failed' ? 'text-red-600' : 'text-gray-600'
                              }`}>{payment.payment_status}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{formatDate(payment.payment_date)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">by {payment.created_by_user?.full_name || payment.processedBy?.name || 'System'}</p>
                            {payment.receiptUrl && (
                              <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                View Receipt
                              </button>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1 ml-4">
                            {onEditPayment && (
                              <ActionGuard module="payments" action="update">
                                <button
                                  onClick={() => {
                                    onEditPayment(payment);
                                    onClose();
                                  }}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Edit Payment"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </ActionGuard>
                            )}
                            {onDeletePayment && (
                              <ActionGuard module="payments" action="delete">
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete this payment of ${formatCurrency(payment.amount)}? This action cannot be undone.`)) {
                                      await onDeletePayment(payment);
                                      // Refresh payment history after deletion
                                      await fetchHistory();
                                      if (onRefresh) {
                                        await onRefresh();
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete Payment"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </ActionGuard>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice History */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Invoice History
                  </h3>
                  <div className="space-y-4">
                    {invoiceHistory.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(invoice.amount)}</p>
                            <p className="text-xs text-gray-400">Due: {formatDate(invoice.due_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Issued: {formatDate(invoice.issue_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Booking Value</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Supplier Cost</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.supplierCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Profit</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(booking.profit)}
                        </span>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {booking.profitMargin}% margin
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Supplier Status</span>
                      <span className={`text-sm font-medium ${booking.supplierPaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {booking.supplierPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Booking Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.tripItem}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Agent</p>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.agent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('record-payment')}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record new payment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('send-reminder')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Send payment reminder
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('generate-receipt')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate receipt
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('update-terms')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Update payment terms
                    </Button>
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