import React, { useMemo, useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Car, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';
import { OperationsTask } from '../../services/taskService';

interface TodaysScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: OperationsTask[];
  trips: OperationsTrip[];
}

export const TodaysScheduleModal: React.FC<TodaysScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  trips 
}) => {
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'In Progress': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
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

  const getTypeIcon = (type?: string | null) => {
    switch (type) {
      case 'Pickup': return <Car className="h-4 w-4 text-blue-500" />;
      case 'Tour': return <MapPin className="h-4 w-4 text-green-500" />;
      case 'Activity': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  const staffOptions = useMemo(() => {
    const names = tasks
      .map(task => task.assignedToName)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [tasks]);
  
  // Filter today's tasks
  const todaysTasks = tasks.filter(task => {
    const matchesDate = task.scheduledAt ? task.scheduledAt.startsWith(today) : false;
    const matchesStaff =
      staffFilter === 'All Staff' ||
      (task.assignedToName ? task.assignedToName.toLowerCase().includes(staffFilter.toLowerCase()) : false);
    const matchesStatus = statusFilter === 'All Status' || task.status === statusFilter;
    return matchesDate && matchesStaff && matchesStatus;
  });

  // Get today's active trips
  const todaysTrips = trips.filter(trip => {
    const startDate = trip.startDate;
    const endDate = trip.endDate;
    if (!startDate || !endDate) return false;
    return today >= startDate && today <= endDate;
  });

  // Sort tasks by time
  const sortedTasks = [...todaysTasks].sort((a, b) =>
    (a.scheduledAt || '').localeCompare(b.scheduledAt || '')
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Today's Schedule - {formatDate(new Date().toISOString())}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Tasks ({todaysTasks.length})
                  </h3>
                  <div className="flex space-x-2">
                    <Select
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value)}
                    >
                      <option>All Staff</option>
                      {staffOptions.map(name => (
                        <option key={name}>{name}</option>
                      ))}
                    </Select>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Delayed</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  {sortedTasks.map((task) => {
                    const taskTime = task.scheduledAt
                      ? new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—';
                    const customerDisplay = task.customerName || task.trip?.customerName || 'Unassigned';

                    return (
                    <div key={task.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {taskTime}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {getTypeIcon(task.taskType)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {customerDisplay}
                          {task.location ? ` • ${task.location}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Assigned to: {task.assignedToName || 'Unassigned'}
                          {task.trip?.tripCode ? ` • ${task.trip.tripCode}` : ''}
                        </p>
                        {task.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    );
                  })}

                  {todaysTasks.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No tasks scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Trips Sidebar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Active Trips Today ({todaysTrips.length})
                </h3>
                <div className="space-y-3">
                  {todaysTrips.map((trip) => (
                    <div key={trip.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {trip.customerName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {trip.itinerary}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>Guide: {trip.assignedGuide}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-3 w-3" />
                          <span>Driver: {trip.assignedDriver}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{trip.customerCount} pax</span>
                        </div>
                      </div>

                      {trip.status === 'Issue' && (
                        <div className="mt-2 flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">Requires attention</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {todaysTrips.length === 0 && (
                    <div className="text-center py-8">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active trips today</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Pending Tasks</span>
                      <span className="font-bold text-blue-800 dark:text-blue-300">
                        {todaysTasks.filter(t => t.status === 'Pending').length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 dark:text-green-400">In Progress</span>
                      <span className="font-bold text-green-800 dark:text-green-300">
                        {todaysTasks.filter(t => t.status === 'In Progress').length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700 dark:text-red-400">Delayed</span>
                      <span className="font-bold text-red-800 dark:text-red-300">
                        {todaysTasks.filter(t => t.status === 'Delayed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};