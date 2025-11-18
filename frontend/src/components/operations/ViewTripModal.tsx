import React from 'react';
import { X, MapPin, Users, Car, Calendar, Clock, Star, Phone, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency } from '../../utils/format';
import { OperationsTrip, OptionalService } from '../../services/operationsService';

interface ViewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: OperationsTrip | null;
  onEdit?: () => void;
}

const mockItineraryDetails = [
  {
    day: 1,
    date: '2025-01-15',
    activities: [
      { time: '08:00', activity: 'Hotel Pickup', location: 'Steigenberger Luxor', notes: 'Meet in lobby' },
      { time: '09:00', activity: 'Valley of Kings Tour', location: 'West Bank', notes: '3 tombs included' },
      { time: '12:00', activity: 'Lunch Break', location: 'Local Restaurant', notes: 'Traditional Egyptian cuisine' },
      { time: '14:00', activity: 'Karnak Temple', location: 'East Bank', notes: 'Sound & Light show optional' },
      { time: '17:00', activity: 'Hotel Return', location: 'Steigenberger Luxor', notes: 'End of day 1' }
    ]
  },
  {
    day: 2,
    date: '2025-01-16',
    activities: [
      { time: '07:00', activity: 'Check-out & Transfer', location: 'Hotel to Cruise', notes: 'Luggage assistance' },
      { time: '12:00', activity: 'Nile Cruise Boarding', location: 'Luxor Dock', notes: 'Welcome drink included' },
      { time: '16:00', activity: 'Sailing to Edfu', location: 'Nile River', notes: 'Afternoon tea on deck' },
      { time: '19:00', activity: 'Dinner on Board', location: 'Cruise Restaurant', notes: 'Captain\'s welcome dinner' }
    ]
  }
];

const mockRoomingList = [
  { room: 'Room 101', guests: 'Ahmed Hassan, Fatma Hassan', type: 'Double', notes: 'Nile view requested' },
  { room: 'Room 102', guests: 'Child: Omar Hassan (8 years)', type: 'Extra bed', notes: 'Connecting to parents' }
];

export const ViewTripModal: React.FC<ViewTripModalProps> = ({ isOpen, onClose, trip, onEdit }) => {
  if (!isOpen || !trip) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'In Progress': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Issue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'Delayed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const totalOptionalServicesValue = trip.optionalServices.reduce(
    (sum: number, service: OptionalService) => sum + Number(service.price ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Trip Details - {trip.tripCode}
            </h2>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trip Overview */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trip Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Itinerary</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.itinerary}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Itinerary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Detailed Itinerary
                  </h3>
                  <div className="space-y-6">
                    {mockItineraryDetails.map((day) => (
                      <div key={day.day} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Day {day.day} - {formatDate(day.date)}
                        </h4>
                        <div className="space-y-3">
                          {day.activities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 min-w-[60px]">
                                {activity.time}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{activity.activity}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.location}</p>
                                <p className="text-xs text-gray-400">{activity.notes}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rooming List */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Rooming List
                  </h3>
                  <div className="space-y-3">
                    {mockRoomingList.map((room, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{room.room}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{room.guests}</p>
                          <p className="text-xs text-gray-400">{room.notes}</p>
                        </div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">{room.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                {trip.specialRequests && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
                      Special Requests
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-400">{trip.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Staff Assignment */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Staff Assignment
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Guide</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.assignedGuide}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Driver</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.assignedDriver}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transport</p>
                        <p className="font-medium text-gray-900 dark:text-white">{trip.transport}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{trip.transportDetails}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Services */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Optional Services
                  </h3>
                  <div className="space-y-3">
                    {trip.optionalServices.length > 0 ? (
                      trip.optionalServices.map((service: OptionalService, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{service.serviceName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{service.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(service.price)}</p>
                            <Star className="h-4 w-4 text-orange-500 inline" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No optional services added</p>
                      </div>
                    )}
                    
                    {trip.optionalServices.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">Total Value:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalOptionalServicesValue)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Emergency Contacts
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 dark:text-blue-400">Guide: +20-123-456-789</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 dark:text-blue-400">Driver: +20-987-654-321</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 dark:text-blue-400">Operations: +20-555-123-456</span>
                    </div>
                  </div>
                </div>

                {/* Trip Notes */}
                {trip.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Trip Notes
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{trip.notes}</p>
                  </div>
                )}

                {/* Status Alerts */}
                {trip.status === 'Issue' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Active Issue
                      </h4>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      This trip has reported issues that need immediate attention.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};