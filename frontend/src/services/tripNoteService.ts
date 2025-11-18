import api from './api';

export interface TripNote {
  id: number;
  trip_id: number;
  note: string;
  note_type: 'internal' | 'interdepartmental';
  target_department?: string;
  created_by: number;
  created_by_user?: {
    id: number;
    full_name: string;
    email: string;
    department?: string;
    role?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTripNoteData {
  note: string;
  note_type?: 'internal' | 'interdepartmental';
  target_department?: string;
}

export interface UpdateTripNoteData {
  note?: string;
  note_type?: 'internal' | 'interdepartmental';
  target_department?: string;
}

export const tripNoteService = {
  // Get all notes for a trip
  getNotesByTrip: async (tripId: number): Promise<TripNote[]> => {
    const response = await api.get(`/operations/trips/${tripId}/notes`);
    return response.data.data || [];
  },

  // Get a single note by ID
  getNoteById: async (id: number): Promise<TripNote> => {
    const response = await api.get(`/operations/trips/notes/${id}`);
    return response.data.data;
  },

  // Create a new note
  createNote: async (tripId: number, noteData: CreateTripNoteData): Promise<TripNote> => {
    const response = await api.post(`/operations/trips/${tripId}/notes`, noteData);
    return response.data.data;
  },

  // Update a note
  updateNote: async (id: number, noteData: UpdateTripNoteData): Promise<TripNote> => {
    const response = await api.put(`/operations/trips/notes/${id}`, noteData);
    return response.data.data;
  },

  // Delete a note
  deleteNote: async (id: number): Promise<void> => {
    await api.delete(`/operations/trips/notes/${id}`);
  },
};

export default tripNoteService;

