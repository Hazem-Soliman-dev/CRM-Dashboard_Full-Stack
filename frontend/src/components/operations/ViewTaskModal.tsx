import React from 'react';
import { X, MapPin, Users, Calendar, Clock, CheckCircle, Edit, Link as LinkIcon } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { OperationsTask } from '../../services/taskService';
import { Button } from '../ui/Button';

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: OperationsTask | null;
  onEdit?: () => void;
}

export const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ isOpen, onClose, task, onEdit }) => {
  if (!isOpen || !task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Task Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.taskId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Task Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Type</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.taskType || 'N/A'}</p>
                </div>
                {task.customerName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.customerName}</p>
                  </div>
                )}
                {task.assignedToName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {task.assignedToName}
                    </p>
                  </div>
                )}
                {task.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled At</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(task.scheduledAt)}
                    </p>
                  </div>
                )}
                {task.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {task.location}
                    </p>
                  </div>
                )}
                {task.tripReference && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trip Reference</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.tripReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Trip */}
            {task.trip && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Linked Trip
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trip Code</label>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{task.trip.tripCode}</p>
                    </div>
                    {task.trip.bookingReference && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Reference</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.trip.bookingReference}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.trip.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.trip.status}</p>
                    </div>
                    {task.trip.startDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(task.trip.startDate)}</p>
                      </div>
                    )}
                    {task.trip.endDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(task.trip.endDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <p className="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500 dark:text-gray-400">Created At</label>
                  <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(task.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(task.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

