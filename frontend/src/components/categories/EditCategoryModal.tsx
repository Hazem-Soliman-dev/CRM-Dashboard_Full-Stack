import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Category } from '../../services/categoryService';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => Promise<void>;
  category: Category | null;
  existingCategories?: Category[];
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  category,
  existingCategories = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
      setErrors({});
    }
  }, [category, isOpen]);

  // Helper function to check for circular parent references
  const wouldCreateCircularReference = (categoryId: string, newParentId: string): boolean => {
    if (!newParentId || newParentId === categoryId) {
      return false;
    }
    
    // Check if the new parent is a descendant of the current category
    const checkDescendants = (parentId: string, targetId: string): boolean => {
      if (parentId === targetId) {
        return true;
      }
      
      const parentCategory = existingCategories.find(c => c.id === parentId);
      if (!parentCategory || !parentCategory.parent_id) {
        return false;
      }
      
      return checkDescendants(parentCategory.parent_id, targetId);
    };
    
    return checkDescendants(newParentId, categoryId);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.parent_id && wouldCreateCircularReference(category!.id, formData.parent_id)) {
      newErrors.parent_id = 'Cannot set parent: this would create a circular reference';
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
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent_id: formData.parent_id || undefined
      };

      await onSave(categoryData);
      
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
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

  // Filter out the current category and its descendants from parent options
  const getAvailableParents = (): Category[] => {
    if (!category) return existingCategories;
    
    const excludeIds = new Set<string>([category.id]);
    
    // Recursively find all descendants
    const findDescendants = (parentId: string) => {
      existingCategories.forEach(cat => {
        if (cat.parent_id === parentId && !excludeIds.has(cat.id)) {
          excludeIds.add(cat.id);
          findDescendants(cat.id);
        }
      });
    };
    findDescendants(category.id);
    
    return existingCategories.filter(cat => !excludeIds.has(cat.id));
  };

  if (!isOpen || !category) return null;

  const availableParents = getAvailableParents();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Category - {category.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <Input
                label="Category Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter category name"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description (optional)"
                />
              </div>

              {availableParents.length > 0 && (
                <Select
                  label="Parent Category (optional)"
                  value={formData.parent_id}
                  onChange={(e) => handleInputChange('parent_id', e.target.value)}
                  error={errors.parent_id}
                >
                  <option value="">None (Top-level category)</option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}

              {category.parent && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Current parent: <span className="font-medium">{category.parent.name}</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

