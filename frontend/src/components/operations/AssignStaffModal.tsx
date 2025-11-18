import React, { useState } from 'react';
import { X, Save, Users } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: {
    tripId: number;
    assignedGuide: string;
    assignedDriver: string;
    transport: string;
    transportDetails: string;
    notes?: string;
  }) => Promise<void>;
  trip: OperationsTrip | null;
}

const guides = [
  'Ahmed (Guide)',
  'Fatma (Tour Leader)', 
  'Omar (Dive Guide)',
  'Nour (Cruise Rep)',
  'Khaled (Safari Guide)',
  'Mona (City Guide)',
  'Hassan (Senior Guide)'
];

const drivers = [
  'Mahmoud (Driver)',
  'Hassan (Driver)',
  'Ali (Captain)',
  'Mostafa (4WD Driver)',
  'Youssef (Bus Driver)',
  'Tarek (Boat Captain)',
  'Sayed (Minibus Driver)'
];

const vehicles = [
  'AC Minibus',
  'AC Bus (45 seats)',
  'Diving Boat',
  'Nile Cruise Ship',
  '4WD Jeep',
  'Luxury Car',
  'Standard Car',
  'Speedboat',
  'Felucca'
];

const vehicleDetails = {
  'AC Minibus': 'Toyota Hiace, 14 seats, AC, WiFi',
  'AC Bus (45 seats)': 'Mercedes Sprinter, Group transport, AC',
  'Diving Boat': 'Speedboat with diving equipment',
  'Nile Cruise Ship': 'MS Nile Princess, Deluxe cabin',
  '4WD Jeep': 'Toyota Land Cruiser, Camping equipment',
  'Luxury Car': 'Mercedes E-Class, Premium service',
  'Standard Car': 'Toyota Camry, Standard service',
  'Speedboat': 'Fast boat for island transfers',
  'Felucca': 'Traditional sailing boat'
};

export const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip
}) => {
  const [formData, setFormData] = useState({
    guide: '',
    driver: '',
    transport: '',
    transportDetails: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (trip && isOpen) {
      setFormData({
        guide: trip.assignedGuide || '',
        driver: trip.assignedDriver || '',
        transport: trip.transport || '',
        transportDetails: trip.transportDetails || '',
        notes: ''
      });
    }
  }, [trip, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guide) {
      newErrors.guide = 'Guide assignment is required';
    }

    if (!formData.driver) {
      newErrors.driver = 'Driver assignment is required';
    }

    if (!formData.transport) {
      newErrors.transport = 'Transport selection is required';
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
      if (!trip) {
        return;
      }

      const staffData = {
        ...formData,
        tripId: trip.id,
        updatedBy: 'Operations Team',
        timestamp: new Date().toISOString()
      };

      await onSave({
        tripId: staffData.tripId,
        assignedGuide: staffData.guide,
        assignedDriver: staffData.driver,
        transport: staffData.transport,
        transportDetails: staffData.transportDetails,
        notes: staffData.notes
      });
      onClose();
    } catch (error) {
      console.error('Error assigning staff:', error);
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

  const handleTransportChange = (transport: string) => {
    setFormData(prev => ({
      ...prev,
      transport,
      transportDetails: vehicleDetails[transport as keyof typeof vehicleDetails] || ''
    }));
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assign Staff & Vehicle - {trip.tripCode}
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
            {/* Trip Info */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                Trip Information
              </h4>
              <div className="text-sm text-orange-700 dark:text-orange-400">
                <p><strong>Customer:</strong> {trip.customerName} ({trip.customerCount} pax)</p>
                <p><strong>Itinerary:</strong> {trip.itinerary}</p>
                <p><strong>Duration:</strong> {trip.duration}</p>
                <p><strong>Dates:</strong> {trip.startDate ? formatDate(trip.startDate) : 'TBD'} - {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Select
                  label="Assign Guide *"
                  value={formData.guide}
                  onChange={(e) => handleInputChange('guide', e.target.value)}
                  error={errors.guide}
                >
                  <option value="">Select guide</option>
                  {guides.map(guide => (
                    <option key={guide} value={guide}>{guide}</option>
                  ))}
                </Select>

                <Select
                  label="Assign Driver *"
                  value={formData.driver}
                  onChange={(e) => handleInputChange('driver', e.target.value)}
                  error={errors.driver}
                >
                  <option value="">Select driver</option>
                  {drivers.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </Select>

                <Select
                  label="Assign Vehicle *"
                  value={formData.transport}
                  onChange={(e) => handleTransportChange(e.target.value)}
                  error={errors.transport}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle} value={vehicle}>{vehicle}</option>
                  ))}
                </Select>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Details
                  </label>
                  <textarea
                    value={formData.transportDetails}
                    onChange={(e) => handleInputChange('transportDetails', e.target.value)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vehicle specifications and details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignment Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any special instructions or notes..."
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
                  Assign Staff
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};