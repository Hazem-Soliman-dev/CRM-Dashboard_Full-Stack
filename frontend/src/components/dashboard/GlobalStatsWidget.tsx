import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import dashboardService from '../../services/dashboardService';
import { formatCurrency } from '../../utils/format';

interface GlobalStatsWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalStatsWidget: React.FC<GlobalStatsWidgetProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    totalReservations: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats({
        totalLeads: dashboardStats.overview.totalLeads || 0,
        totalCustomers: dashboardStats.overview.totalCustomers || 0,
        totalReservations: dashboardStats.overview.totalReservations || 0,
        totalRevenue: dashboardStats.overview.totalRevenue || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Global Statistics
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Reservations</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReservations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-emerald-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

