import React, { useState, useEffect } from "react";
import { X, Save, Calendar } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import customerService from "../../services/customerService";
import supplierService from "../../services/supplierService";
import staffService from "../../services/staffService";
import productService from "../../services/productService";
import { useToastContext } from "../../contexts/ToastContext";

interface AddReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationData: any) => Promise<void>;
}

const destinations = [
  "Luxor",
  "Aswan",
  "Cairo",
  "Hurghada",
  "Sharm El Sheikh",
  "Alexandria",
];
const roomTypes = [
  "Standard",
  "Deluxe",
  "Superior",
  "Suite",
  "Family Room",
  "Connecting Rooms",
];
const mealPlans = [
  "Room Only",
  "Breakfast",
  "Half Board",
  "Full Board",
  "All Inclusive",
];
const nationalities = [
  "Egyptian",
  "American",
  "British",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Other",
];

export const AddReservationModal: React.FC<AddReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
    customer_id: "",
    tripItem: "",
    destination: "Luxor",
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
    childAges: "",
    rooms: "1",
    roomType: "Standard",
    mealPlan: "Half Board",
    nationality: "Egyptian",
    supplier: "",
    supplier_id: "",
    assignedAgent: "",
    specialRequests: "",
    total_amount: "0",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [tripTypes, setTripTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [customersRes, suppliersRes, agentsRes, productsRes] =
            await Promise.all([
              customerService.getAllCustomers({ limit: 100 }),
              supplierService.getAllSuppliers(),
              staffService.getAllStaff(),
              productService.getAllProducts(),
            ]);
          setCustomers(customersRes.customers || []);
          setSuppliers(suppliersRes || []);
          const mappedAgents = (agentsRes.staff || []).map((u: any) => ({
            id: u.id,
            name: u.full_name || u.name || "Unnamed",
          }));
          setAgents(mappedAgents);
          setTripTypes(productsRes.products || []);

          if (productsRes.products?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              tripItem: productsRes.products[0].id,
            }));
          }
          if (agentsRes.staff?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              assignedAgent: agentsRes.staff[0].id,
            }));
          }
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    loadData();
  }, [isOpen]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) {
      newErrors.customer = "Customer name is required";
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer phone is required";
    }

    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in date is required";
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out date is required";
    }

    if (
      formData.checkIn &&
      formData.checkOut &&
      new Date(formData.checkIn) >= new Date(formData.checkOut)
    ) {
      newErrors.checkOut = "Check-out date must be after check-in date";
    }

    if (parseInt(formData.adults) < 1) {
      newErrors.adults = "At least 1 adult is required";
    }

    if (parseInt(formData.children) > 0 && !formData.childAges.trim()) {
      newErrors.childAges =
        "Child ages are required when children are specified";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Validation Error",
        "Please fill all required fields correctly"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Find or create customer
      let customerId = formData.customer_id;
      if (!customerId && formData.customer && formData.customerEmail) {
        try {
          // Try to find existing customer
          const customersRes = await customerService.getAllCustomers({
            search: formData.customerEmail,
            limit: 1,
          });
          if (customersRes.customers && customersRes.customers.length > 0) {
            customerId = customersRes.customers[0].id;
          } else {
            // Create new customer
            const newCustomer = await customerService.createCustomer({
              name: formData.customer,
              email: formData.customerEmail,
              phone: formData.customerPhone,
              type: "Individual",
            });
            customerId = newCustomer.id;
          }
        } catch (error: any) {
          console.error("Error finding/creating customer:", error);
          toast.error(
            "Error",
            error.response?.data?.message || "Failed to find or create customer"
          );
          setIsLoading(false);
          return;
        }
      }

      // Find supplier by name
      let supplierId = formData.supplier_id;
      if (!supplierId && formData.supplier) {
        const foundSupplier = suppliers.find(
          (s) => s.name === formData.supplier
        );
        if (foundSupplier) {
          supplierId = foundSupplier.id;
        }
      }

      // Extract service type from tripItem
      const serviceType = formData.tripItem.includes("Hotel")
        ? "Hotel"
        : formData.tripItem.includes("Flight")
        ? "Flight"
        : formData.tripItem.includes("Tour")
        ? "Tour"
        : formData.tripItem.includes("Package")
        ? "Package"
        : formData.tripItem.includes("Activity")
        ? "Tour"
        : formData.tripItem.includes("Transport")
        ? "Other"
        : formData.tripItem.includes("Cruise")
        ? "Package"
        : "Other";

      const reservationData = {
        customer_id: customerId,
        supplier_id: supplierId || undefined,
        service_type: serviceType,
        destination: formData.destination,
        departure_date: formData.checkIn,
        return_date: formData.checkOut || undefined,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        infants: 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        notes: formData.specialRequests || "",
      };

      console.log("Creating reservation:", reservationData);
      await onSave(reservationData);

      toast.success("Created!", "Reservation has been added successfully");

      // Reset form
      setFormData({
        customer: "",
        customerEmail: "",
        customerPhone: "",
        customer_id: "",
        tripItem: tripTypes.length > 0 ? tripTypes[0].id : "",
        destination: "Luxor",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        childAges: "",
        rooms: "1",
        roomType: "Standard",
        mealPlan: "Half Board",
        nationality: "Egyptian",
        supplier: "",
        supplier_id: "",
        assignedAgent: agents.length > 0 ? agents[0].id : "",
        specialRequests: "",
        total_amount: "0",
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error("Error saving reservation:", error);
      toast.error(
        "Failed to Create",
        error.message || "Unknown error occurred"
      );
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
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Reservation
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Customer Name *"
                  value={formData.customer}
                  onChange={(e) =>
                    handleInputChange("customer", e.target.value)
                  }
                  error={errors.customer}
                  placeholder="Enter customer name"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    handleInputChange("customerEmail", e.target.value)
                  }
                  error={errors.customerEmail}
                  placeholder="Enter email address"
                />
                <Input
                  label="Phone *"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleInputChange("customerPhone", e.target.value)
                  }
                  error={errors.customerPhone}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Trip Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trip Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip/Item *
                  </label>
                  <select
                    value={formData.tripItem}
                    onChange={(e) =>
                      handleInputChange("tripItem", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a Trip/Item --</option>
                    {tripTypes.length > 0 ? (
                      tripTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.product_name || type.name}{" "}
                          {type.category ? `(${type.category})` : ""}
                        </option>
                      ))
                    ) : (
                      <option disabled>No items available</option>
                    )}
                  </select>
                </div>

                <Select
                  label="Destination *"
                  value={formData.destination}
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                >
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Check-in Date *"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  error={errors.checkIn}
                  min={new Date().toISOString().split("T")[0]}
                />

                <Input
                  label="Check-out Date *"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) =>
                    handleInputChange("checkOut", e.target.value)
                  }
                  error={errors.checkOut}
                  min={
                    formData.checkIn || new Date().toISOString().split("T")[0]
                  }
                />

                {calculateNights() > 0 && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Total Nights:</strong> {calculateNights()}{" "}
                        nights
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Passenger Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Passenger Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Adults *"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => handleInputChange("adults", e.target.value)}
                  error={errors.adults}
                />

                <Input
                  label="Children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) =>
                    handleInputChange("children", e.target.value)
                  }
                />

                <Input
                  label="Child Ages (comma separated)"
                  value={formData.childAges}
                  onChange={(e) =>
                    handleInputChange("childAges", e.target.value)
                  }
                  error={errors.childAges}
                  placeholder="e.g., 8, 12"
                  disabled={parseInt(formData.children) === 0}
                />

                <Input
                  label="Number of Rooms"
                  type="number"
                  min="1"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange("rooms", e.target.value)}
                />
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Room Type"
                  value={formData.roomType}
                  onChange={(e) =>
                    handleInputChange("roomType", e.target.value)
                  }
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Meal Plan"
                  value={formData.mealPlan}
                  onChange={(e) =>
                    handleInputChange("mealPlan", e.target.value)
                  }
                >
                  {mealPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Nationality"
                  value={formData.nationality}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                >
                  {nationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assignment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    handleInputChange("supplier", e.target.value)
                  }
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Assigned Agent"
                  value={formData.assignedAgent}
                  onChange={(e) =>
                    handleInputChange("assignedAgent", e.target.value)
                  }
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Special Requests and Amount */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Total Amount ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) =>
                    handleInputChange("total_amount", e.target.value)
                  }
                  placeholder="Enter total amount"
                />
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  handleInputChange("specialRequests", e.target.value)
                }
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any special requests or requirements..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                Create Reservation
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
