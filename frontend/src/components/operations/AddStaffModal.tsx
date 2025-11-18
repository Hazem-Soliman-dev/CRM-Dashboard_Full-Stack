import React, { useState } from 'react';
import { X, Save, Users } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CreateUserData } from '../../services/userService';

export interface StaffData extends Omit<CreateUserData, 'role'> {
  type: string;
  department: string;
  languages?: string;
  specialties?: string;
  status: 'Active' | 'Inactive';
}

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: StaffData) => Promise<void>;
}

const staffTypes = ['Guide', 'Driver', 'Tour Leader', 'Dive Guide', 'Safari Guide', 'Cruise Rep', 'Captain'];
const departments = ['Operations', 'Tours', 'Transportation', 'Marine', 'Desert', 'Cruise'];

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    type: 'Guide',
    department: 'Operations',
    phone: '',
    email: '',
    languages: '',
    specialties: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      await onSave(formData as unknown as StaffData);
      
      // Reset form
      setFormData({
        full_name: '',
        type: 'Guide',
        department: 'Operations',
        phone: '',
        email: '',
        languages: '',
        specialties: '',
        status: 'Active'
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error adding staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Staff Member
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
              <Input
                label="Full Name *"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={errors.full_name}
                placeholder="Enter full name"
              />

              <Select
                label="Staff Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {staffTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Select>

              <Input
                label="Phone *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="Enter phone number"
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
                label="Languages"
                value={formData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                placeholder="e.g., English, Arabic, German"
              />

              <div className="md:col-span-2">
                <Input
                  label="Specialties"
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  placeholder="e.g., Ancient History, Diving, Desert Tours"
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
                Add Staff Member
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};