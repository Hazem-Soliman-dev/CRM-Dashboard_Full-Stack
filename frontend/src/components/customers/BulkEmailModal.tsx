import React, { useState } from 'react';
import { X, Mail, Send, Clock, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    sendOption: 'now',
    scheduleDate: '',
    scheduleTime: ''
  });
  
  const [targetFilters, setTargetFilters] = useState({
    customerType: 'all',
    status: 'all',
    lastActivity: 'all',
    bookingHistory: 'all'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleSend = () => {
    const campaignData = {
      ...emailData,
      filters: targetFilters,
      estimatedRecipients: getEstimatedRecipients()
    };
    
    console.log('Sending bulk email campaign:', campaignData);
    // Here you would implement the actual email sending logic
    onClose();
  };

  const getEstimatedRecipients = () => {
    // This would calculate based on actual filters
    let count = 2847; // Total customers
    
    if (targetFilters.customerType !== 'all') count = Math.floor(count * 0.6);
    if (targetFilters.status !== 'all') count = Math.floor(count * 0.8);
    if (targetFilters.lastActivity !== 'all') count = Math.floor(count * 0.7);
    if (targetFilters.bookingHistory !== 'all') count = Math.floor(count * 0.5);
    
    return count;
  };

  const emailTemplates = [
    {
      name: 'Welcome New Customers',
      subject: 'Welcome to our travel family! 🌟',
      message: 'Thank you for choosing us for your travel needs. We\'re excited to help you create unforgettable memories...'
    },
    {
      name: 'Seasonal Promotion',
      subject: 'Special Summer Deals - Up to 30% Off! ☀️',
      message: 'Don\'t miss out on our exclusive summer travel packages. Limited time offer...'
    },
    {
      name: 'Booking Reminder',
      subject: 'Your dream vacation is just a click away',
      message: 'We noticed you were interested in our travel packages. Let us help you plan your perfect getaway...'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bulk Email Campaign
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
              {/* Email Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Email Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {emailTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setEmailData(prev => ({
                          ...prev,
                          subject: template.subject,
                          message: template.message
                        }))}
                        className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.subject}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Form */}
                <div className="space-y-4">
                  <Input
                    label="Subject Line"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Body
                    </label>
                    <textarea
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      rows={8}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your email message here..."
                    />
                  </div>

                  {/* Send Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Send Options
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="now"
                          checked={emailData.sendOption === 'now'}
                          onChange={(e) => setEmailData(prev => ({ ...prev, sendOption: e.target.value }))}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Send Now</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="schedule"
                          checked={emailData.sendOption === 'schedule'}
                          onChange={(e) => setEmailData(prev => ({ ...prev, sendOption: e.target.value }))}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Schedule for Later</span>
                      </label>
                    </div>

                    {emailData.sendOption === 'schedule' && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <Input
                          type="date"
                          label="Date"
                          value={emailData.scheduleDate}
                          onChange={(e) => setEmailData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Input
                          type="time"
                          label="Time"
                          value={emailData.scheduleTime}
                          onChange={(e) => setEmailData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Target Audience
                  </h3>
                  
                  <div className="space-y-4">
                    <Select
                      label="Customer Type"
                      value={targetFilters.customerType}
                      onChange={(e) => setTargetFilters(prev => ({ ...prev, customerType: e.target.value }))}
                    >
                      <option value="all">All Types</option>
                      <option value="Individual">Individual</option>
                      <option value="Family/Group">Family/Group</option>
                      <option value="Corporate">Corporate</option>
                    </Select>

                    <Select
                      label="Status"
                      value={targetFilters.status}
                      onChange={(e) => setTargetFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="VIP">VIP</option>
                      <option value="Recurring">Recurring</option>
                    </Select>

                    <Select
                      label="Last Activity"
                      value={targetFilters.lastActivity}
                      onChange={(e) => setTargetFilters(prev => ({ ...prev, lastActivity: e.target.value }))}
                    >
                      <option value="all">Any Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                    </Select>

                    <Select
                      label="Booking History"
                      value={targetFilters.bookingHistory}
                      onChange={(e) => setTargetFilters(prev => ({ ...prev, bookingHistory: e.target.value }))}
                    >
                      <option value="all">All Customers</option>
                      <option value="has_bookings">Has Bookings</option>
                      <option value="no_bookings">No Bookings Yet</option>
                      <option value="recent_bookings">Recent Bookings</option>
                    </Select>
                  </div>
                </div>

                {/* Estimated Recipients */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Estimated Recipients
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {getEstimatedRecipients().toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    customers will receive this email
                  </div>
                </div>

                {/* Preview Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Hide Preview' : 'Preview Email'}
                </Button>

                {previewMode && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Subject: {emailData.subject || 'No subject'}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {emailData.message || 'No message content'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!emailData.subject || !emailData.message}>
              {emailData.sendOption === 'now' ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};