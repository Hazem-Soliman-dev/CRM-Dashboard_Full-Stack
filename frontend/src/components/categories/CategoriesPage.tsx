import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { formatDate } from "../../utils/format";

const mockCategories = [
  {
    id: "1",
    name: "Premium",
    description: "High-value customers",
    color: "#3B82F6",
    count: 145,
    createdAt: "2024-12-01",
  },
  {
    id: "2",
    name: "Standard",
    description: "Regular customers",
    color: "#10B981",
    count: 892,
    createdAt: "2024-12-01",
  },
  {
    id: "3",
    name: "Basic",
    description: "Entry-level customers",
    color: "#F59E0B",
    count: 567,
    createdAt: "2024-12-01",
  },
  {
    id: "4",
    name: "Enterprise",
    description: "Large business customers",
    color: "#8B5CF6",
    count: 23,
    createdAt: "2024-12-05",
  },
];

export const CategoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your data with custom categories
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Categories
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockCategories.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Items Categorized
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockCategories.reduce((sum, cat) => sum + cat.count, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Most Popular
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              Standard
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Recently Added
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCategories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Items
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(category.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form className="space-y-4">
          <Input
            label="Category Name"
            placeholder="Enter category name"
            defaultValue={editingCategory?.name || ""}
          />
          <Input
            label="Description"
            placeholder="Enter category description"
            defaultValue={editingCategory?.description || ""}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {[
                "#3B82F6",
                "#10B981",
                "#F59E0B",
                "#EF4444",
                "#8B5CF6",
                "#6B7280",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button>{editingCategory ? "Update" : "Create"} Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
