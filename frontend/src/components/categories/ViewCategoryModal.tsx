import React, { useState, useEffect } from 'react';
import { X, Package, FileText, Layers, TrendingUp, Calendar } from 'lucide-react';
import { Category } from '../../services/categoryService';
import categoryService from '../../services/categoryService';
import { formatDate } from '../../utils/format';

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  existingCategories?: Category[];
}

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  category,
  existingCategories = []
}) => {
  const [stats, setStats] = useState<{
    totalItems: number;
    activeItems: number;
    totalValue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Category[]>([]);

  useEffect(() => {
    if (category && isOpen) {
      loadCategoryData();
    }
  }, [category, isOpen]);

  const loadCategoryData = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      // Load category statistics
      const categoryStats = await categoryService.getCategoryStats(category.id);
      setStats(categoryStats);

      // Find children categories
      const categoryChildren = existingCategories.filter(
        cat => cat.parent_id === category.id
      );
      setChildren(categoryChildren);
    } catch (error) {
      console.error('Error loading category data:', error);
      setStats({ totalItems: 0, activeItems: 0, totalValue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId?: string): string => {
    if (!parentId) return 'None';
    const parent = existingCategories.find(c => c.id === parentId);
    return parent?.name || 'Unknown';
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Category Details - {category.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Category Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Category Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Layers className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Parent Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getParentName(category.parent_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(category.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(category.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {category.description && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{category.description}</p>
                  </div>
                )}

                {/* Subcategories */}
                {children.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Subcategories ({children.length})
                    </h3>
                    <div className="space-y-2">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{child.name}</p>
                          {child.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {child.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Statistics */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Statistics
                  </h3>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                  ) : stats ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {stats.totalItems}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Active Items</span>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {stats.activeItems}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          ${stats.totalValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subcategories</span>
                        </div>
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {children.length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No statistics available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

