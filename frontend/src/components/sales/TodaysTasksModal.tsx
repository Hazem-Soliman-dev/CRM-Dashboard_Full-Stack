import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Eye, Edit, X, Save, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../ui/Pagination';

interface Task {
  id: string;
  title: string;
  customer: string;
  customerName?: string;
  caseId?: string;
  dueDate: string;
  dueTime?: string;
  priority: string;
  status: string;
  taskType?: string;
  description?: string;
  notes?: string;
  assignedTo?: string;
  location?: string;
}

interface TodaysTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onViewCase?: (caseId: string) => void;
  initialSelectedTask?: Task | null;
}

export const TodaysTasksModal: React.FC<TodaysTasksModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  onTaskUpdate,
  onStatusChange,
  onViewCase,
  initialSelectedTask = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(initialSelectedTask || null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>(initialSelectedTask ? 'details' : 'list');

  // Update selected task when modal opens with initial task
  useEffect(() => {
    if (isOpen && initialSelectedTask) {
      setSelectedTask(initialSelectedTask);
      setViewMode('details');
    } else if (isOpen && !initialSelectedTask) {
      setSelectedTask(null);
      setViewMode('list');
    }
  }, [isOpen, initialSelectedTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Due Today': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setViewMode('list');
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    onStatusChange(taskId, newStatus);
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    onTaskUpdate(updatedTasks);
  };

  const handleCompleteTask = (taskId: string) => {
    handleStatusChange(taskId, 'Completed');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todaysTasks = filteredTasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = task.dueDate || task.scheduledAt;
    return taskDate === today || task.status === 'Overdue';
  });

  const overdueTasks = todaysTasks.filter(task => task.status === 'Overdue');
  const dueTodayTasks = todaysTasks.filter(task => task.status === 'Due Today');
  const completedTasks = todaysTasks.filter(task => task.status === 'Completed');
  const [totalTasks, setTotalTasks] = useState(0);
  const { page, perPage, offset, pageCount, setPage, reset: resetPage } = usePagination({
    perPage: 3,
    total: totalTasks
  });

  useEffect(() => {
    resetPage();
  }, [searchTerm, statusFilter, resetPage]);

  useEffect(() => {
    setTotalTasks(todaysTasks.length);
  }, [todaysTasks.length]);

  const visibleTasks = todaysTasks.slice(offset, offset + perPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-3">
                {viewMode === 'details' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToList}
                    className="mr-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Calendar className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {viewMode === 'details' && selectedTask 
                    ? `Task Details: ${selectedTask.title}` 
                    : `Today's Tasks (${todaysTasks.length})`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'details' && selectedTask ? (
              <div className="space-y-6">
                {/* Task Details View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Title</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedTask.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTask.customer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Case ID</label>
                      <p className="mt-1 text-sm">
                        {selectedTask.caseId ? (
                          <button
                            onClick={() => onViewCase?.(selectedTask.caseId!)}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {selectedTask.caseId}
                          </button>
                        ) : (
                          <span className="text-gray-900 dark:text-white">N/A</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Type</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTask.taskType || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedTask.dueTime
                          ? `${formatDate(selectedTask.dueDate)} ${selectedTask.dueTime}`
                          : formatDate(selectedTask.dueDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <Select
                          value={selectedTask.status}
                          onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                          className="max-w-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Due Today">Due Today</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTask.assignedTo || 'Unassigned'}</p>
                    </div>
                    {selectedTask.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTask.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedTask.description || selectedTask.notes) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    {selectedTask.description && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedTask.description}</p>
                      </div>
                    )}
                    {selectedTask.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedTask.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue Tasks</p>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                          {overdueTasks.length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Due Today</p>
                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                          {dueTodayTasks.length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          {completedTasks.length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Due Today">Due Today</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </Select>
                </div>

                {/* Tasks Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {visibleTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {task.customer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {task.dueTime
                                ? `${formatDate(task.dueDate)} ${task.dueTime}`
                                : formatDate(task.dueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="text-xs"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Due Today">Due Today</option>
                                <option value="Completed">Completed</option>
                                <option value="Overdue">Overdue</option>
                              </Select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleViewDetails(task)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {task.status !== 'Completed' && (
                                  <button 
                                    onClick={() => handleCompleteTask(task.id)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    title="Mark Complete"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      page={page}
                      pageCount={pageCount}
                      perPage={perPage}
                      total={totalTasks}
                      onPageChange={(p) => setPage(p)}
                      compact
                    />
                  </div>
                </div>

                {todaysTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No tasks for today
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All caught up! No tasks are due today.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
