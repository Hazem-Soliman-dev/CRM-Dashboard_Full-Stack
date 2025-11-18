import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import customerService from "../../services/customerService";
import productService from "../../services/productService";
import staffService from "../../services/staffService";
import departmentService from "../../services/departmentService";

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: any) => Promise<void>;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [items, setItems] = React.useState<any[]>([]);
  const [agents, setAgents] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: "",
    caseType: "B2C",
    quotationStatus: "Draft",
    linkedItems: [] as string[],
    assignedDepartments: [] as string[],
    initialStatus: "New",
    assignedAgent: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const SAMPLE_AGENTS = [
    { id: "agent-1", name: "John Smith", full_name: "John Smith" },
    { id: "agent-2", name: "Sarah Johnson", full_name: "Sarah Johnson" },
    { id: "agent-3", name: "Mike Wilson", full_name: "Mike Wilson" },
    { id: "agent-4", name: "Emma Davis", full_name: "Emma Davis" },
  ];

  const SAMPLE_DEPARTMENTS = [
    { id: "dept-1", name: "Sales" },
    { id: "dept-2", name: "Support" },
    { id: "dept-3", name: "Implementation" },
    { id: "dept-4", name: "Finance" },
    { id: "dept-5", name: "Operations" },
  ];

  React.useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [customerRes, itemRes, agentRes, deptRes] = await Promise.all([
            customerService.getAllCustomers(),
            productService.getAllProducts(),
            staffService.getAllStaff(),
            departmentService.getAllDepartments(),
          ]);
          setCustomers(customerRes.customers || []);

          // Use fetched data or fallback to sample data
          const itemsData =
            itemRes.products && itemRes.products.length > 0
              ? itemRes.products
              : SAMPLE_ITEMS;
          const agentsData =
            agentRes.staff && agentRes.staff.length > 0
              ? agentRes.staff
              : SAMPLE_AGENTS;
          const departmentsData =
            deptRes.departments && deptRes.departments.length > 0
              ? deptRes.departments
              : SAMPLE_DEPARTMENTS;

          setItems(itemsData);
          setAgents(agentsData);
          setDepartments(departmentsData);

          if (agentsData?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              assignedAgent: agentsData[0].id,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch data for case creation", error);
          // Use sample data as fallback on error
          setItems(SAMPLE_ITEMS);
          setAgents(SAMPLE_AGENTS);
          setDepartments(SAMPLE_DEPARTMENTS);

          // Set first agent as default
          setFormData((prev) => ({
            ...prev,
            assignedAgent: SAMPLE_AGENTS[0].id,
          }));
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (formData.linkedItems.length === 0) {
      newErrors.linkedItems = "At least one linked item is required";
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
      const selectedCustomer = customers.find(
        (c) => c.id === formData.customerId
      );

      // Map form data to API format with required fields
      const caseData = {
        customer_id: parseInt(formData.customerId) || 0,
        title: `Sales Case - ${selectedCustomer?.name || 'Customer'}`,
        description: formData.notes || "",
        value: 0, // Default value
        probability: 50, // Default probability
        assigned_to: formData.assignedAgent ? parseInt(formData.assignedAgent) : undefined,
        // Additional fields for the UI response
        customer: selectedCustomer?.name || "",
        customerEmail: selectedCustomer?.email || "",
        customerPhone: selectedCustomer?.phone || "",
        status: formData.initialStatus,
        linkedItems: formData.linkedItems,
        departments: formData.assignedDepartments,
      };

      await onSave(caseData);

      // Reset form
      setFormData({
        customerId: "",
        caseType: "B2C",
        quotationStatus: "Draft",
        linkedItems: [],
        assignedDepartments: [],
        initialStatus: "New",
        assignedAgent: agents.length > 0 ? agents[0].id : "",
        notes: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating case:", error);
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

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Case
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
              <div>
                <Select
                  label="Customer *"
                  value={formData.customerId}
                  onChange={(e) =>
                    handleInputChange("customerId", e.target.value)
                  }
                  error={errors.customerId}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Case Type"
                  value={formData.caseType}
                  onChange={(e) =>
                    handleInputChange("caseType", e.target.value)
                  }
                >
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </Select>
              </div>

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

              <div>
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
                </Select>
              </div>

              <div>
                <Select
                  label="Initial Status"
                  value={formData.initialStatus}
                  onChange={(e) =>
                    handleInputChange("initialStatus", e.target.value)
                  }
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Reply">Awaiting Reply</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Assigned Agent
                </label>
                {agents.length > 0 ? (
                  <select
                    value={formData.assignedAgent}
                    onChange={(e) =>
                      handleInputChange("assignedAgent", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <option value="">Select an agent...</option>
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
                🔗 Linked Items <span className="text-red-500">*</span>{" "}
                (Multi-select)
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
              {errors.linkedItems && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.linkedItems}
                </p>
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
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this case..."
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
                Create Case
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
