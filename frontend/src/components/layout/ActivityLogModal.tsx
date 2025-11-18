import React, { useState, useEffect } from 'react';
import { X, Activity, User, Eye, FileText, Plus, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { formatDate } from '../../utils/format';
import activityService from '../../services/activityService';
import { Activity as ActivityType } from '../../services/activityService';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen, typeFilter, dateFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 100 };
      
      if (typeFilter !== 'All') {
        filters.activity_type = typeFilter;
      }

      if (dateFilter === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        filters.date_from = today;
      } else if (dateFilter === 'This Week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filters.date_from = weekAgo.toISOString().split('T')[0];
      } else if (dateFilter === 'This Month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filters.date_from = monthAgo.toISOString().split('T')[0];
      }

      const activitiesData = await activityService.getActivities(filters);
      setActivities(activitiesData);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Map activity types to icons and colors
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return Plus;
      case 'updated': return Edit;
      case 'deleted': return X;
      case 'status_changed': return Eye;
      case 'assigned': return User;
      case 'commented': return FileText;
      case 'message_sent': return FileText;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-green-500';
      case 'updated': return 'text-blue-500';
      case 'deleted': return 'text-red-500';
      case 'status_changed': return 'text-purple-500';
      case 'assigned': return 'text-orange-500';
      case 'commented': return 'text-indigo-500';
      case 'message_sent': return 'text-teal-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'created': 'Created',
      'updated': 'Updated',
      'deleted': 'Deleted',
      'status_changed': 'Status Changed',
      'assigned': 'Assigned',
      'commented': 'Commented',
      'message_sent': 'Message Sent'
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.details ? JSON.stringify(activity.details).toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesType = typeFilter === 'All' || activity.activity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activity Log
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
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="status_changed">Status Changed</option>
                <option value="assigned">Assigned</option>
                <option value="commented">Commented</option>
                <option value="message_sent">Message Sent</option>
              </Select>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </Select>
            </div>

            {/* Activity List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.activity_type);
                  const color = getActivityColor(activity.activity_type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                          <IconComponent className={`h-5 w-5 ${color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            {getActivityTypeLabel(activity.activity_type)}
                          </span>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDate(activity.created_at)} at {new Date(activity.created_at).toLocaleTimeString()}
                          {activity.performed_by && ` • by ${activity.performed_by.full_name}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No activities found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

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