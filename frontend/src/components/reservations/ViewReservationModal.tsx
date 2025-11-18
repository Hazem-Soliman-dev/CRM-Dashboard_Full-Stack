import React from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Users, Bed, Utensils, Globe, Building, FileText, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { getStatusColor, getFinanceStatusColor } from '../../utils/statusColors';
import { useToastContext } from '../../contexts/ToastContext';

interface ViewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
}

const mockActivityLog = [
  {
    id: 1,
    type: 'created',
    description: 'Reservation created from Sales',
    user: 'Sales Team',
    timestamp: '2025-01-12T14:30:00Z',
    details: 'Initial booking request received'
  },
  {
    id: 2,
    type: 'assigned',
    description: 'Assigned to Reservation Agent',
    user: 'System',
    timestamp: '2025-01-12T14:35:00Z',
    details: 'Auto-assigned to Sarah Johnson'
  },
  {
    id: 3,
    type: 'supplier_contact',
    description: 'Contacted supplier for availability',
    user: 'Sarah Johnson',
    timestamp: '2025-01-13T09:15:00Z',
    details: 'Sent availability request to Steigenberger Hotels'
  },
  {
    id: 4,
    type: 'status_update',
    description: 'Status updated to Pending',
    user: 'Sarah Johnson',
    timestamp: '2025-01-13T16:45:00Z',
    details: 'Awaiting supplier confirmation'
  }
];

export const ViewReservationModal: React.FC<ViewReservationModalProps> = ({ isOpen, onClose, reservation }) => {
  const toast = useToastContext();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'contact-supplier':
        toast.success('Supplier Contacted', `Called ${reservation.supplier} regarding booking ${reservation.reservation_id || reservation.id}`);
        // In real app, this would log the call and update activity
        break;
      case 'update-status':
        toast.success('Status Updated', `Reservation ${reservation.reservation_id || reservation.id} status updated to "Confirmed"`);
        // In real app, this would open status update modal
        break;
      case 'request-payment':
        toast.success('Payment Requested', `Payment request sent to Finance for ${reservation.customer}`);
        // In real app, this would create a payment request
        break;
      case 'upload-documents':
        toast.info('Document Upload', 'Opening document upload interface');
        // In real app, this would open file upload modal
        break;
    }
  };

  if (!isOpen || !reservation) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'assigned': return <User className="h-4 w-4 text-green-500" />;
      case 'supplier_contact': return <Phone className="h-4 w-4 text-orange-500" />;
      case 'status_update': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reservation Details - {reservation.reservation_id || reservation.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nationality</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.nationality}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trip Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.tripItem}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check-in</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkIn)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check-out</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.checkOut)}</p>
                      </div>
                    </div>
                    {reservation.totalNights > 0 && (
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Nights</p>
                          <p className="font-medium text-gray-900 dark:text-white">{reservation.totalNights} nights</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Passengers</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {reservation.adults} Adults{reservation.children > 0 ? `, ${reservation.children} Children` : ''}
                        </p>
                        {reservation.children > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ages: {reservation.childAges.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Service Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Bed className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.roomType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Utensils className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Meal Plan</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.mealPlan}</p>
                      </div>
                    </div>
                    {reservation.rooms > 0 && (
                      <div className="flex items-center space-x-3">
                        <Bed className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Rooms</p>
                          <p className="font-medium text-gray-900 dark:text-white">{reservation.rooms}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {reservation.specialRequests && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Special Requests
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{reservation.specialRequests}</p>
                  </div>
                )}

                {/* Notes */}
                {reservation.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Internal Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{reservation.notes}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reservation Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Finance Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFinanceStatusColor(reservation.financeStatus)}`}>
                        {reservation.financeStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Agent</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.assignedAgent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(reservation.dueDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Activity Log
                  </h3>
                  <div className="space-y-4">
                    {mockActivityLog.map((activity) => (
                      <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {activity.user} • {formatDate(activity.timestamp)}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('contact-supplier')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact supplier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('update-status')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Update status
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('request-payment')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Request payment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('upload-documents')}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Upload documents
                    </Button>
                  </div>
                </div>
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