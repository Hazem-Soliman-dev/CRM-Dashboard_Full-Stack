import React, { useState, useEffect } from "react";
import { X, Save, Edit3 } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import salesService from "../../services/salesService";
import customerService from "../../services/customerService";
import productService from "../../services/productService";
import staffService from "../../services/staffService";
import departmentService from "../../services/departmentService";
import { useToastContext } from "../../contexts/ToastContext";

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  caseData: any;
}

const statuses = ["Open", "In Progress", "Quoted", "Won", "Lost"];

// Sample fallback items if API returns empty
const SAMPLE_ITEMS = [
  {
    id: "item-1",
    name: "Premium Support Package",
    product_name: "Premium Support",
  },
  {
    id: "item-2",
    name: "Implementation Service",
    product_name: "Implementation",
  },
  { id: "item-3", name: "Training & Onboarding", product_name: "Training" },
  { id: "item-4", name: "Custom Development", product_name: "Development" },
  { id: "item-5", name: "Consultation Hours", product_name: "Consultation" },
  { id: "item-6", name: "Maintenance Contract", product_name: "Maintenance" },
];

const SAMPLE_DEPARTMENTS = [
  { id: "dept-1", name: "Sales" },
  { id: "dept-2", name: "Support" },
  { id: "dept-3", name: "Implementation" },
  { id: "dept-4", name: "Finance" },
  { id: "dept-5", name: "Operations" },
];

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  caseData,
}) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customer_id: "",
    status: "Open",
    value: "0",
    probability: "0",
    expected_close_date: "",
    assigned_to: "",
    caseType: "B2C",
    quotationStatus: "Draft",
    linkedItems: [] as string[],
    assignedDepartments: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [customersRes, itemRes, agentRes, deptRes] = await Promise.all([
            customerService.getAllCustomers({ limit: 100 }),
            productService.getAllProducts(),
            staffService.getAllStaff(),
            departmentService.getAllDepartments(),
          ]);
          setCustomers(customersRes.customers || []);

          // Use fetched data or fallback to sample data
          const itemsData =
            itemRes.products && itemRes.products.length > 0
              ? itemRes.products
              : SAMPLE_ITEMS;
          const agentsData =
            agentRes.staff && agentRes.staff.length > 0
              ? agentRes.staff
              : [];
          const departmentsData =
            deptRes.departments && deptRes.departments.length > 0
              ? deptRes.departments
              : SAMPLE_DEPARTMENTS;

          setItems(itemsData);
          setAgents(agentsData);
          setDepartments(departmentsData);
        } catch (error) {
          console.error("Failed to load data:", error);
          // Use sample data as fallback on error
          setItems(SAMPLE_ITEMS);
          setAgents([]);
          setDepartments(SAMPLE_DEPARTMENTS);
        }
      }
    };
    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (caseData && isOpen) {
      // Initialize form data from caseData
      // Map linked_items (array of objects) to array of IDs
      const linkedItemIds = caseData.linked_items 
        ? caseData.linked_items.map((item: any) => String(item.id || item))
        : caseData.linkedItems || [];
      
      // Map assigned_departments (array of objects) to array of names
      const assignedDeptNames = caseData.assigned_departments
        ? caseData.assigned_departments.map((dept: any) => dept.name || dept)
        : caseData.departments || [];
      
      setFormData({
        title: caseData.title || "",
        description: caseData.description || caseData.notes || "",
        customer_id: caseData.customer_id || "",
        status: caseData.status || "Open",
        value: (caseData.value || 0).toString(),
        probability: (caseData.probability || 0).toString(),
        expected_close_date: caseData.expected_close_date || "",
        assigned_to: caseData.assigned_to ? String(caseData.assigned_to) : "",
        caseType: caseData.case_type || caseData.type || "B2C",
        quotationStatus: caseData.quotation_status || caseData.quotationStatus || (caseData.status === "Quoted" ? "Sent" : "Draft"),
        linkedItems: linkedItemIds,
        assignedDepartments: assignedDeptNames,
      });
    }
  }, [caseData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (parseFloat(formData.value) < 0) {
      newErrors.value = "Value must be a positive number";
    }

    if (
      parseInt(formData.probability) < 0 ||
      parseInt(formData.probability) > 100
    ) {
      newErrors.probability = "Probability must be between 0 and 100";
    }

    // Note: linkedItems validation removed for edit (it's optional in edit)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !caseData) {
      return;
    }

    setIsLoading(true);
    try {
      // Use database ID for update (caseData.id should be the database ID)
      const databaseId = caseData.id || caseData._original?.id;
      if (!databaseId) {
        toast.error("Error", "Cannot update: Case ID not found");
        setIsLoading(false);
        return;
      }
      
      // Ensure ID is a string for the API call
      const caseId = String(databaseId);

      // Build update data - rebuild from scratch to ensure clean data
      const updateData: any = {};
      
      // Required fields - always include
      updateData.title = formData.title.trim();
      updateData.status = formData.status as "Open" | "In Progress" | "Quoted" | "Won" | "Lost";
      updateData.value = parseFloat(formData.value) || 0;
      updateData.probability = parseInt(formData.probability) || 0;
      
      // Optional text fields
      updateData.description = (formData.description || "").trim();
      
      // Optional date field
      if (formData.expected_close_date) {
        updateData.expected_close_date = formData.expected_close_date;
      }
      
      // Optional assigned_to field
      if (formData.assigned_to && formData.assigned_to !== "") {
        const assignedToNum = parseInt(formData.assigned_to);
        if (!isNaN(assignedToNum)) {
          updateData.assigned_to = assignedToNum;
        }
      }
      
      // Optional case type and quotation status
      if (formData.caseType) {
        updateData.case_type = formData.caseType as "B2C" | "B2B";
      }
      if (formData.quotationStatus) {
        updateData.quotation_status = formData.quotationStatus as "Draft" | "Sent" | "Accepted" | "Rejected";
      }

      // Convert linked items to array of integers (item IDs)
      const itemIds = formData.linkedItems
        ? formData.linkedItems
            .map((itemId: string) => parseInt(itemId))
            .filter((id: number) => !isNaN(id))
        : [];
      updateData.linked_items = itemIds;

      // Convert assigned departments (names) to array of integers (department IDs)
      const deptIds = formData.assignedDepartments
        ? formData.assignedDepartments
            .map((deptName: string) => {
              const dept = departments.find((d) => d.name === deptName);
              return dept ? parseInt(dept.id) : null;
            })
            .filter((id: number | null) => id !== null) as number[]
        : [];
      updateData.assigned_departments = deptIds;

      console.log("Updating case with ID:", caseId);
      console.log("Update data:", updateData);

      try {
        const response = await salesService.updateSalesCase(caseId, updateData);
        console.log("Update response:", response);

        if (!response) {
          throw new Error("No response from server");
        }
      } catch (apiError: any) {
        console.error("API Error details:", apiError);
        console.error("API Error response:", apiError?.response);
        console.error("API Error status:", apiError?.response?.status);
        console.error("API Error data:", apiError?.response?.data);
        throw apiError; // Re-throw to be caught by outer catch
      }

      toast.success(
        "Case Updated",
        "Sales case has been updated successfully."
      );
      // Call parent's onSave which will handle state cleanup and close modal
      await onSave();
    } catch (error: any) {
      console.error("Error updating case:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message || 
        "Failed to update case";
      toast.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLinkedItemsChange = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedItems: prev.linkedItems.includes(item)
        ? prev.linkedItems.filter((i) => i !== item)
        : [...prev.linkedItems, item],
    }));
  };

  const handleDepartmentsChange = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedDepartments: prev.assignedDepartments.includes(dept)
        ? prev.assignedDepartments.filter((d) => d !== dept)
        : [...prev.assignedDepartments, dept],
    }));
  };

  if (!isOpen || !caseData) return null;

  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Edit3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Sales Case
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Case ID: {caseData.displayId || caseData.case_id || caseData.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  error={errors.title}
                  placeholder="Enter case title"
                />
              </div>

              <Select
                label="Customer *"
                value={formData.customer_id}
                onChange={(e) =>
                  handleInputChange("customer_id", e.target.value)
                }
                error={errors.customer_id}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Case Type"
                value={formData.caseType}
                onChange={(e) => handleInputChange("caseType", e.target.value)}
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </Select>

              {selectedCustomer && (
                <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Contact Information (Auto-filled)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">
                        Email:{" "}
                      </span>
                      <span className="text-blue-800 dark:text-blue-300">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-400">
                        Phone:{" "}
                      </span>
                      <span className="text-blue-800 dark:text-blue-300">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Select
                label="Status *"
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
                label="Quotation Status"
                value={formData.quotationStatus}
                onChange={(e) =>
                  handleInputChange("quotationStatus", e.target.value)
                }
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </Select>

              <Input
                label="Value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                error={errors.value}
                placeholder="0.00"
              />

              <Input
                label="Probability (%)"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) =>
                  handleInputChange("probability", e.target.value)
                }
                error={errors.probability}
                placeholder="0"
              />

              <Input
                label="Expected Close Date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) =>
                  handleInputChange("expected_close_date", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Assigned Agent
                </label>
                {agents.length > 0 ? (
                  <select
                    value={formData.assigned_to}
                    onChange={(e) =>
                      handleInputChange("assigned_to", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name || agent.full_name || "Unnamed Agent"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                    No agents available
                  </div>
                )}
              </div>
            </div>

            {/* Linked Items */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                🔗 Linked Items (Multi-select)
              </label>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center space-x-3 p-2 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.linkedItems.includes(item.id)}
                        onChange={() => handleLinkedItemsChange(item.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name || item.product_name || "Unnamed Item"}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                  No items available. Please add items first.
                </div>
              )}
            </div>

            {/* Assigned Departments */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                🏢 Assigned Departments (Multi-select)
              </label>
              {departments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center space-x-3 p-2 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedDepartments.includes(
                          dept.name
                        )}
                        onChange={() => handleDepartmentsChange(dept.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dept.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                  No departments available
                </div>
              )}
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
                placeholder="Enter case description..."
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
                Update Case
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
