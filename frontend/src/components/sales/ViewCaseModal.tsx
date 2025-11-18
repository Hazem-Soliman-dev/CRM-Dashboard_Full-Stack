import React from 'react';
import { X, User, Mail, Phone, Calendar, FileText, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { useToastContext } from '../../contexts/ToastContext';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../ui/Pagination';

interface ViewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
}

const mockActivityLog = [
  {
    id: 1,
    type: 'status_change',
    description: 'Status changed from "New" to "In Progress"',
    user: 'Sarah Johnson',
    timestamp: '2025-01-15T10:30:00Z',
    details: 'Customer responded positively to initial contact'
  },
  {
    id: 2,
    type: 'quotation',
    description: 'Quotation sent to customer',
    user: 'Sarah Johnson',
    timestamp: '2025-01-14T16:45:00Z',
    details: 'Detailed quotation including all requested items'
  },
  {
    id: 3,
    type: 'note',
    description: 'Internal note added',
    user: 'Mike Chen',
    timestamp: '2025-01-14T09:15:00Z',
    details: 'Customer prefers morning flights and 4-star hotels'
  },
  {
    id: 4,
    type: 'created',
    description: 'Case created',
    user: 'Sarah Johnson',
    timestamp: '2025-01-12T14:20:00Z',
    details: 'Initial inquiry received via website contact form'
  }
];

export const ViewCaseModal: React.FC<ViewCaseModalProps> = ({ isOpen, onClose, caseData }) => {
  const toast = useToastContext();
  const [totalLinked, setTotalLinked] = React.useState(0);
  const [totalActivities, setTotalActivities] = React.useState(0);
  const linkedPager = usePagination({ perPage: 3, total: totalLinked });
  const activityPager = usePagination({ perPage: 3, total: totalActivities });
  React.useEffect(() => {
    setTotalLinked(caseData?.linkedItems?.length || 0);
  }, [caseData?.linkedItems?.length]);
  React.useEffect(() => {
    setTotalActivities(mockActivityLog.length);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send-email':
        toast.success('Email Sent', `Follow-up email sent to ${caseData.customer}`);
        // In real app, this would open email composer
        break;
      case 'update-status':
        toast.success('Status Updated', `Case ${caseData.id} status updated to "In Progress"`);
        // In real app, this would open status update modal
        break;
      case 'schedule-meeting':
        toast.success('Meeting Scheduled', `Meeting scheduled with ${caseData.customer} for next Tuesday at 3:00 PM`);
        // In real app, this would open meeting scheduler
        break;
      case 'generate-quotation':
        toast.success('Quotation Generated', `New quotation created for case ${caseData.id}`);
        // In real app, this would open quotation generator
        break;
    }
  };

  if (!isOpen || !caseData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Awaiting Reply': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Quotation Sent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Won': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getQuotationStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'Sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'quotation': return <Package className="h-4 w-4 text-green-500" />;
      case 'note': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'created': return <User className="h-4 w-4 text-gray-500" />;
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
              Case Details - {caseData.id}
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
              {/* Case Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Case Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseData.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Case Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseData.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseData.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseData.customerPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Case Status & Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                        {caseData.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quotation Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuotationStatusColor(caseData.quotationStatus)}`}>
                        {caseData.quotationStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Agent</p>
                      <p className="font-medium text-gray-900 dark:text-white">{caseData.assignedAgent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                      <p className="font-medium text-gray-900 dark:text-white">{caseData.departments.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(caseData.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
                      <p className="font-medium text-gray-900 dark:text-white">{caseData.lastActivity}</p>
                    </div>
                  </div>
                </div>

                {/* Linked Items */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Linked Items
                  </h3>
                  <div className="space-y-2">
                    {(caseData.linkedItems || [])
                      .slice(linkedPager.offset, linkedPager.offset + linkedPager.perPage)
                      .map((item: string, index: number) => (
                      <button
                        key={`${index}-${item}`}
                        className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full text-left"
                      >
                        <Package className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{item}</span>
                      </button>
                    ))}
                  </div>
                  <Pagination
                    page={linkedPager.page}
                    pageCount={linkedPager.pageCount}
                    perPage={linkedPager.perPage}
                    total={totalLinked}
                    onPageChange={(p) => linkedPager.setPage(p)}
                    compact
                  />
                </div>

                {caseData.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{caseData.notes}</p>
                  </div>
                )}
              </div>

              {/* Activity Log */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Activity Log
                  </h3>
                  <div className="space-y-4">
                    {mockActivityLog
                      .slice(activityPager.offset, activityPager.offset + activityPager.perPage)
                      .map((activity) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    page={activityPager.page}
                    pageCount={activityPager.pageCount}
                    perPage={activityPager.perPage}
                    total={totalActivities}
                    onPageChange={(p) => activityPager.setPage(p)}
                    compact
                  />
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
                      onClick={() => handleQuickAction('send-email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send follow-up email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('update-status')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Update case status
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('schedule-meeting')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule meeting
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('generate-quotation')}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Generate quotation
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