import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { OperationsTrip, UpdateTripPayload, TripStatus } from '../../services/operationsService';
import { useToastContext } from '../../contexts/ToastContext';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripId: number, tripData: UpdateTripPayload) => Promise<void>;
  trip: OperationsTrip | null;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip
}) => {
  const { error: showError } = useToastContext();
  const [formData, setFormData] = useState<UpdateTripPayload>({
    customerName: '',
    customerCount: 1,
    itinerary: '',
    duration: '',
    startDate: '',
    endDate: '',
    destinations: [],
    assignedGuide: '',
    assignedDriver: '',
    transport: '',
    transportDetails: '',
    status: 'Planned',
    specialRequests: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [destinationsInput, setDestinationsInput] = useState('');

  useEffect(() => {
    if (trip) {
      setFormData({
        bookingReference: trip.bookingReference || '',
        customerName: trip.customerName,
        customerCount: trip.customerCount,
        itinerary: trip.itinerary || '',
        duration: trip.duration || '',
        startDate: trip.startDate || '',
        endDate: trip.endDate || '',
        destinations: trip.destinations || [],
        assignedGuide: trip.assignedGuide || '',
        assignedDriver: trip.assignedDriver || '',
        transport: trip.transport || '',
        transportDetails: trip.transportDetails || '',
        status: trip.status,
        specialRequests: trip.specialRequests || '',
        notes: trip.notes || ''
      });
      setDestinationsInput(trip.destinations?.join(', ') || '');
    }
  }, [trip]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !trip) {
      return;
    }

    setIsLoading(true);
    try {
      const payload: UpdateTripPayload = {
        ...formData,
        destinations: destinationsInput
          ? destinationsInput.split(',').map(d => d.trim()).filter(d => d.length > 0)
          : [],
        startDate: formData.startDate && formData.startDate.trim() ? formData.startDate : undefined,
        endDate: formData.endDate && formData.endDate.trim() ? formData.endDate : undefined,
        bookingReference: formData.bookingReference || undefined,
        itinerary: formData.itinerary || undefined,
        duration: formData.duration || undefined,
        assignedGuide: formData.assignedGuide || undefined,
        assignedDriver: formData.assignedDriver || undefined,
        transport: formData.transport || undefined,
        transportDetails: formData.transportDetails || undefined,
        specialRequests: formData.specialRequests || undefined,
        notes: formData.notes || undefined
      };
      await onSave(trip.id, payload);
      onClose();
    } catch (error: any) {
      console.error('Error updating trip:', error);
      showError(
        'Error',
        error.response?.data?.message || 'Failed to update trip. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateTripPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Trip - {trip.tripCode}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name *"
                  value={formData.customerName || ''}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={errors.customerName}
                  placeholder="Enter customer name"
                />

                <Input
                  label="Customer Count"
                  type="number"
                  min="1"
                  value={formData.customerCount || 1}
                  onChange={(e) => handleInputChange('customerCount', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Booking Reference"
                  value={formData.bookingReference || ''}
                  onChange={(e) => handleInputChange('bookingReference', e.target.value)}
                  placeholder="Booking reference"
                />

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as TripStatus)}
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Issue">Issue</option>
                  <option value="Completed">Completed</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Itinerary"
                  value={formData.itinerary || ''}
                  onChange={(e) => handleInputChange('itinerary', e.target.value)}
                  placeholder="Trip itinerary"
                />

                <Input
                  label="Duration"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3 days, 1 week"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destinations (comma-separated)
                </label>
                <Input
                  value={destinationsInput}
                  onChange={(e) => setDestinationsInput(e.target.value)}
                  placeholder="e.g., Luxor, Aswan, Cairo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Assigned Guide"
                  value={formData.assignedGuide || ''}
                  onChange={(e) => handleInputChange('assignedGuide', e.target.value)}
                  placeholder="Guide name"
                />

                <Input
                  label="Assigned Driver"
                  value={formData.assignedDriver || ''}
                  onChange={(e) => handleInputChange('assignedDriver', e.target.value)}
                  placeholder="Driver name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Transport"
                  value={formData.transport || ''}
                  onChange={(e) => handleInputChange('transport', e.target.value)}
                  placeholder="Transport type"
                />

                <Input
                  label="Transport Details"
                  value={formData.transportDetails || ''}
                  onChange={(e) => handleInputChange('transportDetails', e.target.value)}
                  placeholder="Additional transport details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests || ''}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Special requests or requirements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes"
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
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

