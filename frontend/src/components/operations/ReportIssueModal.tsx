import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { OperationsTrip } from '../../services/operationsService';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issueData: {
    tripId: number;
    title: string;
    description: string;
    issueType: string;
    priority: string;
    affectedServices?: string;
    estimatedDelay?: string;
    actionTaken?: string;
    notifyDepartments: string[];
    requiresImmediateAction: boolean;
    reportedBy: string;
    reportedAt: string;
    status: string;
  }) => Promise<void>;
  trip: OperationsTrip | null;
}

const issueTypes = [
  'Weather Conditions',
  'Vehicle Breakdown',
  'Staff Unavailable',
  'Supplier Issue',
  'Customer Complaint',
  'Safety Concern',
  'Schedule Delay',
  'Equipment Problem',
  'Health Emergency',
  'Other'
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const departments = ['Operations', 'Sales', 'Finance', 'Support', 'Management'];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  trip 
}) => {
  const [formData, setFormData] = useState({
    issueType: 'Other',
    priority: 'Medium',
    title: '',
    description: '',
    affectedServices: '',
    estimatedDelay: '',
    actionTaken: '',
    notifyDepartments: ['Operations'],
    requiresImmediateAction: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Issue description is required';
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
      if (!trip) {
        return;
      }

      const issueData = {
        ...formData,
        tripId: trip.id,
        reportedBy: 'Operations Team',
        reportedAt: new Date().toISOString(),
        status: 'Open'
      };

      await onSave(issueData);
      
      // Reset form
      setFormData({
        issueType: 'Other',
        priority: 'Medium',
        title: '',
        description: '',
        affectedServices: '',
        estimatedDelay: '',
        actionTaken: '',
        notifyDepartments: ['Operations'],
        requiresImmediateAction: false
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error reporting issue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDepartmentToggle = (department: string) => {
    setFormData(prev => ({
      ...prev,
      notifyDepartments: prev.notifyDepartments.includes(department)
        ? prev.notifyDepartments.filter(d => d !== department)
        : [...prev.notifyDepartments, department]
    }));
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report Issue - {trip.tripCode}
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
            {/* Trip Info */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                Trip Information
              </h4>
              <div className="text-sm text-red-700 dark:text-red-400">
                <p><strong>Customer:</strong> {trip.customerName} ({trip.customerCount} pax)</p>
                <p><strong>Itinerary:</strong> {trip.itinerary}</p>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Guide:</strong> {trip.assignedGuide}</p>
                <p><strong>Driver:</strong> {trip.assignedDriver}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Issue Type"
                  value={formData.issueType}
                  onChange={(e) => handleInputChange('issueType', e.target.value)}
                >
                  {issueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>

                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </Select>

                <div className="md:col-span-2">
                  <Input
                    label="Issue Title *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <Input
                  label="Affected Services"
                  value={formData.affectedServices}
                  onChange={(e) => handleInputChange('affectedServices', e.target.value)}
                  placeholder="Which services are affected?"
                />

                <Input
                  label="Estimated Delay"
                  value={formData.estimatedDelay}
                  onChange={(e) => handleInputChange('estimatedDelay', e.target.value)}
                  placeholder="e.g., 2 hours, 1 day"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Provide detailed description of the issue..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action Taken
                </label>
                <textarea
                  value={formData.actionTaken}
                  onChange={(e) => handleInputChange('actionTaken', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What actions have been taken to resolve this issue?"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Notify Departments
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {departments.map(dept => (
                    <label key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.notifyDepartments.includes(dept)}
                        onChange={() => handleDepartmentToggle(dept)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresImmediateAction}
                    onChange={(e) => handleInputChange('requiresImmediateAction', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Requires immediate action (High priority alert)
                  </span>
                </label>
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
                  variant="danger"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};