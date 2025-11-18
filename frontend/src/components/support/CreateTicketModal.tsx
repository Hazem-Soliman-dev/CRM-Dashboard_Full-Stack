import React, { useState, useEffect } from "react";
import { X, Save, Upload } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import userService from "../../services/userService";
import departmentService from "../../services/departmentService";
import customerService from "../../services/customerService";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => Promise<void>;
}

const sources = [
  "Email",
  "WhatsApp",
  "Phone",
  "Internal",
  "Website",
  "Walk-in",
];
const priorities = ["Low", "Medium", "High", "Urgent"];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    bookingRef: "",
    subject: "",
    description: "",
    source: "Email",
    department: "",
    priority: "Medium",
    assigned_to: "",
    tags: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [staffRes, deptRes, custRes] = await Promise.all([
            userService.getAllUsers({ limit: 100 }),
            departmentService.getAllDepartments(),
            customerService.getAllCustomers({ limit: 100 }),
          ]);
          setStaff(staffRes.users || []);
          setDepartments(deptRes.departments || []);
          setCustomers(custRes.customers || []);

          if (staffRes.users?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              assigned_to: staffRes.users[0].id,
            }));
          }
          if (deptRes.departments?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              department: deptRes.departments[0].name,
            }));
          }
          if (custRes.customers?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              customer_id: custRes.customers[0].id,
            }));
          }
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    loadData();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
      const ticketData = {
        ...formData,
        status: "Open",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        attachments: attachments.length,
      };

      await onSave(ticketData);

      // Reset form
      setFormData({
        customer_id: "",
        bookingRef: "",
        subject: "",
        description: "",
        source: "Email",
        department: "Support",
        priority: "Medium",
        assigned_to: "",
        tags: "",
      });
      setAttachments([]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Ticket
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Customer *"
                value={formData.customer_id}
                onChange={(e) =>
                  handleInputChange("customer_id", e.target.value)
                }
                error={errors.customer_id}
              >
                <option value="">Select customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Booking Reference"
                value={formData.bookingRef}
                onChange={(e) =>
                  handleInputChange("bookingRef", e.target.value)
                }
                placeholder="e.g., BK-2025-001"
              />

              <div className="md:col-span-2">
                <Input
                  label="Subject *"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  error={errors.subject}
                  placeholder="Brief description of the issue"
                />
              </div>

              <Select
                label="Source"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </Select>

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>

              <Select
                label="Assign To"
                value={formData.assigned_to}
                onChange={(e) =>
                  handleInputChange("assigned_to", e.target.value)
                }
              >
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Detailed description of the issue..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="mt-6">
              <Input
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="e.g., refund, urgent, visa"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                Create Ticket
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
