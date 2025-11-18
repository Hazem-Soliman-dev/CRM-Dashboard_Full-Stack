import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Eye, Check, MessageSquare, Calendar, ChevronDown, Clock, User, Phone, Mail, Save, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import leadService from '../../services/leadService';
import { Lead } from '../../services/leadService';
import { useToastContext } from '../../contexts/ToastContext';

interface OverdueLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Legacy mock data - kept for reference
const mockOverdueLeads = [
  {
    id: 'LD-2025-004',
    name: 'Michael Brown',
    email: 'michael@email.com',
    phone: '+1-555-987-6543',
    company: 'Brown Industries',
    source: 'Website',
    type: 'B2B',
    agent: 'Sarah Johnson',
    status: 'Contacted',
    dateAdded: '2025-01-08',
    lastFollowUp: '2025-01-10',
    daysSinceLastContact: 5,
    priority: 'High',
    notes: 'Interested in premium package, waiting for budget approval'
  },
  {
    id: 'LD-2025-005',
    name: 'Tech Innovations Ltd',
    email: 'contact@techinnovations.com',
    phone: '+1-555-123-9876',
    company: 'Tech Innovations Ltd',
    source: 'Email',
    type: 'B2B',
    agent: 'Mike Chen',
    status: 'Qualified',
    dateAdded: '2025-01-05',
    lastFollowUp: '2025-01-07',
    daysSinceLastContact: 8,
    priority: 'Critical',
    notes: 'Hot lead, decision maker confirmed interest'
  },
  {
    id: 'LD-2025-006',
    name: 'Jennifer Wilson',
    email: 'jennifer@email.com',
    phone: '+1-555-456-7890',
    company: null,
    source: 'Social Media',
    type: 'B2C',
    agent: 'Lisa Rodriguez',
    status: 'Proposal',
    dateAdded: '2025-01-03',
    lastFollowUp: '2025-01-06',
    daysSinceLastContact: 9,
    priority: 'Critical',
    notes: 'Proposal sent, awaiting response'
  },
  {
    id: 'LD-2025-007',
    name: 'Robert Martinez',
    email: 'robert.martinez@email.com',
    phone: '+1-555-789-0123',
    company: 'Martinez Consulting',
    source: 'Referral',
    type: 'B2B',
    agent: 'Sarah Johnson',
    status: 'Negotiation',
    dateAdded: '2025-01-02',
    lastFollowUp: '2025-01-05',
    daysSinceLastContact: 10,
    priority: 'High',
    notes: 'Price negotiation in progress'
  }
];

const statusOptions = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

