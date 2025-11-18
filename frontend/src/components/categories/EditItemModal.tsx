import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Category } from '../../services/categoryService';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => Promise<void>;
  item: any;
  suppliers: any[];
  categories?: Category[];
  onAddSupplier: () => void;
}

const statuses = ['Active', 'Inactive', 'Discontinued'];

export const EditItemModal: React.FC<EditItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  item,
  suppliers,
  categories = [],
  onAddSupplier 
}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    stock_quantity: '',
    min_stock_level: '',
    supplier_id: '',
    status: 'Active',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        category_id: item.category_id || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        cost: item.cost?.toString() || '',
        stock_quantity: item.stock_quantity?.toString() || '',
        min_stock_level: item.min_stock_level?.toString() || '',
        supplier_id: item.supplier_id || '',
        status: item.status || 'Active',
        notes: item.notes || ''
      });
    }
  }, [item, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
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
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category_id: formData.category_id || undefined,
        supplier_id: formData.supplier_id || undefined,
        price: Number(formData.price),
        cost: formData.cost ? Number(formData.cost) : undefined,
        stock_quantity: formData.stock_quantity ? Number(formData.stock_quantity) : undefined,
        min_stock_level: formData.min_stock_level ? Number(formData.min_stock_level) : undefined,
        status: formData.status as 'Active' | 'Inactive' | 'Discontinued'
      };

      await onSave({ ...item, ...itemData });
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
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

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category_id: categoryId
    }));
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Item - {item.name}
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
                label="Category *"
                value={formData.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                error={errors.category_id}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>

              <Input
                label="Item Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter item name"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter item description"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
                )}
              </div>

              <Input
                label="Price *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                placeholder="Enter price"
              />

              <Input
                label="Cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="Enter cost (optional)"
              />

              <Input
                label="Stock Quantity"
                type="number"
                step="1"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                placeholder="Enter stock quantity"
              />

              <Input
                label="Min Stock Level"
                type="number"
                step="1"
                value={formData.min_stock_level}
                onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                placeholder="Enter minimum stock level"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier *
                </label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.supplier_id}
                    onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                    error={errors.supplier_id}
                    className="flex-1"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onAddSupplier}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.supplier_id && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.supplier_id}</p>
                )}
              </div>

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
                placeholder="Add any additional notes about this item..."
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
                Update Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};