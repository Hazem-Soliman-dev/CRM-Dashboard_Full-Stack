import React, { useState } from 'react';
import { X, Save, Star, Upload } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';

interface AddOptionalServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: {
    tripId: number;
    serviceName: string;
    price: number;
    category: string;
    description?: string;
    invoiceToFinance?: boolean;
    addedBy?: string;
  }) => Promise<void>;
  trips: OperationsTrip[];
  selectedTrip?: OperationsTrip | null;
}

const serviceCategories = [
  'Activity',
  'Entertainment', 
  'Photography',
  'Wellness',
  'Dining',
  'Shopping',
  'Transport',
  'Accommodation',
  'Guide Services',
  'Equipment',
  'Other'
];

const predefinedServices = [
  { name: 'Camel Ride', category: 'Activity', price: 50 },
  { name: 'Sound & Light Show', category: 'Entertainment', price: 30 },
  { name: 'Underwater Photos', category: 'Photography', price: 40 },
  { name: 'Spa Package', category: 'Wellness', price: 120 },
  { name: 'Traditional Dinner', category: 'Dining', price: 45 },
  { name: 'Felucca Ride', category: 'Activity', price: 25 },
  { name: 'Hot Air Balloon', category: 'Activity', price: 150 },
  { name: 'Private Guide', category: 'Guide Services', price: 80 },
  { name: 'Airport Transfer', category: 'Transport', price: 35 },
  { name: 'Room Upgrade', category: 'Accommodation', price: 60 }
];

export const AddOptionalServiceModal: React.FC<AddOptionalServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trips,
  selectedTrip
}) => {
  const [formData, setFormData] = useState({
    tripId: selectedTrip ? String(selectedTrip.id) : '',
    serviceName: '',
    price: '',
    category: 'Activity',
    description: '',
    invoiceToFinance: true,
    addedBy: 'Operations Team'
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (selectedTrip && isOpen) {
      setFormData(prev => ({ ...prev, tripId: String(selectedTrip.id) }));
    }
  }, [selectedTrip, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tripId) {
      newErrors.tripId = 'Trip selection is required';
    }

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
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
      const serviceData = {
        ...formData,
        price: Number(formData.price),
        attachment: attachmentFile,
        timestamp: new Date().toISOString()
      };

      await onSave({
        tripId: Number(serviceData.tripId),
        serviceName: serviceData.serviceName,
        price: Number(serviceData.price),
        category: serviceData.category,
        description: serviceData.description,
        invoiceToFinance: serviceData.invoiceToFinance,
        addedBy: serviceData.addedBy
      });
      
      // Reset form
      setFormData({
        tripId: selectedTrip ? String(selectedTrip.id) : '',
        serviceName: '',
        price: '',
        category: 'Activity',
        description: '',
        invoiceToFinance: true,
        addedBy: 'Operations Team'
      });
      setAttachmentFile(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error adding optional service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePredefinedServiceSelect = (service: any) => {
    setFormData(prev => ({
      ...prev,
      serviceName: service.name,
      category: service.category,
      price: service.price.toString()
    }));
  };

  const selectedTripData = trips.find(t => String(t.id) === formData.tripId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Optional Service
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Quick Service Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Service Selection
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {predefinedServices.map((service, index) => (
                  <button
                    key={index}
                    onClick={() => handlePredefinedServiceSelect(service)}
                    className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {service.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {service.category} • {formatCurrency(service.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Select Trip *"
                  value={formData.tripId}
                  onChange={(e) => handleInputChange('tripId', e.target.value)}
                  error={errors.tripId}
                >
                  <option value="">Select trip</option>
                  {trips
                    .filter(t => t.status !== 'Completed')
                    .map(trip => (
                      <option key={trip.id} value={trip.id}>
                        {trip.tripCode} - {trip.customerName} ({trip.itinerary})
                      </option>
                    ))}
                </Select>

                <Select
                  label="Service Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>

                <Input
                  label="Service Name *"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                  error={errors.serviceName}
                  placeholder="Enter service name"
                />

                <Input
                  label="Price *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  error={errors.price}
                  placeholder="Enter price"
                />
              </div>

              {selectedTripData && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Trip Information
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Customer:</strong> {selectedTripData.customerName} ({selectedTripData.customerCount} pax)</p>
                <p><strong>Itinerary:</strong> {selectedTripData.itinerary}</p>
                <p><strong>Dates:</strong> {selectedTripData.startDate ? formatDate(selectedTripData.startDate) : 'TBD'} - {selectedTripData.endDate ? formatDate(selectedTripData.endDate) : 'TBD'}</p>
                    <p><strong>Guide:</strong> {selectedTripData.assignedGuide}</p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the optional service..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Voucher/Agreement (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="attachment-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                        <span>Upload file</span>
                        <input
                          id="attachment-upload"
                          name="attachment-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setAttachmentFile(file);
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
                
                {attachmentFile && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Selected: {attachmentFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.invoiceToFinance}
                    onChange={(e) => handleInputChange('invoiceToFinance', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Send to Finance for invoicing
                  </span>
                </label>
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
                  Add Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};