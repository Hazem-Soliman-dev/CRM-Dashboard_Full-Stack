import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import staffService from '../../services/staffService';
import { useToastContext } from '../../contexts/ToastContext';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leaveData: any) => Promise<void>;
}

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Unpaid Leave', 'Maternity/Paternity Leave', 'Emergency Leave', 'Other'];

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSave }) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    staff_id: '',
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const loadStaff = async () => {
      if (isOpen) {
        try {
          const res = await staffService.getAllStaff();
          setStaff(res.staff || []);
          if (res.staff?.length > 0) {
            setFormData(prev => ({ ...prev, staff_id: res.staff[0].id }));
          }
        } catch (error) {
          console.error('Failed to load staff', error);
        }
      }
    };
    loadStaff();
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.staff_id) {
      newErrors.staff_id = 'Staff member is required';
      isValid = false;
    }
    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
      isValid = false;
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason for leave is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting leave request:', formData);
      
      // Map form data to API format
      await onSave({
        type: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      
      // Reset form
      setFormData({
        staff_id: staff.length > 0 ? staff[0].id : '',
        leaveType: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setErrors({});
      toast.success('Leave Request Submitted!', 'Your leave request has been submitted successfully.');
      onClose();
    } catch (error: any) {
      console.error('Failed to submit leave request', error);
      toast.error('Failed to Submit', error.message || 'Unknown error occurred');
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
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Request Leave
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
              <Select
                label="Staff Member *"
                value={formData.staff_id}
                onChange={(e) => handleInputChange('staff_id', e.target.value)}
                error={errors.staff_id}
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>

              <Select
                label="Leave Type *"
                value={formData.leaveType}
                onChange={(e) => handleInputChange('leaveType', e.target.value)}
                error={errors.leaveType}
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={errors.startDate}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  error={errors.endDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for leave request..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};