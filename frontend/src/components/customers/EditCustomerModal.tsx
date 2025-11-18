import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import staffService from '../../services/staffService';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: any) => Promise<void>;
  customer: any;
}

const customerTypes = ['Individual', 'Corporate'];
const contactMethods = ['Email', 'Phone', 'WhatsApp'];
const statuses = ['Active', 'Inactive', 'Suspended'];

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    type: 'Individual',
    contactMethod: 'Email',
    status: 'Active',
    assignedStaff: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        try {
          const { staff: staffData } = await staffService.getAllStaff();
          setStaff(staffData);
        } catch (error) {
          console.error('Failed to fetch staff', error);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  useEffect(() => {
    if (customer && isOpen) {
      // Get staff ID - prefer assigned_staff_id, fallback to empty string (never use assignedStaff name)
      const staffId = customer.assigned_staff_id || 
                     (customer.assigned_staff?.id) || 
                     '';
      
      setFormData({
        fullName: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        type: customer.type || 'Individual',
        contactMethod: customer.contactMethod || 'Email',
        status: customer.status || 'Active',
        assignedStaff: staffId.toString(),
        notes: customer.notes || ''
      });
    }
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.assignedStaff) {
      newErrors.assignedStaff = 'An agent must be assigned';
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
      console.log("Updating customer:", customer.id, formData);
      
      // Pass data exactly like EditLeadModal - spread customer and override fields
      // Only include assigned_staff_id if it's a valid number
      const staffId = formData.assignedStaff ? parseInt(formData.assignedStaff.toString()) : undefined;
      const updateData: any = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        type: formData.type,
        contact_method: formData.contactMethod,
        status: formData.status,
        notes: formData.notes
      };
      
      // Only add assigned_staff_id if it's a valid integer
      if (staffId && !isNaN(staffId) && staffId > 0) {
        updateData.assigned_staff_id = staffId;
      }
      
      await onSave({
        ...customer,
        ...updateData
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating customer:', error);
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

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Customer - {customer.name}
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
                label="Full Name *"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={errors.fullName}
                placeholder="Enter full name"
              />

              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="Enter email address"
              />

              <Input
                label="Phone *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="Enter phone number"
              />

              <Input
                label="Company Name"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name (if applicable)"
              />

              <Select
                label="Customer Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {customerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <Select
                label="Preferred Contact Method"
                value={formData.contactMethod}
                onChange={(e) => handleInputChange('contactMethod', e.target.value)}
              >
                {contactMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
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
                label="Assigned Staff"
                value={formData.assignedStaff}
                onChange={(e) => handleInputChange('assignedStaff', e.target.value)}
                error={errors.assignedStaff}
              >
                <option value="">Select a staff member</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>{member.full_name || member.name || 'Unnamed'}</option>
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
                placeholder="Add any additional notes about this customer..."
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
                Update Customer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};