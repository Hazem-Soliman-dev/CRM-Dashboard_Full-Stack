import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import paymentService, { UpdatePaymentData } from '../../services/paymentService';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  payment: any;
}

const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Other'];
const paymentStatuses = ['Pending', 'Completed', 'Failed', 'Refunded', 'Partially Refunded'];

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  payment 
}) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending',
    paymentDate: '',
    dueDate: '',
    transactionId: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (payment && isOpen) {
      setFormData({
        amount: payment.amount?.toString() || '',
        paymentMethod: payment.payment_method || 'Bank Transfer',
        paymentStatus: payment.payment_status || 'Pending',
        paymentDate: payment.payment_date ? payment.payment_date.split('T')[0] : '',
        dueDate: payment.due_date ? payment.due_date.split('T')[0] : '',
        transactionId: payment.transaction_id || '',
        notes: payment.notes || ''
      });
    }
  }, [payment, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount.trim()) {
      newErrors.amount = 'Payment amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
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
      const updateData: UpdatePaymentData = {
        amount: Number(formData.amount),
        payment_method: formData.paymentMethod as any,
        payment_status: formData.paymentStatus as any,
        payment_date: new Date(formData.paymentDate).toISOString(),
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        transaction_id: formData.transactionId || undefined,
        notes: formData.notes || undefined
      };

      await paymentService.updatePayment(payment.id, updateData);
      await onSave();
      
      toast.success('Success', 'Payment updated successfully');
      onClose();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('Error', error.response?.data?.message || error.message || 'Failed to update payment');
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

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Payment
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
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Payment ID: </span>
                  <span className="text-gray-900 dark:text-white font-medium">{payment.payment_id || payment.id}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Booking ID: </span>
                  <span className="text-gray-900 dark:text-white font-medium">{payment.booking_id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <Select
                label="Payment Status *"
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
              >
                {paymentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>

              <Input
                label="Payment Date *"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                error={errors.paymentDate}
              />

              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />

              <Input
                label="Transaction ID"
                value={formData.transactionId}
                onChange={(e) => handleInputChange('transactionId', e.target.value)}
                placeholder="Transaction reference"
              />
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
                Update Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

