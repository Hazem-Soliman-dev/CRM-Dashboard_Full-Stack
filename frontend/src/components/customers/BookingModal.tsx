import React, { useState } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { generateId } from '../../utils/format';
import productService from '../../services/productService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => Promise<void>;
  customer: any;
}

const durations = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '7', label: '1 Week' },
  { value: '14', label: '2 Weeks' },
  { value: '21', label: '3 Weeks' },
  { value: '30', label: '1 Month' }
];

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    service: '',
    destination: '',
    startDate: '',
    duration: '7',
    participants: '1',
    specialRequests: '',
    estimatedCost: '',
    amountPaid: '',
    deposit: '',
    balance: '',
    status: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState([
    { day: 'Day 1', title: '', description: '', image: null as File | null }
  ]);

  React.useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        try {
          const { products } = await productService.getAllProducts();
          setServices(products);
          if (products.length > 0) {
            setFormData(prev => ({ ...prev, service: products[0].id }));
          }
        } catch (error) {
          console.error('Failed to fetch services', error);
        }
      };
      fetchServices();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.participants || parseInt(formData.participants) < 1) {
      newErrors.participants = 'Number of participants must be at least 1';
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
      const bookingData = {
        ...formData,
        itinerary,
        id: generateId('BK'),
        customerId: customer.id,
        customerName: customer.name,
        status: formData.status || 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(bookingData);

      setFormData({
        service: services.length > 0 ? services[0].id : '',
        destination: '',
        startDate: '',
        duration: '7',
        participants: '1',
        specialRequests: '',
        estimatedCost: '',
        amountPaid: '',
        deposit: '',
        balance: '',
        status: ''
      });
      setItinerary([{ day: 'Day 1', title: '', description: '', image: null }]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
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

  const handleItineraryChange = (index: number, field: string, value: string | File) => {
    const updated = [...itinerary];
    (updated[index] as any)[field] = value;
    setItinerary(updated);
  };

  const handleAddDay = () => {
    const nextDay = `Day ${itinerary.length + 1}`;
    setItinerary([...itinerary, { day: nextDay, title: '', description: '', image: null }]);
  };

  const handleRemoveDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: `Day ${i + 1}` }));
    setItinerary(updated);
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Booking for {customer.name}
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
              <Select label="Service" value={formData.service} onChange={(e) => handleInputChange('service', e.target.value)}>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </Select>

              <Input label="Destination *" value={formData.destination} onChange={(e) => handleInputChange('destination', e.target.value)} error={errors.destination} placeholder="Enter destination" />

              <Input label="Start Date *" type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} error={errors.startDate} min={new Date().toISOString().split('T')[0]} />

              <Select label="Duration" value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)}>
                {durations.map(duration => (
                  <option key={duration.value} value={duration.value}>{duration.label}</option>
                ))}
              </Select>

              <Input label="Number of Participants *" type="number" value={formData.participants} onChange={(e) => handleInputChange('participants', e.target.value)} error={errors.participants} min="1" placeholder="Enter number of participants" />

              <Input label="Estimated Cost" type="number" value={formData.estimatedCost} onChange={(e) => handleInputChange('estimatedCost', e.target.value)} placeholder="Enter estimated cost (optional)" />
            </div>

            {/* Itinerary Section */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Itinerary</h4>
              <div className="space-y-4">
                {itinerary.map((entry, index) => (
                  <div key={index} className="grid md:grid-cols-5 gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded items-center">
                    <Input placeholder="Title" value={entry.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} />
                    <div className="md:col-span-3">
                      <Input placeholder="Description" value={entry.description} onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItineraryChange(index, 'image', e.target.files?.[0] as File)} />
                        <span className="text-blue-600 hover:underline">🖼️</span>
                      </label>
                      <button type="button" onClick={() => handleRemoveDay(index)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={handleAddDay} className="mt-4">+ Add Day</Button>
            </div>

            {/* Payment Tracking */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Amount Paid" type="number" value={formData.amountPaid} onChange={(e) => handleInputChange('amountPaid', e.target.value)} placeholder="e.g. 1000" />
              <Input label="Deposit" type="number" value={formData.deposit} onChange={(e) => handleInputChange('deposit', e.target.value)} placeholder="e.g. 200" />
              <Input label="Remaining Balance" type="number" value={formData.balance} onChange={(e) => handleInputChange('balance', e.target.value)} placeholder="Auto or manual" />
            </div>

            {/* Status Update */}
            <div className="mt-6">
              <Select label="Booking Status" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                <option value="">Select status</option>
                <option value="booked">Booked</option>
                <option value="paid">Paid</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            {/* Special Requests */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requests or requirements..."
              />
            </div>

            {/* Customer Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-400">Name: </span>
                  <span className="text-blue-800 dark:text-blue-300">{customer.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-400">Email: </span>
                  <span className="text-blue-800 dark:text-blue-300">{customer.email}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-400">Phone: </span>
                  <span className="text-blue-800 dark:text-blue-300">{customer.phone}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-400">Type: </span>
                  <span className="text-blue-800 dark:text-blue-300">{customer.type}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} loading={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};