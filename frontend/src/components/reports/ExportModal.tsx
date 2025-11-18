import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { exportReportExcel, exportReportPdf, exportReportCsv } from '../../services/exportService';
import { useToastContext } from '../../contexts/ToastContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    dateRange: string;
    categoryFilter: string;
    agentFilter: string;
    sourceFilter: string;
  };
  reportId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, filters, reportId = 'monthly-revenue' }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportScope, setExportScope] = useState('current');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToastContext();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build filters object
      const exportFilters: Record<string, any> = {
        dateRange: filters.dateRange,
        category: filters.categoryFilter !== 'All Categories' ? filters.categoryFilter : undefined,
        agent: filters.agentFilter !== 'All Agents' ? filters.agentFilter : undefined,
        source: filters.sourceFilter !== 'All Sources' ? filters.sourceFilter : undefined
      };

      const options = {
        scope: exportScope,
        includeCharts,
        includeDetails
      };

      // Call appropriate export function
      switch (exportFormat) {
        case 'excel':
          await exportReportExcel(reportId, exportFilters, options);
          break;
        case 'pdf':
          await exportReportPdf(reportId, exportFilters);
          break;
        case 'csv':
          await exportReportCsv(reportId, exportFilters, options);
          break;
        default:
          await exportReportExcel(reportId, exportFilters, options);
      }

      toast.showToast('Report exported successfully', 'success');
      onClose();
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.showToast(error?.response?.data?.message || 'Failed to export report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export Report
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'excel', label: 'Excel', desc: 'Spreadsheet format' },
                  { value: 'pdf', label: 'PDF', desc: 'Document format' },
                  { value: 'csv', label: 'CSV', desc: 'Data only' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Scope
              </label>
              <Select value={exportScope} onChange={(e) => setExportScope(e.target.value)}>
                <option value="current">Current View (with filters)</option>
                <option value="all">All Data</option>
                <option value="summary">Summary Only</option>
                <option value="detailed">Detailed Report</option>
              </Select>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Include Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Charts and Graphs</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Detailed Breakdowns</span>
                </label>
              </div>
            </div>

            {/* Current Filters Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Current Filters Applied
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <div>Date Range: {filters.dateRange}</div>
                <div>Category: {filters.categoryFilter}</div>
                <div>Agent: {filters.agentFilter}</div>
                <div>Source: {filters.sourceFilter}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};