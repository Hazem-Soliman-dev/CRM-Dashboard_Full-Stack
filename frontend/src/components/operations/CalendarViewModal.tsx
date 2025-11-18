import React, { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { OperationsTrip } from '../../services/operationsService';
import { OperationsTask } from '../../services/taskService';

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: OperationsTrip[];
  tasks: OperationsTask[];
}

export const CalendarViewModal: React.FC<CalendarViewModalProps> = ({ 
  isOpen, 
  onClose, 
  trips, 
  tasks 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-500';
      case 'In Progress': return 'bg-green-500';
      case 'Issue': return 'bg-red-500';
      case 'Completed': return 'bg-gray-500';
      case 'Delayed': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTripsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.filter(trip => {
      const startDate = trip.startDate;
      const endDate = trip.endDate;
      if (!startDate || !endDate) return false;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.scheduledAt ? task.scheduledAt.startsWith(dateStr) : false);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  if (!isOpen) return null;

  const weekDays = getWeekDays();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Operations Calendar
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
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Week of {formatDate(weekDays[0].toISOString())}
                </h3>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex space-x-2">
                {['day', 'week', 'month'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'month' | 'week' | 'day')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === mode
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dayTrips = getTripsForDate(day);
                const dayTasks = getTasksForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`border rounded-lg p-3 min-h-[200px] ${
                    isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="text-center mb-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-semibold ${
                        isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>

                    {/* Trips */}
                    <div className="space-y-2">
                      {dayTrips.map((trip) => (
                        <div
                          key={trip.id}
                          className={`p-2 rounded text-white text-xs ${getStatusColor(trip.status)}`}
                        >
                          <div className="font-medium">{trip.customerName}</div>
                          <div className="opacity-90">{trip.itinerary}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Users className="h-3 w-3" />
                            <span>{trip.customerCount} pax</span>
                          </div>
                        </div>
                      ))}

                      {/* Tasks */}
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs border border-purple-200 dark:border-purple-800"
                        >
                          <div className="font-medium">{task.title}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {task.scheduledAt
                                ? new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {dayTrips.length === 0 && dayTasks.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-4">
                          No activities
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Planned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Issue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded border border-purple-300"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Tasks</span>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Close Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};