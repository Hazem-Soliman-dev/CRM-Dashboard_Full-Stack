import React, { useState } from 'react';
import { X, Save, Building } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { generateId } from '../../utils/format';

interface AddCorporateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: any) => Promise<void>;
}

const statuses = ['Active', 'VIP', 'Suspended'];
const accountManagers = ['Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Wilson', 'Emma Davis'];

export const AddCorporateAccountModal: React.FC<AddCorporateAccountModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    accountManager: 'Sarah Johnson',
    status: 'Active',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.primaryContactName.trim()) {
      newErrors.primaryContactName = 'Primary contact name is required';
    }

    if (!formData.primaryContactEmail.trim()) {
      newErrors.primaryContactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = 'Please enter a valid email address';
    }

    if (!formData.primaryContactPhone.trim()) {
      newErrors.primaryContactPhone = 'Phone number is required';
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
      const accountData = {
        ...formData,
        id: generateId('CORP'),
        customerCount: 0,
        totalBookings: 0,
        totalRevenue: 0,
        lastBooking: null,
        contractValue: 0,
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(accountData);
      
      // Reset form
      setFormData({
        companyName: '',
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        accountManager: 'Sarah Johnson',
        status: 'Active',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving corporate account:', error);
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
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Corporate Account
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
                  label="Company Name *"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  error={errors.companyName}
                  placeholder="Enter company name"
                />
              </div>

              <Input
                label="Primary Contact Name *"
                value={formData.primaryContactName}
                onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                error={errors.primaryContactName}
                placeholder="Enter contact name"
              />

              <Input
                label="Primary Contact Email *"
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                error={errors.primaryContactEmail}
                placeholder="Enter email address"
              />

              <Input
                label="Primary Contact Phone *"
                value={formData.primaryContactPhone}
                onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
                error={errors.primaryContactPhone}
                placeholder="Enter phone number"
              />

              <Select
                label="Account Manager"
                value={formData.accountManager}
                onChange={(e) => handleInputChange('accountManager', e.target.value)}
              >
                {accountManagers.map(manager => (
                  <option key={manager} value={manager}>{manager}</option>
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
                placeholder="Add any additional notes about this corporate account..."
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
                Save Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};