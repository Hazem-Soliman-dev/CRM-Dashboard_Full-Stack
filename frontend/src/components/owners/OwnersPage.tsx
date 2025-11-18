import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import {
  Users,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Plus,
  Edit,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import ownerService, { Owner } from "../../services/ownerService";
import { useToastContext } from "../../contexts/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ActionGuard } from "../auth/ActionGuard";
import { AddOwnerModal } from "./AddOwnerModal";
import { EditOwnerModal } from "./EditOwnerModal";
import { AssignManagerModal } from "./AssignManagerModal";
import { InternalChatModal } from "../finance/InternalChatModal";
import { CreateTicketModal } from "../support/CreateTicketModal";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../ui/Pagination";

const statusStyles = {
  Active: "text-emerald-600 dark:text-emerald-400",
  Onboarding: "text-blue-600 dark:text-blue-400",
  Dormant: "text-gray-500 dark:text-gray-400",
};

export const OwnersPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Owner["status"]>(
    "All"
  );
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] =
    useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  // Contact modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const { error: showError, success: showSuccess } = useToastContext();
  const [totalOwners, setTotalOwners] = useState(0);
  const {
    page,
    perPage,
    offset,
    pageCount,
    setPage,
    reset: resetPage,
  } = usePagination({ perPage: 10, total: totalOwners });

  const loadOwners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownerService.getOwners();
      setOwners(data);
    } catch (error: any) {
      console.error("Failed to load owners", error);
      showError(
        "Failed to load owners",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const handleCreateOwner = async (ownerData: any) => {
    if (!canPerformAction("owners", "create")) {
      showError(
        "Access Denied",
        "You do not have permission to create owners."
      );
      return;
    }

    try {
      await ownerService.createOwner({
        companyName: ownerData.companyName,
        primaryContact: ownerData.primaryContact,
        email: ownerData.email,
        phone: ownerData.phone,
        status: ownerData.status || "Active",
        portfolioSize: ownerData.portfolioSize || 0,
        locations: ownerData.locations || [],
        notes: ownerData.notes,
      });
      await loadOwners();
      showSuccess("Owner Created", "New owner has been created successfully.");
    } catch (error: any) {
      console.error("Error creating owner:", error);
      showError(
        "Failed to create owner",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleUpdateOwner = async (ownerId: number, ownerData: any) => {
    if (!canPerformAction("owners", "update")) {
      showError(
        "Access Denied",
        "You do not have permission to update owners."
      );
      return;
    }

    try {
      await ownerService.updateOwner(ownerId, ownerData);
      await loadOwners();
      showSuccess("Owner Updated", "Owner has been updated successfully.");
    } catch (error: any) {
      console.error("Error updating owner:", error);
      showError(
        "Failed to update owner",
        error.response?.data?.message || error.message
      );
    }
  };

  const openContactChat = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsChatOpen(true);
  };
  const openContactTicket = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsTicketOpen(true);
  };
  const openContactEmail = (owner: Owner) => {
    const email = owner.email || "";
    const subject = encodeURIComponent("Regarding your portfolio");
    const body = encodeURIComponent(`Hello ${owner.companyName},\n\n`);
    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      showError("No email", "Selected owner has no email address.");
    }
  };

  const filteredOwners = useMemo(() => {
    const result = owners.filter((owner) => {
      const matchesSearch =
        owner.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (owner.primaryContact || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || owner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return result;
  }, [owners, search, statusFilter]);

  // Reset page when filters/search change
  useEffect(() => {
    resetPage();
  }, [search, statusFilter, resetPage]);

  useEffect(() => {
    setTotalOwners(filteredOwners.length);
  }, [filteredOwners.length]);

  const visibleOwners =
    filteredOwners.length === totalOwners
      ? filteredOwners.slice(offset, offset + perPage)
      : filteredOwners;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Property Owners
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage institutional partners and ensure property portfolios stay
            active.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search owner or contact..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | Owner["status"])
            }
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Dormant">Dormant</option>
          </Select>
          <ActionGuard module="owners" action="create">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          </ActionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visibleOwners.map((owner) => (
          <Card
            key={owner.id}
            className="border border-gray-200 dark:border-gray-700"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {owner.companyName}
                </span>
                <span
                  className={`text-sm font-medium ${
                    statusStyles[owner.status]
                  }`}
                >
                  {owner.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>{owner.primaryContact || "No contact listed"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                <span>{owner.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-500" />
                <span>{owner.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-500" />
                <span>{owner.portfolioSize} managed properties</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>
                  {owner.locations.join(", ") || "No locations listed"}
                </span>
              </div>

              <div className="flex justify-start gap-2 pt-3">
                <ActionGuard module="owners" action="update">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOwner(owner);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </ActionGuard>
                <ActionGuard module="owners" action="update">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedOwner(owner);
                      setIsAssignManagerModalOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Assign Manager
                  </Button>
                </ActionGuard>
                {/* Contact actions: chat, ticket, email */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => openContactChat(owner)}
                  title="Chat"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-500 hover:text-green-600"
                  onClick={() => openContactTicket(owner)}
                  title="Create Support Ticket"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Ticket
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => openContactEmail(owner)}
                  title="Send Email"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredOwners.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              No owners match your filters.
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="col-span-full border border-gray-200 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              Loading owners...
            </CardContent>
          </Card>
        )}
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        perPage={perPage}
        total={totalOwners}
        onPageChange={(p) => setPage(p)}
        compact
      />

      {/* Modals */}
      <ActionGuard module="owners" action="create">
        <AddOwnerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateOwner}
        />
      </ActionGuard>

      <ActionGuard module="owners" action="update">
        <EditOwnerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOwner(null);
          }}
          onSave={handleUpdateOwner}
          owner={selectedOwner}
        />
      </ActionGuard>

      <ActionGuard module="owners" action="update">
        <AssignManagerModal
          isOpen={isAssignManagerModalOpen}
          onClose={() => {
            setIsAssignManagerModalOpen(false);
            setSelectedOwner(null);
          }}
          owner={selectedOwner}
          onAssign={loadOwners}
        />
      </ActionGuard>

      {/* Contact Modals */}
      {isChatOpen && selectedOwner && (
        <InternalChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          booking={{
            id: selectedOwner.id,
            customer: selectedOwner.companyName,
            tripItem: "N/A",
            paymentStatus: "N/A",
            outstandingBalance: 0,
          }}
        />
      )}
      {isTicketOpen && selectedOwner && (
        <CreateTicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          onSave={async (ticketData) => {
            try {
              // Let user choose customer within modal; ensure minimal defaults if needed
              if (!ticketData.subject) {
                ticketData.subject = `Support request - ${selectedOwner.companyName}`;
              }
              await (
                await import("../../services/supportService")
              ).default.createTicket(ticketData);
              showSuccess("Ticket Created", "Support ticket has been created.");
            } catch (error: any) {
              console.error("Failed to create ticket", error);
              showError(
                "Failed to create ticket",
                error.response?.data?.message || error.message
              );
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};
