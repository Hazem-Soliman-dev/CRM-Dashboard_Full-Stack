import React from 'react';
import { X, Calendar, User, Users, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { OperationsTaskTripSummary } from '../../services/taskService';
import { formatDate } from '../../utils/format';

interface ViewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: OperationsTaskTripSummary | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'Issue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export const ViewTripModal: React.FC<ViewTripModalProps> = ({ isOpen, onClose, trip }) => {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Trip Details - {trip.tripCode}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Trip Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Trip Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trip Code</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.tripCode}</p>
                    </div>
                  </div>
                  
                  {trip.bookingReference && (
                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Booking Reference</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.bookingReference}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              {(trip.startDate || trip.endDate) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trip Dates
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {trip.startDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(trip.startDate)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {trip.endDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(trip.endDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned Staff */}
              {(trip.assignedGuide || trip.assignedDriver) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Assigned Staff
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {trip.assignedGuide && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Guide</p>
                          <p className="font-medium text-gray-900 dark:text-white">{trip.assignedGuide}</p>
                        </div>
                      </div>
                    )}
                    
                    {trip.assignedDriver && (
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Driver</p>
                          <p className="font-medium text-gray-900 dark:text-white">{trip.assignedDriver}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

