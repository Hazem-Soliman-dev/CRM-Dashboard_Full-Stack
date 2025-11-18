import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { formatDate } from "../../utils/format";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

interface Task {
  id: string;
  title: string;
  customer: string;
  caseId?: string;
  dueDate: string;
  dueTime?: string;
  priority: string;
  status: string;
  taskType?: string;
  description?: string;
  assignedTo?: string;
}

interface TodaysTasksWidgetProps {
  tasks: Task[];
  onViewAll: () => void;
  onViewDetails: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export const TodaysTasksWidget: React.FC<TodaysTasksWidgetProps> = ({
  tasks,
  onViewAll,
  onViewDetails,
  onStatusChange,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { page, perPage, offset, pageCount, setPage } = usePagination({
    perPage: 3,
    total,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Due Today":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  React.useEffect(() => {
    setTotal(tasks.length);
  }, [tasks.length]);

  const displayTasks = tasks.slice(offset, offset + perPage);
  const hasMoreTasks = tasks.length > perPage;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Tasks
            </CardTitle>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {displayTasks.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tasks for today
            </p>
          </div>
        ) : (
          <>
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {task.customer}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {task.dueTime
                        ? `${formatDate(task.dueDate)} ${task.dueTime}`
                        : formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <Select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      className="text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Due Today">Due Today</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(task)}
                    className="text-xs px-2 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}

            {hasMoreTasks && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700" />
            )}

            <Pagination
              page={page}
              pageCount={pageCount}
              perPage={perPage}
              total={total}
              onPageChange={(p) => setPage(p)}
              compact
            />

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={onViewAll}
            >
              View All Tasks
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
