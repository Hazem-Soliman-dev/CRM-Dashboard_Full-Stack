import api from './api';

export interface ReservationNote {
  id: number;
  reservation_id: number;
  note: string;
  note_type: 'internal' | 'interdepartmental' | 'supplier_update';
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

export interface CreateReservationNoteData {
  note: string;
  note_type?: 'internal' | 'interdepartmental' | 'supplier_update';
  target_department?: string;
}

const reservationNoteService = {
  // Get all notes for a reservation
  getNotesByReservation: async (reservationId: string | number): Promise<ReservationNote[]> => {
    const response = await api.get(`/reservations/${reservationId}/notes`);
    return response.data.data || [];
  },

  // Get a single note by ID
  getNoteById: async (id: string | number): Promise<ReservationNote> => {
    const response = await api.get(`/reservations/notes/${id}`);
    return response.data.data;
  },

  // Create a new note
  createNote: async (reservationId: string | number, noteData: CreateReservationNoteData): Promise<ReservationNote> => {
    const response = await api.post(`/reservations/${reservationId}/notes`, noteData);
    return response.data.data;
  },

  // Update a note
  updateNote: async (id: string | number, noteData: Partial<CreateReservationNoteData>): Promise<ReservationNote> => {
    const response = await api.put(`/reservations/notes/${id}`, noteData);
    return response.data.data;
  },

  // Delete a note
  deleteNote: async (id: string | number): Promise<void> => {
    await api.delete(`/reservations/notes/${id}`);
  },
};

export default reservationNoteService;
