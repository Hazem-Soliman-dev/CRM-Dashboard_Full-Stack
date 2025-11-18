import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Send, Trash2, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import reservationNoteService, { ReservationNote } from '../../services/reservationNoteService';
import { useToastContext } from '../../contexts/ToastContext';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (note: string) => Promise<void>; // Optional for backward compatibility
  reservation: any;
}

const departments = ['Sales', 'Finance', 'Operations', 'Customer Service'];

export const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, onSave, reservation }) => {
  const toast = useToastContext();
  const [notes, setNotes] = useState<ReservationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'interdepartmental'>('internal');
  const [targetDepartment, setTargetDepartment] = useState('Sales');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // Load notes when modal opens
  useEffect(() => {
    if (isOpen && reservation?.id) {
      loadNotes();
    }
  }, [isOpen, reservation?.id]);

  const loadNotes = async () => {
    if (!reservation?.id) return;
    
    setIsLoadingNotes(true);
    try {
      const fetchedNotes = await reservationNoteService.getNotesByReservationId(reservation.id);
      setNotes(fetchedNotes);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      toast.error('Error', 'Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      return;
    }

    if (!reservation?.id) {
      toast.error('Error', 'Reservation ID is required');
      return;
    }

    setIsLoading(true);
    try {
      await reservationNoteService.createNote(reservation.id, {
        note: newNote,
        note_type: noteType,
        target_department: noteType === 'interdepartmental' ? targetDepartment : undefined
      });

      setNewNote('');
      setNoteType('internal');
      setTargetDepartment('Sales');
      await loadNotes();
      toast.success('Success', 'Note created successfully');
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (note: ReservationNote) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.note);
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editNoteContent.trim()) {
      toast.error('Error', 'Note content cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await reservationNoteService.updateNote(noteId, {
        note: editNoteContent
      });

      setEditingNoteId(null);
      setEditNoteContent('');
      await loadNotes();
      toast.success('Success', 'Note updated successfully');
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setIsLoading(true);
    try {
      await reservationNoteService.deleteNote(noteId);
      await loadNotes();
      toast.success('Success', 'Note deleted successfully');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to delete note');
    } finally {
      setIsLoading(false);
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'interdepartmental': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'supplier_update': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Internal Communication - {reservation.reservation_id || reservation.id}
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
            {/* Reservation Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Reservation Information
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p><strong>Customer:</strong> {reservation.customer}</p>
                <p><strong>Service:</strong> {reservation.tripItem}</p>
                <p><strong>Status:</strong> {reservation.status}</p>
                <p><strong>Supplier:</strong> {reservation.supplier}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Existing Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Communication History
                </h3>
                {isLoadingNotes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading notes...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {notes.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet</p>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNoteTypeColor(note.note_type)}`}>
                                {note.note_type === 'internal' ? 'Internal' : 
                                 note.note_type === 'interdepartmental' ? `To ${note.target_department}` : 
                                 'Supplier Update'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(note.created_at)}
                              </div>
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                title="Edit note"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                                title="Delete note"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editNoteContent}
                                onChange={(e) => setEditNoteContent(e.target.value)}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateNote(note.id)}
                                  disabled={isLoading}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditNoteContent('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{note.note}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {note.created_by_user?.full_name || 'Unknown'} 
                            {note.created_by_user?.email ? ` (${note.created_by_user.email})` : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Add New Note */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Communication
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Communication Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="internal"
                          checked={noteType === 'internal'}
                          onChange={(e) => setNoteType(e.target.value as 'internal' | 'interdepartmental')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Internal Note</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="interdepartmental"
                          checked={noteType === 'interdepartmental'}
                          onChange={(e) => setNoteType(e.target.value as 'internal' | 'interdepartmental')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Message to Department</span>
                      </label>
                    </div>
                  </div>

                  {noteType === 'interdepartmental' && (
                    <Select
                      label="Target Department"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {noteType === 'internal' ? 'Internal Note' : `Message to ${targetDepartment}`}
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={noteType === 'internal' ? 'Add internal note...' : `Message to ${targetDepartment}...`}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
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
                      disabled={isLoading || !newNote.trim()}
                      loading={isLoading}
                    >
                      {noteType === 'internal' ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Note
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};