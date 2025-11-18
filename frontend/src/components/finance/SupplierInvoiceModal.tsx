import React, { useState } from "react";
import {
  X,
  Save,
  Upload,
  FileText,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { formatCurrency, formatDate } from "../../utils/format";
import supplierService from "../../services/supplierService";
import { useToastContext } from "../../contexts/ToastContext";
import invoiceService from "../../services/invoiceService";
import { Reservation } from "../../services/reservationService";

interface SupplierInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Reservation;
}

export const SupplierInvoiceModal: React.FC<SupplierInvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const toast = useToastContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    supplier_id: "",
    amount: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    status: "Issued",
    notes: "",
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  React.useEffect(() => {
    if (booking && isOpen) {
      const loadData = async () => {
        try {
          // Use the database ID, not reservation_id
          const bookingId = booking.id || booking.reservation_id;
          console.log("Loading invoices for booking:", bookingId);
          
          const [invoicesRes, suppliersRes] = await Promise.all([
            invoiceService.getInvoicesForBooking(String(bookingId)),
            supplierService.getAllSuppliers(),
          ]);
          
          console.log("Loaded invoices:", invoicesRes.invoices);
          setInvoices(invoicesRes.invoices || []);
          setSuppliers(suppliersRes || []);

          if (booking.supplier) {
            setFormData((prev) => ({
              ...prev,
              supplier_id: booking.supplier?.id || "",
              amount: booking.total_amount?.toString() || "",
            }));
          }
        } catch (error) {
          console.error("Failed to load supplier data:", error);
        }
      };
      loadData();
    }
  }, [booking, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "Invoice number is required";
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
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
      const invoiceData = new FormData();
      invoiceData.append("supplier_id", formData.supplier_id);
      invoiceData.append("booking_id", booking.id);
      invoiceData.append("amount", formData.amount);
      invoiceData.append("invoice_number", formData.invoiceNumber);
      invoiceData.append("issue_date", formData.issueDate);
      invoiceData.append("due_date", formData.dueDate);
      invoiceData.append("status", formData.status);
      invoiceData.append("notes", formData.notes);
      if (invoiceFile) {
        invoiceData.append("file", invoiceFile);
      }

      await invoiceService.createInvoice(invoiceData);

      toast.success(
        "Invoice Recorded",
        "Supplier invoice has been recorded successfully."
      );

      // Refresh invoices list
      if (booking?.id) {
        const bookingId = booking.id || booking.reservation_id;
        const invoicesRes = await invoiceService.getInvoicesForBooking(String(bookingId));
        setInvoices(invoicesRes.invoices || []);
      }

      // Reset form
      setFormData({
        supplier_id: "",
        amount: "",
        invoiceNumber: "",
        issueDate: "",
        dueDate: "",
        status: "Issued",
        notes: "",
      });
      setInvoiceFile(null);
      setErrors({});
      
      // Switch to existing tab to show the new invoice
      setActiveTab("existing");
    } catch (error: any) {
      console.error("Error recording supplier invoice:", error);
      toast.error(
        "Error",
        error.response?.data?.message || "Failed to record invoice"
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

  const handleMarkAsPaid = async (invoiceId: string | number) => {
    try {
      // Ensure invoiceId is a string
      const id = String(invoiceId);
      console.log("Marking invoice as paid:", id);
      
      const updatedInvoice = await invoiceService.updateInvoice(id, { status: "Paid" });
      console.log("Invoice updated:", updatedInvoice);
      
      toast.success(
        "Invoice Paid",
        "Supplier invoice has been marked as paid."
      );
      // Refresh invoices list
      if (booking?.id) {
        const invoicesRes = await invoiceService.getInvoicesForBooking(String(booking.id));
        setInvoices(invoicesRes.invoices || []);
      }
    } catch (error: any) {
      console.error("Error marking invoice as paid:", error);
      toast.error(
        "Error",
        error.response?.data?.message || "Failed to mark invoice as paid"
      );
    }
  };

  const handleMarkAsUnpaid = async (invoiceId: string | number) => {
    try {
      // Ensure invoiceId is a string
      const id = String(invoiceId);
      console.log("Marking invoice as unpaid:", id);
      
      const updatedInvoice = await invoiceService.updateInvoice(id, { status: "Issued" });
      console.log("Invoice updated:", updatedInvoice);
      
      toast.success(
        "Invoice Updated",
        "Supplier invoice has been marked as unpaid."
      );
      // Refresh invoices list
      if (booking?.id) {
        const invoicesRes = await invoiceService.getInvoicesForBooking(String(booking.id));
        setInvoices(invoicesRes.invoices || []);
      }
    } catch (error: any) {
      console.error("Error marking invoice as unpaid:", error);
      toast.error(
        "Error",
        error.response?.data?.message || "Failed to update invoice"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Issued":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (!isOpen || !booking) return null;

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
              <FileText className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Supplier Invoices - {booking.id}
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
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab("existing")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "existing"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Existing Invoices
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "new"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Add New Invoice
              </button>
            </div>

            {activeTab === "existing" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Supplier Invoices for this Booking
                </h3>

                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
                          <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invoice.supplier?.name || "Unknown Supplier"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Invoice: {invoice.invoice_number}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Amount: {formatCurrency(invoice.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Due: {formatDate(invoice.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                        <div className="flex space-x-2">
                          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
                            <button
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {invoice.status === "Paid" && (
                            <button
                              onClick={() => handleMarkAsUnpaid(invoice.id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                              title="Mark as Unpaid"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Uploaded by {invoice.uploaded_by?.name || "System"} on{" "}
                      {formatDate(invoice.upload_date)}
                    </div>
                    {invoice.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {invoice.notes}
                      </div>
                    )}
                  </div>
                ))}

                {invoices.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No supplier invoices recorded yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "new" && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Supplier *"
                    value={formData.supplier_id}
                    onChange={(e) =>
                      handleInputChange("supplier_id", e.target.value)
                    }
                    error={errors.supplier_id}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Invoice Amount *"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    error={errors.amount}
                    placeholder="Enter invoice amount"
                  />

                  <Input
                    label="Invoice Number *"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      handleInputChange("invoiceNumber", e.target.value)
                    }
                    error={errors.invoiceNumber}
                    placeholder="Enter invoice number"
                  />

                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Issued">Issued</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>

                  <Input
                    label="Issue Date *"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    error={errors.issueDate}
                  />

                  <Input
                    label="Due Date *"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    error={errors.dueDate}
                    min={formData.issueDate}
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Invoice Document
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="invoice-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                        >
                          <span>Upload invoice</span>
                          <input
                            id="invoice-upload"
                            name="invoice-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setInvoiceFile(file);
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>

                  {invoiceFile && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Selected: {invoiceFile.name}
                      </p>
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
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about this supplier invoice..."
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
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Record Invoice
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
