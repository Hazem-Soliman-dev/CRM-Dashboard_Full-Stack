import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AddOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ownerData: any) => Promise<void>;
}

const statuses = ['Active', 'Onboarding', 'Dormant'];

export const AddOwnerModal: React.FC<AddOwnerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    primaryContact: '',
    email: '',
    phone: '',
    status: 'Active',
    portfolioSize: '',
    locations: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.portfolioSize && (isNaN(Number(formData.portfolioSize)) || Number(formData.portfolioSize) < 0)) {
      newErrors.portfolioSize = 'Portfolio size must be a valid positive number';
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
      const ownerData = {
        companyName: formData.companyName,
        primaryContact: formData.primaryContact || undefined,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        portfolioSize: formData.portfolioSize ? Number(formData.portfolioSize) : 0,
        locations: formData.locations ? formData.locations.split(',').map(loc => loc.trim()).filter(loc => loc) : [],
        notes: formData.notes || undefined
      };

      await onSave(ownerData);
      
      // Reset form
      setFormData({
        companyName: '',
        primaryContact: '',
        email: '',
        phone: '',
        status: 'Active',
        portfolioSize: '',
        locations: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving owner:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Owner
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
                label="Company Name *"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                error={errors.companyName}
                placeholder="Enter company name"
              />

              <Input
                label="Primary Contact"
                value={formData.primaryContact}
                onChange={(e) => handleInputChange('primaryContact', e.target.value)}
                placeholder="Enter primary contact name"
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
                label="Status *"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>

              <Input
                label="Portfolio Size"
                type="number"
                value={formData.portfolioSize}
                onChange={(e) => handleInputChange('portfolioSize', e.target.value)}
                error={errors.portfolioSize}
                placeholder="0"
              />

              <div className="md:col-span-2">
                <Input
                  label="Locations (comma-separated)"
                  value={formData.locations}
                  onChange={(e) => handleInputChange('locations', e.target.value)}
                  placeholder="Location 1, Location 2, Location 3"
                />
              </div>
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
                placeholder="Add any additional notes about this owner..."
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
                Save Owner
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

