import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Property } from '../../services/propertyService';
import propertyService from '../../services/propertyService';
import { useToastContext } from '../../contexts/ToastContext';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onUpdate: () => void;
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ isOpen, onClose, property, onUpdate }) => {
  const toast = useToastContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'Available' | 'Reserved' | 'Unavailable'>('Available');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityCalendar, setAvailabilityCalendar] = useState<Record<string, { status: string; notes?: string }>>({});

  useEffect(() => {
    if (property && isOpen) {
      const fetchAvailability = async () => {
        try {
          const availabilityData = await propertyService.getPropertyAvailability(property.id);
          const availabilityMap = availabilityData.reduce((acc: any, curr: any) => {
            acc[curr.date] = { status: curr.status, notes: curr.notes };
            return acc;
          }, {});
          setAvailabilityCalendar(availabilityMap);
        } catch (error) {
          console.error('Failed to load availability:', error);
          toast.error('Error', 'Failed to load availability data');
        }
      };
      fetchAvailability();
    }
  }, [property, isOpen, toast]);

  const handleAddAvailability = () => {
    if (!selectedDate) {
      toast.error('Date Required', 'Please select a date');
      return;
    }

    setAvailabilityCalendar(prev => ({
      ...prev,
      [selectedDate]: { status: availabilityStatus, notes: availabilityNotes }
    }));

    setSelectedDate('');
    setAvailabilityStatus('Available');
    setAvailabilityNotes('');
  };

  const handleRemoveAvailability = (date: string) => {
    setAvailabilityCalendar(prev => {
      const newCalendar = { ...prev };
      delete newCalendar[date];
      return newCalendar;
    });
  };

  const handleSave = async () => {
    if (!property) return;

    setIsLoading(true);
    try {
      const availabilityData = Object.entries(availabilityCalendar).map(([date, { status, notes }]) => ({
        date,
        status,
        notes
      }));
      
      await propertyService.updatePropertyAvailability(property.id, availabilityData);

      toast.success('Availability Updated', 'Property availability calendar has been updated successfully.');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  // Generate next 30 days for quick selection
  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Availability - {property.name}
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
            {/* Add Availability */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add/Update Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Select
                  label="Status"
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value as 'Available' | 'Reserved' | 'Unavailable')}
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Unavailable">Unavailable</option>
                </Select>
                <Input
                  label="Notes (optional)"
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                  placeholder="Add notes for this date"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddAvailability}
                    className="w-full"
                  >
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </div>

            {/* Availability Calendar View */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability Calendar</h3>
              <div className="grid grid-cols-7 gap-2 max-h-96 overflow-y-auto">
                {next30Days.map((date) => {
                  const entry = availabilityCalendar[date];
                  const status = entry ? entry.status : 'Available';
                  const statusColors = {
                    Available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
                    Reserved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
                    Unavailable: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  };
                  
                  return (
                    <div
                      key={date}
                      className={`p-2 rounded text-xs text-center cursor-pointer hover:opacity-80 ${
                        statusColors[status as keyof typeof statusColors] || statusColors.Available
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        setAvailabilityStatus(status as 'Available' | 'Reserved' | 'Unavailable');
                        setAvailabilityNotes(entry?.notes || '');
                      }}
                      title={`${date}: ${status}`}
                    >
                      <div className="font-medium">{new Date(date).getDate()}</div>
                      <div className="text-xs opacity-75">{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listed Availability Entries */}
            {Object.keys(availabilityCalendar).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scheduled Availability</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(availabilityCalendar)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, { status, notes }]) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(date).toLocaleDateString()}
                          </span>
                          <span className={`ml-3 px-2 py-1 text-xs rounded ${
                            status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            status === 'Reserved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {status}
                          </span>
                          {notes && <p className="text-xs text-gray-500 mt-1">{notes}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAvailability(date)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              loading={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Availability
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

