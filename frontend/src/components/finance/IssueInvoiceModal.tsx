import React, { useState } from 'react';
import { X, Save, FileText, Send, Download } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import invoiceService from '../../services/invoiceService';
import { useToastContext } from '../../contexts/ToastContext';

interface IssueInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: any) => Promise<void>;
  booking: any;
}

const invoiceTemplates = [
  'Standard Invoice',
  'Corporate Invoice',
  'Proforma Invoice',
  'Credit Note',
  'Deposit Invoice'
];

const paymentTerms = [
  '7 days',
  '14 days',
  '30 days',
  '45 days',
  'Due on receipt',
  'Net 30'
];

export const IssueInvoiceModal: React.FC<IssueInvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  booking 
}) => {
  const [formData, setFormData] = useState({
    template: 'Standard Invoice',
    amount: '',
    dueDate: '',
    paymentTerms: '14 days',
    notes: '',
    sendImmediately: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastContext();

  React.useEffect(() => {
    if (booking && isOpen) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      setFormData(prev => ({
        ...prev,
        amount: booking.outstandingBalance.toString(),
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [booking, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount.trim()) {
      newErrors.amount = 'Invoice amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Ensure we have valid IDs
      const bookingId = booking.id || booking.reservation_id;
      const customerId = booking.customer_id || booking.customer?.id;
      
      if (!bookingId) {
        toast.error('Error', 'Booking ID is required');
        return;
      }
      
      if (!customerId) {
        toast.error('Error', 'Customer ID is required');
        return;
      }

      const invoiceData = {
        booking_id: String(bookingId), // Ensure it's a string for validation
        customer_id: String(customerId), // Ensure it's a string for validation
        amount: Number(formData.amount),
        due_date: formData.dueDate, // Format: YYYY-MM-DD
        payment_terms: formData.paymentTerms,
        notes: formData.notes || undefined,
        status: 'Issued'
      };

      const createdInvoice = await invoiceService.createInvoice(invoiceData);
      
      toast.success('Invoice Issued', `Invoice ${createdInvoice.invoice_id || createdInvoice.id || 'has been generated'} successfully.`);
      
      // Reset form
      setFormData({
        template: 'Standard Invoice',
        amount: '',
        dueDate: '',
        paymentTerms: '14 days',
        notes: '',
        sendImmediately: true
      });
      setErrors({});
      
      // Call onSave to refresh parent component data
      if (onSave) {
        await onSave(invoiceData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error issuing invoice:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to issue invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePreview = () => {
    console.log('Previewing invoice for booking:', booking.id);
    // In real app, generate PDF preview
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Issue Invoice - {booking.reservation_id || booking.id}
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
            {/* Booking Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                Booking Information
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                <p><strong>Customer:</strong> {booking.customerName || booking.customer?.name || booking.customer}</p>
                <p><strong>Service:</strong> {booking.tripItem}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(booking.totalAmount)}</p>
                <p><strong>Outstanding:</strong> {formatCurrency(booking.outstandingBalance)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Invoice Template"
                  value={formData.template}
                  onChange={(e) => handleInputChange('template', e.target.value)}
                >
                  {invoiceTemplates.map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </Select>

                <Input
                  label="Invoice Amount *"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  error={errors.amount}
                  placeholder="Enter invoice amount"
                />

                <Input
                  label="Due Date *"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  error={errors.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                />

                <Select
                  label="Payment Terms"
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                >
                  {paymentTerms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </Select>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add invoice notes or special instructions..."
                />
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.sendImmediately}
                    onChange={(e) => handleInputChange('sendImmediately', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Send invoice immediately to customer
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {formData.sendImmediately ? (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Issue & Send
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Issue Invoice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};