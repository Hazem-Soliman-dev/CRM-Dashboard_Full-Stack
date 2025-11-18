import api from "./api";

export interface ReservationDocument {
  id: number;
  reservation_id: number;
  document_name: string;
  document_type: string;
  file_data?: string; // Base64 encoded, only included when fetching full document
  file_size: number;
  mime_type: string;
  description?: string;
  uploaded_by: number;
  uploaded_by_user?: {
    id: number;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateReservationDocumentData {
  document_name: string;
  document_type: string;
  file_data: string; // Base64 encoded
  file_size: number;
  mime_type: string;
  description?: string;
}

export interface UpdateReservationDocumentData {
  document_name?: string;
  document_type?: string;
  description?: string;
}

const reservationDocumentService = {
  getDocumentsByReservationId: async (
    reservationId: number
  ): Promise<ReservationDocument[]> => {
    const response = await api.get(`/reservations/${reservationId}/documents`);
    return response.data.data;
  },

  getDocumentById: async (id: number): Promise<ReservationDocument> => {
    const response = await api.get(`/reservations/documents/${id}`);
    return response.data.data;
  },

  getDocumentWithFile: async (id: number): Promise<ReservationDocument> => {
    const response = await api.get(`/reservations/documents/${id}`);
    return response.data.data;
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const response = await api.get(`/reservations/documents/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  createDocument: async (
    reservationId: number,
    documentData: CreateReservationDocumentData
  ): Promise<ReservationDocument> => {
    const response = await api.post(`/reservations/${reservationId}/documents`, documentData);
    return response.data.data;
  },

  updateDocument: async (
    id: number,
    documentData: UpdateReservationDocumentData
  ): Promise<ReservationDocument> => {
    const response = await api.put(`/reservations/documents/${id}`, documentData);
    return response.data.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/reservations/documents/${id}`);
  },

  // Helper function to convert File to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1]; // Remove data:type;base64, prefix
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  },
};

export default reservationDocumentService;

