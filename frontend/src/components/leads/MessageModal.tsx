import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string, type: 'message' | 'note') => Promise<void>;
  lead: any;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, onSend, lead }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'note'>('message');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSend(message, messageType);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Message - {lead.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="message"
                    checked={messageType === 'message'}
                    onChange={(e) => setMessageType(e.target.value as 'message' | 'note')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Send Message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="note"
                    checked={messageType === 'note'}
                    onChange={(e) => setMessageType(e.target.value as 'message' | 'note')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Internal Note</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {messageType === 'message' ? 'Message' : 'Note'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={messageType === 'message' ? 'Type your message here...' : 'Add an internal note...'}
                required
              />
            </div>

            {messageType === 'message' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Contact Information
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Email: {lead.email}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Phone: {lead.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                disabled={isLoading}
                loading={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                {messageType === 'message' ? 'Send Message' : 'Save Note'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};