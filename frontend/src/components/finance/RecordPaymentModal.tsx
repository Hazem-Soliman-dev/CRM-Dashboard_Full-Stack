import React, { useState } from 'react';
import { X, Save, DollarSign, Upload } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/format';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: any) => Promise<void>;
  bookings: any[];
}

const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Online Payment', 'Wire Transfer'];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  bookings 
}) => {
  const [formData, setFormData] = useState({
    bookingId: '',
    customerId: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const selectedBooking = bookings.find(b => b.id === formData.bookingId);

  React.useEffect(() => {
    if (selectedBooking) {
      setFormData(prev => ({
        ...prev,
        amount: selectedBooking.outstandingBalance.toString(),
        customerId: selectedBooking.customer?.id || selectedBooking.customer_id || selectedBooking.customer
      }));
    }
  }, [selectedBooking]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bookingId) {
      newErrors.bookingId = 'Booking ID is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Payment amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (selectedBooking && Number(formData.amount) > selectedBooking.outstandingBalance) {
      newErrors.amount = `Amount cannot exceed outstanding balance of ${formatCurrency(selectedBooking.outstandingBalance)}`;
    }

    if (!formData.date) {
      newErrors.date = 'Payment date is required';
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
      const paymentData = {
        ...formData,
        amount: Number(formData.amount),
        receiptFile: receiptFile,
        timestamp: new Date().toISOString(),
        processedBy: 'Current User' // In real app, get from auth context
      };

      await onSave(paymentData);
      
      // Reset form
      setFormData({
        bookingId: '',
        customerId: '',
        amount: '',
        paymentMethod: 'Bank Transfer',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      });
      setReceiptFile(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Record Payment
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Select
                  label="Booking ID *"
                  value={formData.bookingId}
                  onChange={(e) => handleInputChange('bookingId', e.target.value)}
                  error={errors.bookingId}
                >
                  <option value="">Select booking</option>
                  {bookings.filter(b => b.outstandingBalance > 0).map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.id} - {booking.customer} ({formatCurrency(booking.outstandingBalance)} outstanding)
                    </option>
                  ))}
                </Select>
              </div>

              {selectedBooking && (
                <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">Customer: </span>
                      <span className="text-blue-800 dark:text-blue-300">{selectedBooking.customer.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">Total Amount: </span>
                      <span className="text-blue-800 dark:text-blue-300">{formatCurrency(selectedBooking.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">Paid Amount: </span>
                      <span className="text-blue-800 dark:text-blue-300">{formatCurrency(selectedBooking.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">Outstanding: </span>
                      <span className="text-blue-800 dark:text-blue-300 font-medium">{formatCurrency(selectedBooking.outstandingBalance)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Payment Amount *"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                error={errors.amount}
                placeholder="Enter payment amount"
              />

              <Select
                label="Payment Method *"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </Select>

              <Input
                label="Payment Date *"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={errors.date}
              />

              <Input
                label="Reference Number"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Transaction reference"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Receipt Upload (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="receipt-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      <span>Upload receipt</span>
                      <input
                        id="receipt-upload"
                        name="receipt-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
              
              {receiptFile && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Selected: {receiptFile.name}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add payment notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                <Save className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};