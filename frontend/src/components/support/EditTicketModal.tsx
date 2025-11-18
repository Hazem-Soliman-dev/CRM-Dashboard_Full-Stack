import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import userService from '../../services/userService';
import departmentService from '../../services/departmentService';

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => Promise<void>;
  ticket: any;
}

const sources = ['Email', 'WhatsApp', 'Phone', 'Internal', 'Website', 'Walk-in'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const EditTicketModal: React.FC<EditTicketModalProps> = ({ isOpen, onClose, onSave, ticket }) => {
  const [formData, setFormData] = useState({
    customer: '',
    bookingRef: '',
    subject: '',
    description: '',
    source: 'Email',
    department: '',
    priority: 'Medium',
    status: 'Open',
    assigned_to: '',
    tags: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [staffRes, deptRes] = await Promise.all([
            userService.getAllUsers({ limit: 100 }),
            departmentService.getAllDepartments()
          ]);
          setStaff(staffRes.users || []);
          setDepartments(deptRes.departments || []);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };
    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (ticket && isOpen) {
      setFormData({
        customer: ticket.customer || '',
        bookingRef: ticket.bookingRef || '',
        subject: ticket.subject || '',
        description: ticket.description || '',
        source: ticket.source || 'Email',
        department: ticket.department || '',
        priority: ticket.priority || 'Medium',
        status: ticket.status || 'Open',
        assigned_to: ticket.assigned_to || ticket.assigned_user?.id || '',
        tags: ticket.tags ? ticket.tags.join(', ') : ''
      });
    }
  }, [ticket, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      const updatedTicket = {
        ...ticket,
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString(),
        // Preserve numericId for API calls
        numericId: ticket.numericId || ticket.id
      };

      await onSave(updatedTicket);
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
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

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Ticket - {ticket.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Customer Name *"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                error={errors.customer}
                placeholder="Enter customer name"
              />

              <Input
                label="Booking Reference"
                value={formData.bookingRef}
                onChange={(e) => handleInputChange('bookingRef', e.target.value)}
                placeholder="e.g., BK-2025-001"
              />

              <div className="md:col-span-2">
                <Input
                  label="Subject *"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  error={errors.subject}
                  placeholder="Brief description of the issue"
                />
              </div>

              <Select
                label="Source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </Select>

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
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

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>

              <Select
                label="Assign To"
                value={formData.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              >
                {staff.map(member => (
                  <option key={member.id} value={member.id}>{member.full_name || member.name}</option>
                ))}
              </Select>

              <Input
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="e.g., refund, urgent, visa"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Detailed description of the issue..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
              )}
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
                Update Ticket
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};