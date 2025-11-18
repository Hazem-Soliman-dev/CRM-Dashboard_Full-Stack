import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import departmentService from '../../services/departmentService';

// Valid roles that match backend expectations
const VALID_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Customer' },
  { value: 'sales', label: 'Sales' },
  { value: 'reservation', label: 'Reservation' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
];

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
  user: any;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const departmentsRes = await departmentService.getAllDepartments();
          setDepartments(departmentsRes.departments || []);
        } catch (error) {
          console.error('Failed to load departments', error);
        }
      };
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      // Convert role to lowercase to match backend format
      const userRole = user.role ? user.role.toLowerCase() : '';
      // Ensure the role is one of the valid roles, default to first valid role if not
      const validRole = VALID_ROLES.find(r => r.value === userRole)?.value || VALID_ROLES[0]?.value || '';
      
      // Find department ID by name if departmentId is not available
      let departmentId = user.departmentId || '';
      if (!departmentId && user.department) {
        const dept = departments.find(d => d.name === user.department);
        departmentId = dept?.id?.toString() || '';
      }
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: validRole,
        department: departmentId,
        status: user.status || 'Active'
      });
    }
  }, [user, isOpen, departments]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
      const updatedUser = {
        ...user,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit User - {user.name}
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
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
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

              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                {VALID_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </Select>

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </Select>

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
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
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};