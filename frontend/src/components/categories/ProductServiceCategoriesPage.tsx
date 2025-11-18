import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Link,
  ChevronDown,
  ChevronUp,
  Package,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { usePermissions } from "../../hooks/usePermissions";
import { RoleGuard } from "../auth/RoleGuard";
import { ActionGuard } from "../auth/ActionGuard";
import { AddItemModal } from "./AddItemModal";
import { ViewItemModal } from "./ViewItemModal";
import { EditItemModal } from "./EditItemModal";
import { LinkedBookingsModal } from "./LinkedBookingsModal";
import { AddSupplierModal } from "./AddSupplierModal";
import { AddCategoryModal } from "./AddCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { ViewCategoryModal } from "./ViewCategoryModal";
import { useToastContext } from "../../contexts/ToastContext";
import itemService from "../../services/itemService";
import supplierService from "../../services/supplierService";
import categoryService from "../../services/categoryService";
import { Item } from "../../services/itemService";
import { Supplier } from "../../services/supplierService";
import { Category } from "../../services/categoryService";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

const CategoryItemsSection: React.FC<{
  category: string;
  items: any[];
  getStatusColor: (status: string) => string;
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onLinked: (item: any) => void;
  onDelete?: (item: any) => void;
}> = ({
  category,
  items,
  getStatusColor,
  onView,
  onEdit,
  onLinked,
  onDelete,
}) => {
  const [total, setTotal] = React.useState(0);
  const { page, perPage, offset, pageCount, setPage, reset } = usePagination({
    perPage: 8,
    total,
  });
  React.useEffect(() => {
    reset();
  }, [category, reset]);
  React.useEffect(() => {
    setTotal(items.length);
  }, [items.length]);
  const visible = items.slice(offset, offset + perPage);
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Item Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Linked
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {visible.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {item.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  ${item.price || 0}/
                  {item.priceUnit ? item.priceUnit.replace("per ", "") : "unit"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.supplierName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {item.linkedBookings} bookings
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <ActionGuard module="categories" action="update">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="Edit Item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </ActionGuard>
                  <RoleGuard module="categories" action="view" hideIfNoAccess>
                    <button
                      onClick={() => onLinked(item)}
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      title="Linked Bookings"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  </RoleGuard>
                  {onDelete && (
                    <ActionGuard module="categories" action="delete">
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </ActionGuard>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        page={page}
        pageCount={pageCount}
        perPage={perPage}
        total={total}
        onPageChange={(p) => setPage(p)}
        compact
      />
    </div>
  );
};

export const ProductServiceCategoriesPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const toast = useToastContext();
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkedBookingsModalOpen, setIsLinkedBookingsModalOpen] =
    useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isViewCategoryModalOpen, setIsViewCategoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");

  // Pagination state for items
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsLimit] = useState(10);
  const [itemsPagination, setItemsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Pagination state for categories
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesLimit] = useState(10);
  const [categoriesPagination, setCategoriesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load suppliers (no pagination needed)
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const suppliersData = await supplierService.getAllSuppliers();
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      } catch (error: any) {
        console.error("Error loading suppliers:", error);
        setSuppliers([]);
      }
    };
    loadSuppliers();
  }, []);

  // Load all categories for filtering (no pagination)
  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const result = await categoryService.getAllCategories({
          limit: 1000,
          page: 1,
        });
        setCategories(result.categories);
      } catch (error: any) {
        console.error("Error loading categories for filtering:", error);
      }
    };
    loadAllCategories();
  }, []);

  // Load items with pagination - reset to page 1 when filters change
  useEffect(() => {
    setItemsPage(1);
  }, [searchTerm, categoryFilter, statusFilter, supplierFilter]);

  useEffect(() => {
    if (categories.length > 0 || categoryFilter === "All Categories") {
      loadItems();
    }
  }, [
    itemsPage,
    searchTerm,
    categoryFilter,
    statusFilter,
    supplierFilter,
    categories.length,
  ]);

  // Load categories with pagination
  useEffect(() => {
    if (activeTab === "categories") {
      loadCategories();
    }
  }, [categoriesPage, activeTab]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: itemsPage,
        limit: itemsLimit,
      };

      // Apply filters
      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (categoryFilter !== "All Categories") {
        const category = categories.find((c) => c.name === categoryFilter);
        if (category) {
          filters.category_id = category.id;
        }
      }
      if (statusFilter !== "All Status") {
        filters.status = statusFilter;
      }
      if (supplierFilter !== "All Suppliers") {
        const supplier = suppliers.find((s) => s.name === supplierFilter);
        if (supplier) {
          filters.supplier_id = supplier.id;
        }
      }

      const result = await itemService.getAllItems(filters);
      setItems(result.items);
      setItemsPagination(result.pagination);
    } catch (error: any) {
      console.error("Error loading items:", error);
      toast.error("Error", error.userMessage || "Failed to load items");
      setItems([]);
      setItemsPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryService.getAllCategories({
        page: categoriesPage,
        limit: categoriesLimit,
      });
      setCategories(result.categories);
      setCategoriesPagination(result.pagination);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast.error("Error", error.userMessage || "Failed to load categories");
      setCategories([]);
      setCategoriesPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    // This is kept for backward compatibility but now delegates to specific loaders
    if (activeTab === "items") {
      await loadItems();
    } else {
      await loadCategories();
    }
  };

  // Helper to get category name by ID
  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Helper to get supplier name by ID
  const getSupplierName = (supplierId?: string): string => {
    if (!supplierId) return "No Supplier";
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Unknown Supplier";
  };

  // Transform items for display (add computed properties)
  // Ensure items is always an array before mapping
  const transformedItems = (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    categoryType: getCategoryName(item.category_id),
    categoryId: item.category_id || "uncategorized",
    supplierName: getSupplierName(item.supplier_id),
    linkedBookings: 0, // TODO: Calculate from reservations when endpoint available
    priceUnit: "per unit", // Add default priceUnit if missing
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Discontinued":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleAddItem = async (itemData: any) => {
    if (!canPerformAction("categories", "create")) {
      toast.error("Access Denied", "You do not have permission to add items.");
      return;
    }

    try {
      await itemService.createItem(itemData);
      toast.success("Success", "Item created successfully");
      setIsAddModalOpen(false);
      // Reload data from database to ensure consistency
      await loadItems();
    } catch (error: any) {
      console.error("Error creating item:", error);
      toast.error("Error", error.userMessage || "Failed to create item");
    }
  };

  const handleUpdateItem = async (updatedItem: any) => {
    if (!canPerformAction("categories", "update")) {
      toast.error(
        "Access Denied",
        "You do not have permission to update items."
      );
      return;
    }

    try {
      await itemService.updateItem(updatedItem.id, updatedItem);
      toast.success("Success", "Item updated successfully");
      setIsEditModalOpen(false);
      // Reload data from database to ensure consistency
      await loadItems();
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error("Error", error.userMessage || "Failed to update item");
    }
  };

  const handleAddSupplier = async (supplierData: any) => {
    if (!canPerformAction("suppliers", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to add suppliers."
      );
      return;
    }

    try {
      await supplierService.createSupplier(supplierData);
      toast.success("Success", "Supplier created successfully");
      setIsAddSupplierModalOpen(false);
      // Reload data from database to ensure consistency
      await loadData();
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      toast.error("Error", error.userMessage || "Failed to create supplier");
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    if (!canPerformAction("categories", "create")) {
      toast.error(
        "Access Denied",
        "You do not have permission to add categories."
      );
      return;
    }

    try {
      await categoryService.createCategory(categoryData);
      toast.success("Success", "Category created successfully");
      setIsAddCategoryModalOpen(false);
      // Reload data from database to ensure consistency
      await loadCategories();
      // Also reload all categories for filtering
      const result = await categoryService.getAllCategories({
        limit: 1000,
        page: 1,
      });
      setCategories(result.categories);
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error("Error", error.userMessage || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!canPerformAction("categories", "update") || !selectedCategory) {
      toast.error(
        "Access Denied",
        "You do not have permission to update categories."
      );
      return;
    }

    try {
      await categoryService.updateCategory(selectedCategory.id, categoryData);
      toast.success("Success", "Category updated successfully");
      setIsEditCategoryModalOpen(false);
      setSelectedCategory(null);
      // Reload data from database to ensure consistency
      await loadCategories();
      // Also reload all categories for filtering
      const result = await categoryService.getAllCategories({
        limit: 1000,
        page: 1,
      });
      setCategories(result.categories);
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error("Error", error.userMessage || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!canPerformAction("categories", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete categories."
      );
      return;
    }

    // Count items in this category and subcategories
    const itemsInCategory = transformedItems.filter(
      (item) => item.category_id === category.id
    );

    // Count subcategories
    const subcategories = categories.filter(
      (cat) => cat.parent_id === category.id
    );

    // Count items in subcategories
    const itemsInSubcategories = transformedItems.filter((item) =>
      subcategories.some((sub) => sub.id === item.category_id)
    );

    const totalItems = itemsInCategory.length + itemsInSubcategories.length;
    const totalSubcategories = subcategories.length;

    // Build confirmation message
    let confirmMessage = `Are you sure you want to delete "${category.name}"?\n\n`;

    if (totalItems > 0 || totalSubcategories > 0) {
      confirmMessage += `This will also delete:\n`;
      if (totalSubcategories > 0) {
        confirmMessage += `- ${totalSubcategories} subcategor${
          totalSubcategories === 1 ? "y" : "ies"
        }\n`;
      }
      if (totalItems > 0) {
        confirmMessage += `- ${totalItems} item${
          totalItems === 1 ? "" : "s"
        }\n`;
      }
      confirmMessage += `\n`;
    }

    confirmMessage += `This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await categoryService.deleteCategory(category.id);
      toast.success(
        "Success",
        "Category and all its items deleted successfully"
      );
      // Reload data from database to ensure consistency
      await loadCategories();
      // Also reload all categories for filtering
      const result = await categoryService.getAllCategories({
        limit: 1000,
        page: 1,
      });
      setCategories(result.categories);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error("Error", error.userMessage || "Failed to delete category");
    }
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsViewCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteItem = async (item: any) => {
    if (!canPerformAction("categories", "delete")) {
      toast.error(
        "Access Denied",
        "You do not have permission to delete items."
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await itemService.deleteItem(item.id);
      toast.success("Success", "Item deleted successfully");
      // Reload data from database to ensure consistency
      await loadItems();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Error", error.userMessage || "Failed to delete item");
    }
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleLinkedBookings = (item: any) => {
    setSelectedItem(item);
    setIsLinkedBookingsModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleQuickStatFilter = (filterType: string) => {
    switch (filterType) {
      case "active":
        setStatusFilter("Active");
        break;
      case "inactive":
        setStatusFilter("Inactive");
        break;
      case "total":
        setStatusFilter("All Status");
        break;
      default:
        setStatusFilter("All Status");
    }
  };

  const handleCategoryDistributionFilter = (categoryName: string) => {
    setCategoryFilter(categoryName);
  };

  // Filter items
  const filteredItems = transformedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" ||
      item.categoryType === categoryFilter;
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    const matchesSupplier =
      supplierFilter === "All Suppliers" ||
      item.supplierName === supplierFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  // Group items by category ID (to ensure unique keys) but display by category name
  const groupedItems = filteredItems.reduce((acc, item) => {
    // Use category ID as key to ensure uniqueness, but store category name for display
    const categoryKey = item.categoryId || "uncategorized";
    const categoryName = item.categoryType || "Uncategorized";

    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        name: categoryName,
        items: [],
      };
    }
    acc[categoryKey].items.push(item);
    return acc;
  }, {} as { [key: string]: { name: string; items: any[] } });

  // Get icon for category (default to Package)
  const getCategoryIcon = (_categoryName: string) => {
    // You can customize this based on category names if needed
    return Package;
  };

  // Calculate stats
  const totalItems = transformedItems.length;
  const activeItems = transformedItems.filter(
    (item) => item.status === "Active"
  ).length;
  const inactiveItems = transformedItems.filter(
    (item) => item.status === "Inactive"
  ).length;
  const discontinuedItems = transformedItems.filter(
    (item) => item.status === "Discontinued"
  ).length;

  // Calculate category distribution from actual data
  const categoryDistribution = categories
    .map((cat) => {
      const itemsInCategory = transformedItems.filter(
        (item) => item.category_id === cat.id
      );
      return {
        id: cat.id, // Add unique ID for React keys
        category: cat.name,
        count: itemsInCategory.length,
        percentage:
          totalItems > 0
            ? Math.round((itemsInCategory.length / totalItems) * 100)
            : 0,
      };
    })
    .filter((dist) => dist.count > 0)
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product & Service Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your travel products and services
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <ActionGuard module="categories" action="create">
            <Button
              onClick={() => setIsAddCategoryModalOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </ActionGuard>
          <ActionGuard module="categories" action="create">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </ActionGuard>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("items")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "items"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Items ({itemsPagination.total || 0})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Categories ({categoriesPagination.total || 0})
          </button>
        </nav>
      </div>

      {activeTab === "items" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option>All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Discontinued</option>
                  </Select>
                  <Select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                  >
                    <option>All Suppliers</option>
                    {(Array.isArray(suppliers) ? suppliers : []).map(
                      (supplier) => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      )
                    )}
                  </Select>
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grouped Items Table */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {Object.entries(groupedItems).map(
                    ([categoryKey, categoryData]) => {
                      const categoryName = categoryData.name;
                      const categoryItems = categoryData.items;
                      const IconComponent = getCategoryIcon(categoryName);
                      // Use categoryKey (ID) for expansion tracking to ensure uniqueness
                      const isExpanded =
                        expandedCategories.includes(categoryKey);

                      return (
                        <div
                          key={categoryKey}
                          className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(categoryKey)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {categoryName} Booking
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {categoryItems.length} items
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>

                          {/* Category Items */}
                          {isExpanded && (
                            <CategoryItemsSection
                              category={categoryName}
                              items={categoryItems}
                              getStatusColor={getStatusColor}
                              onView={handleViewItem}
                              onEdit={handleEditItem}
                              onLinked={handleLinkedBookings}
                              onDelete={handleDeleteItem}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
                {/* Pagination for Items */}
                {itemsPagination.totalPages > 1 && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                      page={itemsPagination.page}
                      pageCount={itemsPagination.totalPages}
                      perPage={itemsPagination.limit}
                      total={itemsPagination.total}
                      onPageChange={(page) => setItemsPage(page)}
                      loading={loading}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    onClick={() => handleQuickStatFilter("total")}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Items
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {totalItems}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickStatFilter("active")}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Active
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {activeItems}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickStatFilter("inactive")}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Inactive
                      </span>
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {inactiveItems}
                      </span>
                    </div>
                  </button>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Discontinued
                      </span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        {discontinuedItems}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryDistribution.map((item) => (
                    <button
                      key={item.id} // Use unique ID instead of category name
                      onClick={() =>
                        handleCategoryDistributionFilter(item.category)
                      }
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Categories Management Tab */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Parent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => {
                      const itemsInCategory = transformedItems.filter(
                        (item) => item.category_id === category.id
                      );
                      const parentCategory = categories.find(
                        (c) => c.id === category.parent_id
                      );
                      return (
                        <tr
                          key={category.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {category.description || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {parentCategory?.name || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {itemsInCategory.length}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewCategory(category)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <ActionGuard module="categories" action="update">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  title="Edit Category"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </ActionGuard>
                              <ActionGuard module="categories" action="delete">
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </ActionGuard>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {categories.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                        >
                          No categories found. Create your first category to get
                          started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination for Categories */}
              {categoriesPagination.totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4">
                  <Pagination
                    page={categoriesPagination.page}
                    pageCount={categoriesPagination.totalPages}
                    perPage={categoriesPagination.limit}
                    total={categoriesPagination.total}
                    onPageChange={(page) => setCategoriesPage(page)}
                    loading={loading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <ActionGuard module="categories" action="create">
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSave={handleAddCategory}
          existingCategories={categories}
        />
      </ActionGuard>
      <ActionGuard module="categories" action="create">
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddItem}
          suppliers={suppliers}
          categories={categories}
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        />
      </ActionGuard>

      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
      />

      <ActionGuard module="categories" action="update">
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateItem}
          item={selectedItem}
          suppliers={suppliers}
          categories={categories}
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        />
      </ActionGuard>

      <RoleGuard module="categories" action="view">
        <LinkedBookingsModal
          isOpen={isLinkedBookingsModalOpen}
          onClose={() => setIsLinkedBookingsModalOpen(false)}
          item={selectedItem}
        />
      </RoleGuard>

      <ActionGuard module="suppliers" action="create">
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSave={handleAddSupplier}
        />
      </ActionGuard>

      <ViewCategoryModal
        isOpen={isViewCategoryModalOpen}
        onClose={() => {
          setIsViewCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        existingCategories={categories}
      />

      <ActionGuard module="categories" action="update">
        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          onClose={() => {
            setIsEditCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleUpdateCategory}
          category={selectedCategory}
          existingCategories={categories}
        />
      </ActionGuard>
    </div>
  );
};
