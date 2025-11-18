import React, { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User } from '../../services/authService';

export interface TimeAdjustmentData {
  date: string;
  clockIn: string;
  clockOut: string;
  reason?: string;
}

interface TimeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User;
  onSave: (adjustmentData: TimeAdjustmentData) => Promise<void>;
}

export const TimeAdjustmentModal: React.FC<TimeAdjustmentModalProps> = ({ isOpen, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    checkIn: '',
    checkOut: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.checkIn || !formData.checkOut) {
      console.error('All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Time adjustment:', formData);
      await onSave({
        date: formData.date,
        clockIn: formData.checkIn,
        clockOut: formData.checkOut,
        reason: formData.reason
      });
      
      // Reset form
      setFormData({
        date: '',
        checkIn: '',
        checkOut: '',
        reason: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adjusting time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Time Adjustment
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
            <div className="space-y-6">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Check-in Time"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                />
                <Input
                  label="Check-out Time"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Adjustment
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this adjustment is needed..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Submit Adjustment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};