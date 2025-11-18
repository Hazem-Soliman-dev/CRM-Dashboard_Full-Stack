import React, { useState } from 'react';
import { X, Save, Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import staffService from '../../services/staffService';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any) => Promise<void>;
  customer: any;
}

const activityTypes = [
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'note', label: 'General Note', icon: MessageSquare }
];

export const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [staff, setStaff] = React.useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: '',
    assignedStaff: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        try {
          const { staff: staffData } = await staffService.getAllStaff();
          setStaff(staffData);
          if (staffData.length > 0) {
            setFormData(prev => ({ ...prev, assignedStaff: staffData[0].id }));
          }
        } catch (error) {
          console.error('Failed to fetch staff', error);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const activityData = {
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        timestamp: new Date().toISOString(),
        user: 'Current User' // In real app, get from auth context
      };

      await onSave(activityData);
      
      // Reset form
      setFormData({
        type: 'call',
        subject: '',
        description: '',
        outcome: '',
        followUpRequired: false,
        followUpDate: '',
        assignedStaff: staff.length > 0 ? staff[0].id : ''
      });
      onClose();
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedActivityType = activityTypes.find(type => type.value === formData.type);
  const ActivityIcon = selectedActivityType?.icon || MessageSquare;

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <ActivityIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Log Activity - {customer.name}
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
              <Select
                label="Activity Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter activity subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the activity details..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Outcome
                </label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What was the outcome or result?"
                />
              </div>

              <Select
                label="Assign Staff"
                value={formData.assignedStaff}
                onChange={(e) => handleInputChange('assignedStaff', e.target.value)}
              >
                <option value="">Select Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="followUpRequired" className="text-sm text-gray-700 dark:text-gray-300">
                  Follow-up required
                </label>
              </div>

              {formData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
              <div className="flex items-start space-x-3">
                <ActivityIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Customer Information
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    {customer.name} • {customer.email} • {customer.phone}
                  </p>
                </div>
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
                Log Activity
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};