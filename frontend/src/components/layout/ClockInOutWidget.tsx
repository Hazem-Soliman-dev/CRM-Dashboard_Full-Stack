import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import attendanceService from '../../services/attendanceService';
import { useNotificationContext } from '../../contexts/NotificationContext';

export const ClockInOutWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const toast = useToastContext();
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initialize from today's attendance so header reflects Attendance page state
    (async () => {
      try {
        const today = await attendanceService.getTodayAttendance();
        if (today && today.clock_in && !today.clock_out) {
          setClockInTime(today.clock_in);
        }
      } catch {
        // Ignore init errors silently to keep header lightweight
      }
    })();

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    try {
      const record = await attendanceService.clockIn();
      const effectiveClockIn = record.clock_in || new Date().toISOString();
      setClockInTime(effectiveClockIn);
      toast.success('Clocked In', `Welcome! Clocked in at ${new Date(effectiveClockIn).toLocaleTimeString()}`);
      // Notification
      await addNotification({
        type: 'attendance',
        title: 'Clocked In',
        message: `You clocked in at ${new Date(effectiveClockIn).toLocaleTimeString()}`,
        entityType: 'attendance'
      });
    } catch (error: any) {
      toast.error('Failed to Clock In', error?.response?.data?.message || error?.message || 'Unknown error');
    }
  };

  const handleClockOut = async () => {
    if (!window.confirm('Are you sure you want to clock out?')) return;
    try {
      const record = await attendanceService.clockOut();
      const now = new Date();
      const start = clockInTime ? new Date(clockInTime) : (record.clock_in ? new Date(record.clock_in) : now);
      const hoursWorked = ((now.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
      setClockInTime(null);
      toast.success('Clocked Out', `Goodbye! You worked ${hoursWorked} hours today.`);
      // Notification
      await addNotification({
        type: 'attendance',
        title: 'Clocked Out',
        message: `You clocked out at ${now.toLocaleTimeString()} (Worked ${hoursWorked}h)`,
        entityType: 'attendance'
      });
    } catch (error: any) {
      toast.error('Failed to Clock Out', error?.response?.data?.message || error?.message || 'Unknown error');
    }
  };

  const getWorkedHours = () => {
    if (!clockInTime) return '0h 0m';
    const now = new Date();
    const clockInDate = new Date(clockInTime);
    const diffMs = now.getTime() - clockInDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right hidden sm:block">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentTime.toLocaleTimeString()}
        </div>
        {clockInTime && (
          <div className="text-xs text-green-600 dark:text-green-400">
            Worked: {getWorkedHours()}
          </div>
        )}
      </div>
      
      {clockInTime ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClockOut}
          className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Clock Out</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClockIn}
          className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Clock In</span>
        </Button>
      )}
    </div>
  );
};