export const OverdueLeadsModal: React.FC<OverdueLeadsModalProps> = ({ isOpen, onClose }) => {
  const toast = useToastContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'client'>('internal');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderType, setReminderType] = useState('Call');
  const [reminderNote, setReminderNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOverdueLeads();
    }
  }, [isOpen]);

  const loadOverdueLeads = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all leads
      const { leads: allLeads } = await leadService.getAllLeads({ limit: 1000 });

      // Filter leads where next_followup is in the past
      const overdueLeads = allLeads.filter((lead: Lead) => {
        if (!lead.next_followup) return false;
        const followupDate = new Date(lead.next_followup);
        followupDate.setHours(0, 0, 0, 0);
        return followupDate < today;
      });

      setLeads(overdueLeads);
    } catch (error: any) {
      console.error('Error loading overdue leads:', error);
      toast.error('Error', error.userMessage || 'Failed to load overdue leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Contacted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Transform leads to display format
  const transformedLeads = leads.map(lead => {
    const lastFollowUp = lead.last_contact_date || lead.created_at;
    const followupDate = lead.next_followup ? new Date(lead.next_followup) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastContact = lastFollowUp 
      ? Math.floor((today.getTime() - new Date(lastFollowUp).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || null,
      source: lead.source || 'Unknown',
      type: lead.type || 'B2C',
      agent: lead.assigned_to_user?.full_name || 'Unassigned',
      status: lead.status,
      dateAdded: lead.created_at,
      lastFollowUp,
      daysSinceLastContact,
      priority: lead.priority || 'Medium',
      notes: lead.notes || ''
    };
  });

  const filteredLeads = transformedLeads.filter(lead => {
    if (priorityFilter !== 'All' && lead.priority !== priorityFilter) return false;
    if (agentFilter !== 'All' && lead.agent !== agentFilter) return false;
    return true;
  });

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await leadService.updateLead(leadId, { status: newStatus as any });
      await loadOverdueLeads(); // Reload to get updated data
      setEditingStatus(null);
      toast.success('Success', 'Lead status updated successfully');
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      toast.error('Error', error.userMessage || 'Failed to update lead status');
    }
  };

  const handlePriorityUpdate = async (leadId: string, newPriority: string) => {
    try {
      await leadService.updateLead(leadId, { priority: newPriority as any });
      await loadOverdueLeads(); // Reload to get updated data
      setEditingPriority(null);
      toast.success('Success', 'Lead priority updated successfully');
    } catch (error: any) {
      console.error('Error updating lead priority:', error);
      toast.error('Error', error.userMessage || 'Failed to update lead priority');
    }
  };

  const handleMarkFollowedUp = (leadId: string) => {
    // Update lead status and reset overdue counter
    console.log(`Marking lead ${leadId} as followed up - updating status and resetting counter`);
    // In real app: update Supabase with new status and last_contact date
  };

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const handleAddNote = (lead: any) => {
    setSelectedLead(lead);
    setNoteText('');
    setNoteType('internal');
    setShowNoteModal(true);
  };

  const handleScheduleReminder = (lead: any) => {
    setSelectedLead(lead);
    setReminderDate('');
    setReminderTime('');
    setReminderType('Call');
    setReminderNote('');
    setShowReminderModal(true);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    console.log('Saving note:', {
      leadId: selectedLead?.id,
      type: noteType,
      note: noteText,
      timestamp: new Date().toISOString()
    });
    // In real app: save to Supabase activity log
    setShowNoteModal(false);
  };

  const handleSaveReminder = () => {
    if (!reminderDate || !reminderTime) return;
    
    console.log('Saving reminder:', {
      leadId: selectedLead?.id,
      type: reminderType,
      date: reminderDate,
      time: reminderTime,
      note: reminderNote,
      timestamp: new Date().toISOString()
    });
    // In real app: save to Supabase reminders table
    setShowReminderModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Overdue Follow-ups ({filteredLeads.length})
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
              {/* Alert Banner */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Urgent Attention Required
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      These leads haven't been contacted for 5+ days and need immediate follow-up to prevent loss.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option>All Priorities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </Select>
                <Select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <option>All Staff</option>
                  <option>Sarah Johnson</option>
                  <option>Mike Chen</option>
                  <option>Lisa Rodriguez</option>
                </Select>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing leads not contacted for 5+ days
                </div>
              </div>

              {/* Overdue Leads Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lead Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Assigned Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Days Overdue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <button
                                onClick={() => handleViewLead(lead)}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                {lead.name}
                              </button>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {lead.id}
                              </div>
                              {lead.company && (
                                <div className="text-xs text-gray-400">
                                  {lead.company}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                {lead.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                {lead.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {lead.agent}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStatus === lead.id ? (
                              <select
                                className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                defaultValue={lead.status}
                                onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                                onBlur={() => setEditingStatus(null)}
                                autoFocus
                              >
                                {statusOptions.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingStatus(lead.id)}
                                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)} hover:opacity-80`}
                              >
                                {lead.status}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(lead.lastFollowUp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setShowActivityLog(showActivityLog === lead.id ? null : lead.id)}
                              className="flex items-center text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              {lead.daysSinceLastContact} days
                            </button>
                            {showActivityLog === lead.id && (
                              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Activity</h4>
                                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                  <div>Last contact: {formatDate(lead.lastFollowUp)}</div>
                                  <div>Status: {lead.status}</div>
                                  <div>Notes: {lead.notes}</div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPriority === lead.id ? (
                              <select
                                className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                defaultValue={lead.priority}
                                onChange={(e) => handlePriorityUpdate(lead.id, e.target.value)}
                                onBlur={() => setEditingPriority(null)}
                                autoFocus
                              >
                                {priorityOptions.map(priority => (
                                  <option key={priority} value={priority}>{priority}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingPriority(lead.id)}
                                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(lead.priority)} hover:opacity-80`}
                              >
                                {lead.priority}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewLead(lead)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleMarkFollowedUp(lead.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Mark as Followed-up"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleAddNote(lead)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                title="Add Note"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleScheduleReminder(lead)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                title="Schedule Reminder"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No overdue leads found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    All leads are up to date with recent follow-ups.
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Lead Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowViewModal(false)} />
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lead Details - {selectedLead.name}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-500">Name:</span> {selectedLead.name}</p>
                      <p><span className="text-gray-500">Email:</span> {selectedLead.email}</p>
                      <p><span className="text-gray-500">Phone:</span> {selectedLead.phone}</p>
                      <p><span className="text-gray-500">Company:</span> {selectedLead.company || 'N/A'}</p>
                      <p><span className="text-gray-500">Status:</span> 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLead.status)}`}>
                          {selectedLead.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Activity History</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium">Status changed to {selectedLead.status}</p>
                        <p className="text-xs text-gray-500">by {selectedLead.agent} • {formatDate(selectedLead.lastFollowUp)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium">Lead created</p>
                        <p className="text-xs text-gray-500">Added to system • {formatDate(selectedLead.lastFollowUp)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    ⚠️ This lead has been overdue for {selectedLead.daysSinceLastContact} days
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    {selectedLead.notes}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowViewModal(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setShowViewModal(false);
                    handleAddNote(selectedLead);
                  }}>
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedLead && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNoteModal(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Note/Message - {selectedLead.name}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="internal"
                        checked={noteType === 'internal'}
                        onChange={(e) => setNoteType(e.target.value as 'internal' | 'client')}
                        className="mr-2"
                      />
                      <span className="text-sm">Internal Note</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="client"
                        checked={noteType === 'client'}
                        onChange={(e) => setNoteType(e.target.value as 'internal' | 'client')}
                        className="mr-2"
                      />
                      <span className="text-sm">Send to Client</span>
                    </label>
                  </div>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder={noteType === 'internal' ? 'Add internal note...' : 'Message to send to client...'}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote} disabled={!noteText.trim()}>
                    {noteType === 'internal' ? (
                      <><Save className="h-4 w-4 mr-2" />Save Note</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />Send Message</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedLead && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowReminderModal(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Schedule Reminder - {selectedLead.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Type
                    </label>
                    <select
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Date
                    </label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Note
                    </label>
                    <textarea
                      value={reminderNote}
                      onChange={(e) => setReminderNote(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder={`What should we remind you about this ${reminderType.toLowerCase()}?`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowReminderModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveReminder} disabled={!reminderDate || !reminderTime}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule {reminderType}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};