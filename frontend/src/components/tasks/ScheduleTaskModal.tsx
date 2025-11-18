import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import taskService, { TaskStatus, TaskPriority } from '../../services/taskService';
import { useToastContext } from '../../contexts/ToastContext';
import userService from '../../services/userService';
import operationsService from '../../services/operationsService';

interface ScheduleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const taskTypes = ['Follow-up', 'Logistics', 'Customer Service', 'Maintenance', 'Inspection', 'Other'];

export const ScheduleTaskModal: React.FC<ScheduleTaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    title: '',
    tripId: '',
    tripReference: '',
    customerName: '',
    scheduledAt: '',
    location: '',
    assignedTo: '',
    status: 'Pending' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    taskType: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [usersRes, tripsRes] = await Promise.all([
            userService.getAllUsers({ limit: 100 }),
            operationsService.getTrips({})
          ]);
          setUsers(usersRes.users || []);
          setTrips(tripsRes || []);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };
    loadData();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
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
      await taskService.createTask({
        title: formData.title,
        tripId: formData.tripId ? parseInt(formData.tripId) : undefined,
        tripReference: formData.tripReference || undefined,
        customerName: formData.customerName || undefined,
        scheduledAt: formData.scheduledAt || undefined,
        location: formData.location || undefined,
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
        status: formData.status,
        priority: formData.priority,
        taskType: formData.taskType || undefined,
        notes: formData.notes || undefined
      });

      toast.success('Task Scheduled', 'New task has been scheduled successfully.');
      onSave();
      
      // Reset form
      setFormData({
        title: '',
        tripId: '',
        tripReference: '',
        customerName: '',
        scheduledAt: '',
        location: '',
        assignedTo: '',
        status: 'Pending',
        priority: 'Medium',
        taskType: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error('Error scheduling task:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to schedule task');
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

  // Auto-fill customer name when trip is selected
  useEffect(() => {
    if (formData.tripId) {
      const selectedTrip = trips.find(t => t.id === parseInt(formData.tripId));
      if (selectedTrip) {
        setFormData(prev => ({
          ...prev,
          customerName: selectedTrip.customerName || prev.customerName,
          tripReference: selectedTrip.bookingReference || selectedTrip.tripCode || prev.tripReference
        }));
      }
    }
  }, [formData.tripId, trips]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule New Task
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
                <Input
                  label="Task Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Enter task title"
                />
              </div>

              <Select
                label="Related Trip (optional)"
                value={formData.tripId}
                onChange={(e) => handleInputChange('tripId', e.target.value)}
              >
                <option value="">No Trip</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.tripCode} - {trip.customerName}
                  </option>
                ))}
              </Select>

              <Input
                label="Trip Reference"
                value={formData.tripReference}
                onChange={(e) => handleInputChange('tripReference', e.target.value)}
                placeholder="Booking reference"
                disabled={!!formData.tripId}
              />

              <Input
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Customer name"
                disabled={!!formData.tripId}
              />

              <Input
                label="Scheduled Date & Time"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />

              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Task location"
              />

              <Select
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </Select>

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </Select>

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>

              <Select
                label="Task Type"
                value={formData.taskType}
                onChange={(e) => handleInputChange('taskType', e.target.value)}
              >
                <option value="">Select Type</option>
                {taskTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add task notes..."
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
                Schedule Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

