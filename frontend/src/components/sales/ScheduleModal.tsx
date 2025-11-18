import React, { useState } from "react";
import { X, Save, Calendar } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { SalesCase } from "../../services/salesService";

export interface TaskData {
  title: string;
  taskType: string;
  priority: string;
  dueDate: string;
  dueTime: string;
  description?: string;
  caseId?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskData) => Promise<void>;
  caseData: SalesCase;
}

const taskTypes = [
  "Follow-up Call",
  "Send Email",
  "Prepare Quotation",
  "Schedule Meeting",
  "Document Review",
  "Customer Visit",
  "Internal Meeting",
  "Contract Preparation",
];

const priorities = ["Low", "Medium", "High", "Critical"];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  caseData,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    taskType: "Follow-up Call",
    dueDate: "",
    dueTime: "",
    priority: "Medium",
    description: "",
    assignedTo: "Sarah Johnson",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!formData.dueTime) {
      newErrors.dueTime = "Due time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        ...formData,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      await onSave(taskData);

      // Reset form
      setFormData({
        title: "",
        taskType: "Follow-up Call",
        dueDate: "",
        dueTime: "",
        priority: "Medium",
        description: "",
        assignedTo: "Sarah Johnson",
      });
      setErrors({});
      // Parent will handle modal close via setIsScheduleModalOpen(false)
      // Don't call onClose() here to avoid double-closing
    } catch (error) {
      console.error("Error scheduling task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Task - {caseData.id}
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
            {/* Case Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                Related Case
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                <p>
                  <strong>Customer:</strong> {caseData.customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {caseData.status}
                </p>
                <p>
                  <strong>Type:</strong> {caseData.case_type || "N/A"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Task Title *"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    error={errors.title}
                    placeholder="Enter task title"
                  />
                </div>

                <Select
                  label="Task Type"
                  value={formData.taskType}
                  onChange={(e) =>
                    handleInputChange("taskType", e.target.value)
                  }
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Due Date *"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  error={errors.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                />

                <Input
                  label="Due Time *"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange("dueTime", e.target.value)}
                  error={errors.dueTime}
                />

                <div className="md:col-span-2">
                  <Select
                    label="Assigned To"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      handleInputChange("assignedTo", e.target.value)
                    }
                  >
                    <option value="Sarah Johnson">Sarah Johnson</option>
                    <option value="Mike Chen">Mike Chen</option>
                    <option value="Lisa Rodriguez">Lisa Rodriguez</option>
                    <option value="David Wilson">David Wilson</option>
                    <option value="Emma Davis">Emma Davis</option>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add task description or additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
