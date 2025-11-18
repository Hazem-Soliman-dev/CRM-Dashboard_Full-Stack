import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import ownerService from '../../services/ownerService';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: any) => Promise<void>;
}

const propertyTypes = ['Apartment', 'Villa', 'Commercial', 'Land'];
const statuses = ['Available', 'Reserved', 'Sold', 'Under Maintenance'];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Apartment',
    status: 'Available',
    nightlyRate: '',
    capacity: '',
    occupancy: '',
    description: '',
    ownerId: ''
  });
  const [owners, setOwners] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  const loadOwners = async () => {
    try {
      const data = await ownerService.getOwners();
      setOwners(data);
    } catch (error) {
      console.error('Failed to load owners:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.nightlyRate.trim()) {
      newErrors.nightlyRate = 'Nightly rate is required';
    } else if (isNaN(Number(formData.nightlyRate)) || Number(formData.nightlyRate) < 0) {
      newErrors.nightlyRate = 'Nightly rate must be a valid positive number';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 0) {
      newErrors.capacity = 'Capacity must be a valid positive number';
    }

    if (!formData.occupancy.trim()) {
      newErrors.occupancy = 'Occupancy is required';
    } else if (isNaN(Number(formData.occupancy)) || Number(formData.occupancy) < 0) {
      newErrors.occupancy = 'Occupancy must be a valid positive number';
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
      const propertyData = {
        name: formData.name,
        location: formData.location,
        type: formData.type,
        status: formData.status,
        nightlyRate: Number(formData.nightlyRate),
        capacity: Number(formData.capacity),
        occupancy: Number(formData.occupancy),
        description: formData.description || undefined,
        ownerId: formData.ownerId || undefined
      };

      await onSave(propertyData);
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        type: 'Apartment',
        status: 'Available',
        nightlyRate: '',
        capacity: '',
        occupancy: '',
        description: '',
        ownerId: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
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
              Add New Property
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
                label="Nightly Rate *"
                type="number"
                value={formData.nightlyRate}
                onChange={(e) => handleInputChange('nightlyRate', e.target.value)}
                error={errors.nightlyRate}
                placeholder="0.00"
              />

              <Input
                label="Capacity *"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                error={errors.capacity}
                placeholder="0"
              />

              <Input
                label="Occupancy *"
                type="number"
                value={formData.occupancy}
                onChange={(e) => handleInputChange('occupancy', e.target.value)}
                error={errors.occupancy}
                placeholder="0"
              />

              <Select
                label="Owner"
                value={formData.ownerId}
                onChange={(e) => handleInputChange('ownerId', e.target.value)}
              >
                <option value="">Select Owner (Optional)</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.companyName}</option>
                ))}
              </Select>
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
                placeholder="Add any additional description about this property..."
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
                Save Property
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

