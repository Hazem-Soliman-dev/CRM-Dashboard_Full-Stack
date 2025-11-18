import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Property } from '../../services/propertyService';
import propertyService from '../../services/propertyService';
import { useToastContext } from '../../contexts/ToastContext';

interface ManageListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onUpdate: () => void;
}

const propertyTypes: Property['type'][] = ['Apartment', 'Villa', 'Commercial', 'Land'];
const statuses: Property['status'][] = ['Available', 'Reserved', 'Sold', 'Under Maintenance'];

export const ManageListingModal: React.FC<ManageListingModalProps> = ({ isOpen, onClose, property, onUpdate }) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Apartment' as Property['type'],
    status: 'Available' as Property['status'],
    nightlyRate: '0',
    capacity: '0',
    occupancy: '0',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || '',
        location: property.location || '',
        type: property.type || 'Apartment',
        status: property.status || 'Available',
        nightlyRate: (property.nightlyRate || 0).toString(),
        capacity: (property.capacity || 0).toString(),
        occupancy: (property.occupancy || 0).toString(),
        description: property.description || ''
      });
    }
  }, [property, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (parseFloat(formData.nightlyRate) < 0) {
      newErrors.nightlyRate = 'Nightly rate must be a positive number';
    }

    if (parseInt(formData.capacity) < 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    if (parseInt(formData.occupancy) < 0 || parseInt(formData.occupancy) > 100) {
      newErrors.occupancy = 'Occupancy must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !property) {
      return;
    }

    setIsLoading(true);
    try {
      await propertyService.updateProperty(property.id, {
        name: formData.name,
        location: formData.location,
        type: formData.type,
        status: formData.status,
        nightlyRate: parseFloat(formData.nightlyRate) || 0,
        capacity: parseInt(formData.capacity) || 0,
        occupancy: parseInt(formData.occupancy) || 0,
        description: formData.description
      });

      toast.success('Listing Updated', 'Property listing has been updated successfully.');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to update listing');
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

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Listing - {property.name}
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
                label="Property Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter property name"
              />

              <Input
                label="Location *"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={errors.location}
                placeholder="Enter location"
              />

              <Select
                label="Property Type *"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

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
                label="Nightly Rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.nightlyRate}
                onChange={(e) => handleInputChange('nightlyRate', e.target.value)}
                error={errors.nightlyRate}
                placeholder="0.00"
              />

              <Input
                label="Capacity (guests)"
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                error={errors.capacity}
                placeholder="0"
              />

              <Input
                label="Occupancy (%)"
                type="number"
                min="0"
                max="100"
                value={formData.occupancy}
                onChange={(e) => handleInputChange('occupancy', e.target.value)}
                error={errors.occupancy}
                placeholder="0"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property description..."
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
                Update Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

