import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Tag, MessageSquare, Phone, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate, formatDateTime } from '../../utils/format';
import { useToastContext } from '../../contexts/ToastContext';
import supportService from '../../services/supportService';

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ isOpen, onClose, ticket }) => {
  const toast = useToastContext();
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Fetch notes when modal opens
  useEffect(() => {
    if (isOpen && ticket) {
      const fetchNotes = async () => {
        setLoadingNotes(true);
        setNotesError(null);
        try {
          // Use numericId for API calls, fallback to id if numericId not available
          const ticketId = ticket.numericId || ticket.id;
          const fetchedNotes = await supportService.getTicketNotes(ticketId);
          setNotes(fetchedNotes || []);
        } catch (error: any) {
          console.error('Failed to load notes:', error);
          setNotesError('Failed to load notes');
          toast.error('Error', error.response?.data?.message || 'Failed to load ticket notes');
        } finally {
          setLoadingNotes(false);
        }
      };
      fetchNotes();
    } else {
      setNotes([]);
      setNotesError(null);
    }
  }, [isOpen, ticket, toast]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call-customer':
        toast.success('Call Initiated', `Calling ${ticket.customer} at their registered number`);
        // In real app, this would initiate a call or open dialer
        break;
      case 'send-email':
        toast.success('Email Sent', `Update email sent to ${ticket.customer}`);
        // In real app, this would open email composer with ticket context
        break;
      case 'add-comment':
        toast.success('Comment Added', `Internal comment added to ticket ${ticket.id}`);
        // In real app, this would open comment modal
        break;
      case 'reassign-ticket':
        toast.success('Ticket Reassigned', `Ticket ${ticket.id} reassigned to Mike Chen`);
        // In real app, this would open reassignment modal
        break;
    }
  };

  if (!isOpen || !ticket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ticket Details - {ticket.id}
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
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ticket Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ticket Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Booking Reference</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.bookingRef}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.assignedTo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject & Description */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {ticket.subject}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Comments & Updates
                  </h3>
                  {loadingNotes && (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
                    </div>
                  )}
                  {notesError && (
                    <div className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 dark:text-red-400 text-sm">{notesError}</p>
                    </div>
                  )}
                  {!loadingNotes && !notesError && (
                    <div className="space-y-4">
                      {notes.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No comments yet</p>
                        </div>
                      ) : (
                        notes.map((note: any) => (
                          <div key={note.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {note.created_by_name || 'Unknown User'}
                                </span>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                  Note
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(note.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status & Priority */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status & Priority
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(ticket.dueDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag: string, index: number) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                      onClick={() => handleQuickAction('call-customer')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call customer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('send-email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('add-comment')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add comment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('reassign-ticket')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Reassign ticket
                    </Button>
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