import React from "react";
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "../ui/Button";
import { formatDate, formatCurrency } from "../../utils/format";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../../contexts/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ActionGuard } from "../auth/ActionGuard";
import customerService from "../../services/customerService";
import activityService from "../../services/activityService";

interface ViewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [bookingHistory, setBookingHistory] = React.useState<any[]>([]);
  const [activityHistory, setActivityHistory] = React.useState<any[]>([]);
  const navigate = useNavigate();
  const toast = useToastContext();
  const { canPerformAction } = usePermissions();

  React.useEffect(() => {
    if (isOpen && customer) {
      const fetchHistory = async () => {
        try {
          const bookingsResp = await customerService.getCustomerBookings(
            customer.id,
            1,
            100
          );
          const activities = await activityService.getActivitiesForCustomer(
            customer.id
          );
          
          // Extract bookings from response - handle different response structures
          let bookingsData: any[] = [];
          if (bookingsResp) {
            if (bookingsResp.data && Array.isArray(bookingsResp.data)) {
              // Paginated response structure: { data: [...], pagination: {...} }
              bookingsData = bookingsResp.data;
            } else if (bookingsResp.reservations && Array.isArray(bookingsResp.reservations)) {
              // Alternative structure: { reservations: [...] }
              bookingsData = bookingsResp.reservations;
            } else if (bookingsResp.bookings && Array.isArray(bookingsResp.bookings)) {
              // Alternative structure: { bookings: [...] }
              bookingsData = bookingsResp.bookings;
            } else if (Array.isArray(bookingsResp)) {
              // Direct array response
              bookingsData = bookingsResp;
            }
          }
          
          setBookingHistory(bookingsData);
          setActivityHistory(activities || []);
        } catch (error) {
          console.error("Failed to fetch customer history", error);
          toast.error("Could not load customer details.");
        }
      };
      fetchHistory();
    }
  }, [isOpen, customer, toast]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-booking":
        if (canPerformAction("bookings", "create")) {
          navigate("/reservations");
          toast.info("Redirecting", "Opening booking form for this customer");
          onClose();
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to create bookings."
          );
        }
        break;
      case "send-email":
        toast.success(
          "Email Sent",
          `Follow-up email sent to ${customer.email}`
        );
        // In real app, this would open email composer
        break;
      case "schedule-call":
        toast.success(
          "Call Scheduled",
          `Call scheduled with ${customer.name} for tomorrow at 2:00 PM`
        );
        // In real app, this would open calendar scheduler
        break;
      case "update-preferences":
        if (canPerformAction("customers", "update")) {
          toast.success(
            "Preferences Updated",
            `Customer preferences updated for ${customer.name}`
          );
          // In real app, this would open preferences modal
        } else {
          toast.error(
            "Access Denied",
            "You do not have permission to update customer preferences."
          );
        }
        break;
    }
  };

  if (!isOpen || !customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "VIP":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Recurring":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "call":
        return <Phone className="h-4 w-4 text-green-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "status_change":
        return <Tag className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalSpent = bookingHistory.reduce(
    (sum, booking) => sum + (booking.total_amount || 0),
    0
  );
  const avgBookingValue =
    bookingHistory.length > 0 ? totalSpent / bookingHistory.length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Customer Profile - {customer.name}
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
              {/* Customer Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Full Name
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Company
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.company || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customer Type
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Preferred Contact
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.contactMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Bookings
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.totalBookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Spent
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(totalSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Trip
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.lastTrip
                          ? formatDate(customer.lastTrip)
                          : "No trips yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking History */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Booking History
                    </h3>
                    {bookingHistory.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {bookingHistory.length} {bookingHistory.length === 1 ? 'booking' : 'bookings'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {bookingHistory.length > 0 ? (
                      bookingHistory.map((booking) => (
                        <div
                          key={booking.id || booking.reservation_id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {booking.service_type || booking.serviceType || "N/A"}
                                </p>
                                {booking.reservation_id && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    #{booking.reservation_id}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                                {booking.destination || "N/A"}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  Departure: {formatDate(booking.departure_date || booking.departureDate)}
                                </span>
                                {booking.return_date && (
                                  <span>
                                    Return: {formatDate(booking.return_date || booking.returnDate)}
                                  </span>
                                )}
                                {(booking.adults || booking.children || booking.infants) && (
                                  <span>
                                    {(booking.adults || 0) + (booking.children || 0) + (booking.infants || 0)} travelers
                                  </span>
                                )}
                              </div>
                              {booking.supplier_name && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Supplier: {booking.supplier_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">
                              {formatCurrency(booking.total_amount || booking.totalAmount || 0)}
                            </p>
                            <div className="flex flex-col items-end space-y-1">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                              {booking.payment_status && (
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    booking.payment_status === 'Paid'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : booking.payment_status === 'Partial'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                  }`}
                                >
                                  {booking.payment_status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No booking history found.
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Bookings will appear here once created.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {customer.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Customer Stats */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Customer Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Customer Since
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(customer.created_at || customer.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Lifetime Value
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg. Booking Value
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(avgBookingValue)}
                      </span>
                    </div>
                    {customer.status === "VIP" && (
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          VIP Customer
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {activityHistory.length > 0 ? (
                      activityHistory.map((activity) => (
                        <div key={activity.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by{" "}
                              {activity.performed_by?.full_name ||
                                activity.user?.name ||
                                "System"}{" "}
                              •{" "}
                              {formatDate(
                                activity.created_at || activity.createdAt
                              )}
                            </p>
                            {activity.details && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {typeof activity.details === "string" ? (
                                  activity.details
                                ) : (
                                  <div className="space-y-0.5">
                                    {Object.entries(activity.details).map(
                                      ([key, value]) => (
                                        <div key={key}>
                                          <span className="capitalize font-medium">
                                            {key}
                                          </span>
                                          :{" "}
                                          <span>
                                            {Array.isArray(value)
                                              ? value.join(", ")
                                              : String(value)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No recent activity.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <ActionGuard module="bookings" action="create">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleQuickAction("create-booking")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Create new booking
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="customers" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleQuickAction("send-email")}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send follow-up email
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="customers" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleQuickAction("schedule-call")}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Schedule call
                      </Button>
                    </ActionGuard>
                    <ActionGuard module="customers" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleQuickAction("update-preferences")}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Update preferences
                      </Button>
                    </ActionGuard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
