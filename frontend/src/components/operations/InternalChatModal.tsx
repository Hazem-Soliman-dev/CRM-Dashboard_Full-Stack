import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';
import tripNoteService, { TripNote } from '../../services/tripNoteService';
import { useToastContext } from '../../contexts/ToastContext';

interface InternalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: OperationsTrip | null;
}

const departments = ['Sales', 'Reservation', 'Finance', 'Support', 'Operations'];

export const InternalChatModal: React.FC<InternalChatModalProps> = ({ 
  isOpen, 
  onClose, 
  trip 
}) => {
  const { success: showSuccess, error: showError } = useToastContext();
  const [newMessage, setNewMessage] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('Sales');
  const [messageType, setMessageType] = useState<'message' | 'update' | 'alert'>('message');
  const [chatHistory, setChatHistory] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen && trip?.id) {
      loadChatHistory();
    }
  }, [isOpen, trip?.id]);

  const loadChatHistory = async () => {
    if (!trip?.id) return;
    
    setLoading(true);
    try {
      const notes = await tripNoteService.getNotesByTrip(trip.id);
      // Filter to show interdepartmental notes (internal chat)
      const interdepartmentalNotes = notes.filter(
        note => note.note_type === 'interdepartmental' || note.note_type === 'internal'
      );
      setChatHistory(interdepartmentalNotes);
    } catch (error: any) {
      console.error('Failed to load chat history:', error);
      showError('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !trip?.id) return;

    setSending(true);
    try {
      // Add message type prefix to note text for better categorization
      let noteText = newMessage;
      if (messageType === 'alert') {
        noteText = `[ALERT] ${noteText}`;
      } else if (messageType === 'update') {
        noteText = `[UPDATE] ${noteText}`;
      }

      // Create the note
      const noteData = {
        note: noteText,
        note_type: 'interdepartmental' as const,
        target_department: targetDepartment,
      };

      await tripNoteService.createNote(trip.id, noteData);
      
      showSuccess('Message Sent', 'Your message has been sent successfully.');
      setNewMessage('');
      
      // Reload chat history
      await loadChatHistory();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showError('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMessageTypeColor = (note: TripNote) => {
    const noteText = note.note.toLowerCase();
    if (noteText.startsWith('[alert]')) {
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    } else if (noteText.startsWith('[update]')) {
      return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
    return 'bg-gray-50 dark:bg-gray-700';
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'Sales': return 'text-blue-600 dark:text-blue-400';
      case 'Reservation': return 'text-green-600 dark:text-green-400';
      case 'Operations': return 'text-purple-600 dark:text-purple-400';
      case 'Finance': return 'text-orange-600 dark:text-orange-400';
      case 'Support': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getNoteDisplayText = (note: TripNote) => {
    // Remove prefix if present
    let text = note.note;
    if (text.startsWith('[ALERT]')) {
      text = text.substring(7).trim();
    } else if (text.startsWith('[UPDATE]')) {
      text = text.substring(8).trim();
    }
    return text;
  };

  const isAlert = (note: TripNote) => {
    return note.note.toUpperCase().startsWith('[ALERT]');
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Internal Communication - {trip.tripCode}
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
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                Trip Information
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                <p><strong>Customer:</strong> {trip.customerName} ({trip.customerCount} pax)</p>
                <p><strong>Itinerary:</strong> {trip.itinerary}</p>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Dates:</strong> {trip.startDate ? formatDate(trip.startDate) : 'TBD'} - {trip.endDate ? formatDate(trip.endDate) : 'TBD'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chat History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Communication History
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {chatHistory.map((note) => (
                      <div key={note.id} className={`p-4 rounded-lg ${getMessageTypeColor(note)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getDepartmentColor(note.created_by_user?.department || 'Operations')}`}>
                              {note.created_by_user?.full_name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({note.created_by_user?.department || note.target_department || 'Operations'})
                            </span>
                            {isAlert(note) && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(note.created_at)}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{getNoteDisplayText(note)}</p>
                        {note.target_department && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            → To: {note.target_department}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send New Message */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Send Message
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="To Department"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>

                    <Select
                      label="Message Type"
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as 'message' | 'update' | 'alert')}
                    >
                      <option value="message">General Message</option>
                      <option value="update">Status Update</option>
                      <option value="alert">Alert/Urgent</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Send message to ${targetDepartment}...`}
                    />
                  </div>

                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    loading={sending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : `Send to ${targetDepartment}`}
                  </Button>
                </div>

                {/* Quick Templates */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Templates
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setNewMessage('Trip is proceeding as planned. All services confirmed and staff assigned.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Trip proceeding as planned
                    </button>
                    <button
                      onClick={() => setNewMessage('Customer has requested additional services. Please coordinate pricing and availability.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Additional services requested
                    </button>
                    <button
                      onClick={() => setNewMessage('Minor delay due to weather conditions. Estimated 2-hour delay. Customer informed.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Weather delay notification
                    </button>
                    <button
                      onClick={() => setNewMessage('Trip completed successfully. Customer feedback was excellent. All services delivered as planned.')}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      • Trip completion update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};