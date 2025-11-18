import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { ImageIcon, MapPin, Home, Tag, Users, TrendingUp, Plus } from 'lucide-react';
import propertyService, { Property } from '../../services/propertyService';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ActionGuard } from '../auth/ActionGuard';
import { AddPropertyModal } from './AddPropertyModal';
import { AvailabilityModal } from './AvailabilityModal';
import { ManageListingModal } from './ManageListingModal';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../ui/Pagination';

const statusTone: Record<Property['status'], string> = {
  Available: 'text-emerald-600 dark:text-emerald-400',
  Reserved: 'text-blue-600 dark:text-blue-400',
  Sold: 'text-purple-600 dark:text-purple-400',
  'Under Maintenance': 'text-red-500 dark:text-red-400'
};

export const PropertiesPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Property['status']>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | Property['type']>('All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isManageListingModalOpen, setIsManageListingModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { error: showError, success: showSuccess } = useToastContext();
  const [totalProperties, setTotalProperties] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage
  } = usePagination({ perPage: 10, total: totalProperties });

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperties();
      setProperties(data);
    } catch (error: any) {
      console.error('Failed to load properties', error);
      showError('Failed to load properties', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleCreateProperty = async (propertyData: any) => {
    if (!canPerformAction('properties', 'create')) {
      showError('Access Denied', 'You do not have permission to create properties.');
      return;
    }

    try {
      await propertyService.createProperty({
        name: propertyData.name,
        location: propertyData.location,
        type: propertyData.type,
        status: propertyData.status || 'Available',
        nightlyRate: propertyData.nightlyRate || 0,
        capacity: propertyData.capacity || 0,
        occupancy: propertyData.occupancy || 0,
        description: propertyData.description,
        owner: propertyData.owner
      });
      await loadProperties();
      showSuccess('Property Created', 'New property has been created successfully.');
    } catch (error: any) {
      console.error('Error creating property:', error);
      showError('Failed to create property', error.response?.data?.message || error.message);
    }
  };

  const filteredInventory = useMemo(() => {
    const result = properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
      const matchesType = typeFilter === 'All' || property.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    return result;
  }, [properties, search, statusFilter, typeFilter]);

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, typeFilter, resetPage]);

  useEffect(() => {
    setTotalProperties(filteredInventory.length);
  }, [filteredInventory.length]);

  const visibleProperties =
    filteredInventory.length === totalProperties
      ? filteredInventory.slice(offset, offset + perPage)
      : filteredInventory;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor availability, pricing, and occupancy across your managed assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search property or destination..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as 'All' | Property['type'])}
          >
            <option value="All">All types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'All' | Property['status'])
            }
          >
            <option value="All">All statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </Select>
          <ActionGuard module="properties" action="create">
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </ActionGuard>
        </div>
      </div>

      {loading && (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
            Loading properties...
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visibleProperties.map((property) => (
          <Card key={property.id} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {property.name}
                </CardTitle>
                <span className={`text-sm font-medium ${statusTone[property.status]}`}>
                  {property.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Property ID {property.propertyId} • Managed by {property.owner?.companyName || 'Unassigned'}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-500" />
                  <span>{property.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  <span>${property.nightlyRate.toLocaleString()}/night</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Capacity {property.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>{property.occupancy}% occupancy</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-gray-300 p-3 dark:border-gray-700">
                <span className="flex items-center gap-2 text-xs font-medium uppercase text-gray-400">
                  <ImageIcon className="h-4 w-4" />
                  Media
                </span>
                <Button size="sm" variant="outline" disabled>
                  Upload
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Gallery
                </Button>
              </div>

              <div className="flex justify-start gap-2 pt-2">
                <ActionGuard module="properties" action="update">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsAvailabilityModalOpen(true);
                    }}
                  >
                    Availability
                  </Button>
                </ActionGuard>
                <ActionGuard module="properties" action="update">
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsManageListingModalOpen(true);
                    }}
                  >
                    Manage Listing
                  </Button>
                </ActionGuard>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredInventory.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              No properties match your filters.
            </CardContent>
          </Card>
        )}
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        perPage={perPage}
        total={totalProperties}
        onPageChange={(p) => setPage(p)}
        compact
      />

      {/* Modals */}
      <ActionGuard module="properties" action="create">
        <AddPropertyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateProperty}
        />
      </ActionGuard>

      <ActionGuard module="properties" action="update">
        <AvailabilityModal
          isOpen={isAvailabilityModalOpen}
          onClose={() => {
            setIsAvailabilityModalOpen(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onUpdate={loadProperties}
        />
      </ActionGuard>

      <ActionGuard module="properties" action="update">
        <ManageListingModal
          isOpen={isManageListingModalOpen}
          onClose={() => {
            setIsManageListingModalOpen(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onUpdate={loadProperties}
        />
      </ActionGuard>
    </div>
  );
};

