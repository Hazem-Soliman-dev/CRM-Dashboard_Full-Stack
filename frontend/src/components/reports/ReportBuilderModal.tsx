import React, { useState } from 'react';
import { X, Save, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableMetrics = [
  'Total Revenue',
  'Total Bookings',
  'Conversion Rate',
  'Average Booking Value',
  'Customer Satisfaction',
  'Profit Margin',
  'Outstanding Balance',
  'Staff Performance',
  'Supplier Performance',
  'Payment Status'
];

const availableFilters = [
  'Date Range',
  'Category',
  'Agent',
  'Source',
  'Destination',
  'Customer Type',
  'Booking Status',
  'Payment Status'
];

const chartTypes = [
  'Bar Chart',
  'Line Chart',
  'Pie Chart',
  'Table',
  'Summary Cards'
];

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({ isOpen, onClose }) => {
  const [reportName, setReportName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Total Revenue', 'Total Bookings']);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Date Range']);
  const [chartType, setChartType] = useState('Bar Chart');
  const [schedule, setSchedule] = useState('manual');

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSaveReport = () => {
    const reportConfig = {
      name: reportName,
      metrics: selectedMetrics,
      filters: selectedFilters,
      chartType: chartType,
      schedule: schedule,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving custom report:', reportConfig);
    // In real app, save to Supabase
    onClose();
  };

  const handleGenerateReport = () => {
    console.log('Generating report with current configuration');
    // Generate and display report
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Custom Report Builder
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
              {/* Report Configuration */}
              <div className="space-y-6">
                <div>
                  <Input
                    label="Report Name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Metrics
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableMetrics.map((metric) => (
                      <label key={metric} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric)}
                          onChange={() => handleMetricToggle(metric)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Available Filters
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableFilters.map((filter) => (
                      <label key={filter} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter)}
                          onChange={() => handleFilterToggle(filter)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{filter}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Select
                    label="Chart Type"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    {chartTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Select
                    label="Report Schedule"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                  >
                    <option value="manual">Manual Generation</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Report Preview
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Name:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reportName || 'Untitled Report'}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Metrics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMetrics.map((metric) => (
                          <span key={metric} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Filters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFilters.map((filter) => (
                          <span key={filter} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            {filter}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Visualization:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{chartType}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Schedule:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {schedule === 'manual' ? 'Manual Generation' : `Auto-generate ${schedule}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Report Summary
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    <div>Metrics: {selectedMetrics.length} selected</div>
                    <div>Filters: {selectedFilters.length} available</div>
                    <div>Format: {chartType.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSaveReport}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button onClick={handleGenerateReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};