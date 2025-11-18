import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import userService from '../../services/userService';
import ownerService from '../../services/ownerService';
import { useToastContext } from '../../contexts/ToastContext';
import { Owner } from '../../services/ownerService';

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner | null;
  onAssign: () => void;
}

export const AssignManagerModal: React.FC<AssignManagerModalProps> = ({ isOpen, onClose, owner, onAssign }) => {
  const toast = useToastContext();
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadManagers = async () => {
      if (isOpen) {
        try {
          const response = await userService.getAllUsers({ role: 'manager', limit: 100 });
          setManagers(response.users || []);
        } catch (error) {
          console.error('Failed to load managers:', error);
        }
      }
    };
    loadManagers();
  }, [isOpen]);

  useEffect(() => {
    if (owner && isOpen) {
      setSelectedManagerId(owner.managerId || '');
    }
  }, [owner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!owner) return;

    setIsLoading(true);
    try {
      await ownerService.assignManager(owner.id, selectedManagerId);
      
      toast.success('Manager Assigned', `Manager has been assigned to this owner successfully.`);
      onAssign();
      onClose();
    } catch (error: any) {
      console.error('Error assigning manager:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to assign manager');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assign Manager
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Assign a manager to <strong>{owner.companyName}</strong>
              </p>
            </div>

            <div className="mb-6">
              <Select
                label="Select Manager"
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
              >
                <option value="">Unassign Manager</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name} {manager.email ? `(${manager.email})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                <Save className="h-4 w-4 mr-2" />
                Assign Manager
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

