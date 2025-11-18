import React, { useState, useEffect } from 'react';
import { X, Upload, File, Trash2, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import reservationDocumentService, { ReservationDocument } from '../../services/reservationDocumentService';
import { useToastContext } from '../../contexts/ToastContext';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (documentData: any) => Promise<void>; // Optional for backward compatibility
  reservation: any;
}

const documentTypes = [
  'Supplier Confirmation',
  'Hotel Voucher',
  'Flight Ticket',
  'Tour Confirmation',
  'Transfer Voucher',
  'Insurance Document',
  'Visa Document',
  'Payment Receipt',
  'Other'
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  reservation 
}) => {
  const toast = useToastContext();
  const [documents, setDocuments] = useState<ReservationDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Supplier Confirmation');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen && reservation?.id) {
      loadDocuments();
    }
  }, [isOpen, reservation?.id]);

  const loadDocuments = async () => {
    if (!reservation?.id) return;
    
    setIsLoadingDocuments(true);
    try {
      const fetchedDocuments = await reservationDocumentService.getDocumentsByReservationId(reservation.id);
      setDocuments(fetchedDocuments);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Error', 'Failed to load documents');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Error', 'Please select a file to upload');
      return;
    }

    if (!reservation?.id) {
      toast.error('Error', 'Reservation ID is required');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('Error', 'File size exceeds maximum limit of 10MB');
      return;
    }

    setIsLoading(true);
    try {
      // Convert file to base64
      const fileData = await reservationDocumentService.fileToBase64(selectedFile);
      
      // Get MIME type
      const mimeType = selectedFile.type || 'application/octet-stream';

      await reservationDocumentService.createDocument(reservation.id, {
        document_name: selectedFile.name,
        document_type: documentType,
        file_data: fileData,
        file_size: selectedFile.size,
        mime_type: mimeType,
        description: description || undefined
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('Supplier Confirmation');
      setDescription('');
      await loadDocuments();
      toast.success('Success', 'Document uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId: number, documentName: string) => {
    try {
      const blob = await reservationDocumentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Success', 'Document downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setIsLoading(true);
    try {
      await reservationDocumentService.deleteDocument(documentId);
      await loadDocuments();
      toast.success('Success', 'Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Upload className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Document - {reservation.reservation_id || reservation.id}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upload New Document
                </h3>
                
                {/* Reservation Info */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    Reservation Details
                  </h4>
                  <div className="text-sm text-purple-700 dark:text-purple-400">
                    <p><strong>Customer:</strong> {reservation.customer}</p>
                    <p><strong>Service:</strong> {reservation.tripItem}</p>
                    <p><strong>Supplier:</strong> {reservation.supplier}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select
                    label="Document Type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select File *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileSelect}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                    
                    {selectedFile && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add description or notes about this document..."
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
                      disabled={isLoading || !selectedFile}
                      loading={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </form>
              </div>

              {/* Existing Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Existing Documents
                </h3>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading documents...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <div className="text-center py-8">
                        <File className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <File className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {doc.document_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {doc.document_type} • {formatFileSize(doc.file_size)}
                                </p>
                                {doc.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDownloadDocument(doc.id, doc.document_name)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Uploaded by {doc.uploaded_by_user?.full_name || 'Unknown'} on {formatDate(doc.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};