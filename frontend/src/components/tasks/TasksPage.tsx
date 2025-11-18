import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Clock, MapPin, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import taskService, {
  OperationsTask,
  TaskStatus,
} from "../../services/taskService";
import { useToastContext } from "../../contexts/ToastContext";
import { ScheduleTaskModal } from "./ScheduleTaskModal";
import { ViewTripModal } from "./ViewTripModal";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

const statusBadgeStyles: Record<TaskStatus, string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  "In Progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  Delayed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

const cycleStatus = (status: TaskStatus): TaskStatus => {
  switch (status) {
    case "Pending":
      return "In Progress";
    case "In Progress":
      return "Completed";
    case "Completed":
      return "Pending";
    default:
      return "Pending";
  }
};

const formatTime = (scheduledAt?: string | null) => {
  if (!scheduledAt) return "--";
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const TasksPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "Low" | "Medium" | "High"
  >("All");
  const [tasks, setTasks] = useState<OperationsTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewTripModalOpen, setIsViewTripModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const { error: showError, success: showSuccess } = useToastContext();
  const [total, setTotal] = useState(0);
  const { page, perPage, offset, pageCount, setPage, reset } = usePagination({
    perPage: 10,
    total,
  });

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error("Failed to load tasks", error);
      showError(
        "Failed to load tasks",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (task: OperationsTask) => {
    const nextStatus = cycleStatus(task.status);
    setUpdatingTaskId(task.id);
    try {
      const updated = await taskService.updateTaskStatus(task.id, nextStatus);
      setTasks((prev) =>
        prev.map((entry) => (entry.id === task.id ? updated : entry))
      );
      showSuccess("Task updated", `Status moved to ${nextStatus}`);
    } catch (error: any) {
      console.error("Failed to update task status", error);
      showError(
        "Failed to update task",
        error.response?.data?.message || error.message
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch =
        statusFilter === "All" || task.status === statusFilter;
      const priorityMatch =
        priorityFilter === "All" || task.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  }, [statusFilter, priorityFilter, tasks]);

  useEffect(() => {
    reset();
  }, [statusFilter, priorityFilter, reset]);

  useEffect(() => {
    setTotal(filteredTasks.length);
  }, [filteredTasks.length]);

  const visibleTasks = filteredTasks.slice(offset, offset + perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Operations Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track assignments across tours, logistics, and customer experiences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | TaskStatus)
            }
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value as "All" | "Low" | "Medium" | "High"
              )
            }
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>

          <Button 
            className="whitespace-nowrap" 
            variant="outline"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Task
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
            Loading tasks...
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTasks.map((task) => (
          <Card
            key={task.id}
            className="border border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </CardTitle>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Task #{task.taskId}{" "}
                    {task.tripReference ? `• Trip ${task.tripReference}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusBadgeStyles[task.status]
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                {formatTime(task.scheduledAt)}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="mr-2 h-4 w-4 text-purple-500" />
                {task.location || "Not set"}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <User className="mr-2 h-4 w-4 text-green-500" />
                {task.assignedToName || "Unassigned"}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                {task.status === "Delayed" ? (
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                )}
                Priority: {task.priority}
              </div>

              {task.notes && (
                <p className="rounded-md bg-gray-100 dark:bg-gray-800/60 p-3 text-gray-600 dark:text-gray-300">
                  {task.notes}
                </p>
              )}

              <div className="flex justify-start gap-2 pt-2">
                {task.trip && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTrip(task.trip);
                      setIsViewTripModalOpen(true);
                    }}
                  >
                    View Trip
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(task)}
                  disabled={updatingTaskId === task.id}
                >
                  {updatingTaskId === task.id ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredTasks.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              No tasks match the selected filters.
            </CardContent>
          </Card>
        )}
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        perPage={perPage}
        total={total}
        onPageChange={(p) => setPage(p)}
        compact
      />

      {/* Modals */}
      <ScheduleTaskModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={loadTasks}
      />

      <ViewTripModal
        isOpen={isViewTripModalOpen}
        onClose={() => {
          setIsViewTripModalOpen(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
      />
    </div>
  );
};
