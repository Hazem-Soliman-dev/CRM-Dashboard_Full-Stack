import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { generateId } from "../../utils/format";
import staffService from "../../services/staffService";
import { useToastContext } from "../../contexts/ToastContext";
import { CreateCustomerData } from "../../services/customerService";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: CreateCustomerData) => Promise<void>;
}

const customerTypes = ["Individual", "Corporate"];
const contactMethods = ["Email", "Phone", "WhatsApp"];
const statuses = ["Active", "Inactive", "Suspended"];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const toast = useToastContext();
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    type: "Individual",
    contactMethod: "Email",
    status: "Active",
    assignedStaff: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        try {
          const { staff: staffData } = await staffService.getAllStaff();
          setStaff(staffData);
          if (staffData.length > 0) {
            setFormData((prev) => ({
              ...prev,
              assignedStaff: staffData[0].id,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch staff", error);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.assignedStaff) {
      newErrors.assignedStaff = "An agent must be assigned";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Error", "Please fill all required fields correctly");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating customer with form data:", formData);
      
      // Pass data exactly as Leads does it
      await onSave({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || "",
        type: formData.type as "Individual" | "Corporate",
        contact_method: formData.contactMethod as "Email" | "Phone" | "SMS",
        assigned_staff_id: formData.assignedStaff ? formData.assignedStaff.toString() : undefined,
        notes: formData.notes || undefined
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        type: "Individual",
        contactMethod: "Email",
        status: "Active",
        assignedStaff: "",
        notes: "",
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast.error("Failed to Create", error.message || "Unknown error occurred");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Customer
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
              <Input
                label="Full Name *"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={errors.fullName}
                placeholder="Enter full name"
              />

              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                placeholder="Enter email address"
              />

              <Input
                label="Phone *"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                placeholder="Enter phone number"
              />

              <Input
                label="Company Name"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Enter company name (if applicable)"
              />

              <Select
                label="Customer Type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>

              <Select
                label="Preferred Contact Method"
                value={formData.contactMethod}
                onChange={(e) =>
                  handleInputChange("contactMethod", e.target.value)
                }
              >
                {contactMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>

              <Select
                label="Assigned Staff"
                value={formData.assignedStaff}
                onChange={(e) =>
                  handleInputChange("assignedStaff", e.target.value)
                }
                error={errors.assignedStaff}
              >
                <option value="">Select a staff member</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.name || "Unnamed"}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this customer..."
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
                Save Customer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
