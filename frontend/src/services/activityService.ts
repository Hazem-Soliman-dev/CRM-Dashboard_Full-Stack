import api from "./api";

export interface Activity {
  id: string;
  entity_type:
    | "customer"
    | "lead"
    | "reservation"
    | "support_ticket"
    | "user"
    | "attendance";
  entity_id: string;
  activity_type:
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "commented"
    | "message_sent";
  description: string;
  details?: any;
  performed_by_id: string;
  performed_by?: {
    id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
}

export interface ActivityFilters {
  entity_type?: string;
  entity_id?: string;
  activity_type?: string;
  performed_by_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

const activityService = {
  // Get all activities with filters
  getActivities: async (filters: ActivityFilters = {}): Promise<Activity[]> => {
    const response = await api.get("/activities", { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const data = response.data?.data || [];
    return Array.isArray(data) ? data : [];
  },

  // Get all activities for a specific customer
  getActivitiesForCustomer: async (customerId: string, params = {}) => {
    const response = await api.get("/activities", {
      params: {
        entity_type: "customer",
        entity_id: customerId,
        ...params,
      },
    });
    // Backend returns { success: true, data: [...] }
    const data = response.data?.data || [];
    return Array.isArray(data) ? data : [];
  },

  // Log a new activity for a customer
  logActivity: async (customerId: string, activityData: any) => {
    // Map activity type from modal to backend enum values
    const activityTypeMap: Record<
      string,
      | "created"
      | "updated"
      | "deleted"
      | "status_changed"
      | "assigned"
      | "commented"
      | "message_sent"
    > = {
      call: "commented",
      email: "message_sent",
      meeting: "updated",
      note: "commented",
    };

    const mappedActivityType =
      activityTypeMap[activityData.type] || "commented";

    // Use the main activities endpoint with entity info
    const response = await api.post("/activities", {
      entity_type: "customer",
      entity_id: customerId.toString(),
      activity_type: mappedActivityType,
      description:
        activityData.subject || activityData.description || "Activity logged",
      details: {
        type: activityData.type,
        description: activityData.description,
        outcome: activityData.outcome,
        followUpRequired: activityData.followUpRequired,
        followUpDate: activityData.followUpDate,
      },
    });
    return response.data.data;
  },

  // Get a single activity by ID
  getActivityById: async (id: string) => {
    const response = await api.get(`/activities/${id}`);
    return response.data.data;
  },

  // Update an activity
  updateActivity: async (id: string, activityData: any) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data.data;
  },

  // Delete an activity
  deleteActivity: async (id: string) => {
    await api.delete(`/activities/${id}`);
  },
};

export default activityService;
