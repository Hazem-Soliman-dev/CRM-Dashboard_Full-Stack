import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import customerService from '../../services/customerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationData: any) => Promise<void>;
  reservation: any;
}

const statuses = ['New', 'Pending', 'Confirmed', 'Awaiting Supplier', 'Reserved', 'Cancelled'];

export const EditReservationModal: React.FC<EditReservationModalProps> = ({ isOpen, onClose, onSave, reservation }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    supplier_id: '',
    tripItem: '',
    service_type: 'Other',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: '1',
    children: '0',
    infants: '0',
    total_amount: '0',
    status: 'Pending',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tripTypes, setTripTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          const [customersRes, suppliersRes, productsRes] = await Promise.all([
            customerService.getAllCustomers({ limit: 100 }),
            supplierService.getAllSuppliers(),
            productService.getAllProducts()
          ]);
          setCustomers(customersRes.customers || []);
          setSuppliers(suppliersRes || []);
          setTripTypes(productsRes.products || []);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };
    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (reservation && isOpen) {
      console.log("Auto-filling with reservation:", reservation);
      setFormData({
        customer_id: String(reservation.customer_id || ''),
        supplier_id: String(reservation.supplier_id || ''),
        tripItem: String(reservation.tripItem || ''),
        service_type: reservation.service_type || 'Other',
        destination: reservation.destination || '',
        departure_date: reservation.departure_date || reservation.checkIn || '',
        return_date: reservation.return_date || reservation.checkOut || '',
        adults: String(reservation.adults || 1),
        children: String(reservation.children || 0),
        infants: String(reservation.infants || 0),
        total_amount: String(reservation.total_amount || 0),
        status: reservation.status || 'Pending',
        notes: reservation.notes || ''
      });
    }
  }, [reservation, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required';
    }

    if (formData.departure_date && formData.return_date && new Date(formData.departure_date) >= new Date(formData.return_date)) {
      newErrors.return_date = 'Return date must be after departure date';
    }

    if (parseInt(formData.adults) < 1) {
      newErrors.adults = 'At least 1 adult is required';
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
      // Note: customer_id cannot be updated per backend interface
      const reservationData = {
        supplier_id: formData.supplier_id || undefined,
        service_type: formData.service_type,
        destination: formData.destination,
        departure_date: formData.departure_date,
        return_date: formData.return_date || undefined,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        infants: parseInt(formData.infants),
        total_amount: parseFloat(formData.total_amount) || 0,
        status: formData.status,
        notes: formData.notes || ''
      };

      await onSave(reservationData);
      onClose();
    } catch (error) {
      console.error('Error updating reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Edit3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Reservation
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ID: {reservation.reservation_id || reservation.id}
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
              <Select
                label="Customer *"
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                error={errors.customer_id}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </Select>

              <Select
                label="Supplier"
                value={formData.supplier_id}
                onChange={(e) => handleInputChange('supplier_id', e.target.value)}
              >
                <option value="">No Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trip/Item *
                </label>
                <select
                  value={formData.tripItem}
                  onChange={(e) => handleInputChange('tripItem', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a Trip/Item --</option>
                  {tripTypes.length > 0 ? (
                    tripTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.product_name || type.name} {type.category ? `(${type.category})` : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>No items available</option>
                  )}
                </select>
                {tripTypes.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ No trip items available.
                  </p>
                )}
              </div>

              <Select
                label="Service Type *"
                value={formData.service_type}
                onChange={(e) => handleInputChange('service_type', e.target.value)}
              >
                <option value="Flight">Flight</option>
                <option value="Hotel">Hotel</option>
                <option value="Tour">Tour</option>
                <option value="Package">Package</option>
                <option value="Other">Other</option>
              </Select>

              <Input
                label="Destination *"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                error={errors.destination}
                placeholder="Enter destination"
              />

              <Input
                label="Departure Date *"
                type="date"
                value={formData.departure_date}
                onChange={(e) => handleInputChange('departure_date', e.target.value)}
                error={errors.departure_date}
              />

              <Input
                label="Return Date"
                type="date"
                value={formData.return_date}
                onChange={(e) => handleInputChange('return_date', e.target.value)}
                error={errors.return_date}
                min={formData.departure_date || new Date().toISOString().split('T')[0]}
              />

              <Input
                label="Adults *"
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => handleInputChange('adults', e.target.value)}
                error={errors.adults}
              />

              <Input
                label="Children"
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => handleInputChange('children', e.target.value)}
              />

              <Input
                label="Infants"
                type="number"
                min="0"
                value={formData.infants}
                onChange={(e) => handleInputChange('infants', e.target.value)}
              />

              <Input
                label="Total Amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => handleInputChange('total_amount', e.target.value)}
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes..."
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
                Update Reservation
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

