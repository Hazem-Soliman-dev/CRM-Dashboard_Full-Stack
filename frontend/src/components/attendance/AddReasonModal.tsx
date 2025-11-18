import React, { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../types/errors';

export interface AttendanceReasonData {
  reason: string;
  reasonType: string;
  date: string;
  startTime?: string;
  endTime?: string;
}

interface AddReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (reasonData: AttendanceReasonData) => Promise<void>;
}

const reasonTypes = [
  'Early Leave',
  'Client Visit',
  'Remote Work',
  'Medical Appointment',
  'Personal Emergency',
  'Training',
  'Meeting',
  'Other'
];

export const AddReasonModal: React.FC<AddReasonModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reasonType: 'Early Leave',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Validation Error', 'Please fill in a description.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding attendance reason:', formData);
      
      if (onSave) {
        await onSave({
          reason: formData.description,
          reasonType: formData.reasonType,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime
        });
      } else {
        toast.info('Demo', 'This feature is not yet connected to the backend.');
      }
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reasonType: 'Early Leave',
        description: '',
        startTime: '',
        endTime: ''
      });
      onClose();
    } catch (error: unknown) {
      console.error('Error adding reason:', error);
      toast.error('Failed to Add', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Attendance Reason
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
                onChange={(e) => handleInputChange('date', e.target.value)}
              />

              <Select
                label="Reason Type"
                value={formData.reasonType}
                onChange={(e) => handleInputChange('reasonType', e.target.value)}
              >
                {reasonTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explain the reason for this attendance entry..."
                  required
                />
              </div>
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
                Add Reason
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};