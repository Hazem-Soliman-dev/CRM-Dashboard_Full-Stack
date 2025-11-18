// Data cleaning utilities for the Travel CRM system

export class DataCleaner {
  // Clear all demo data (localStorage)
  static clearDemoData() {
    console.log("Clearing demo data...");

    const keysToKeep = ["demoUser", "theme"];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
        console.log(`Removed demo data: ${key}`);
      }
    });

    console.log("Demo data cleared successfully");
    return true;
  }

  // Clear all localStorage data
  static clearAllLocalData() {
    console.log("Clearing all local data...");

    localStorage.clear();
    sessionStorage.clear();

    console.log("All local data cleared");
    return true;
  }

  // Clear specific data types
  static clearSpecificData(dataTypes: string[]) {
    console.log(`Clearing specific data types: ${dataTypes.join(", ")}`);

    dataTypes.forEach((type) => {
      localStorage.removeItem(type);
      console.log(`Cleared: ${type}`);
    });

    console.log("Specific data cleared");
    return true;
  }

  // Clear database data (if connected)
  static async clearDatabaseData() {
    // Frontend doesn't connect to database directly - all operations go through API
    console.log("Database operations must be performed through the API");
    return this.clearDemoData();
  }

  // Complete system reset
  static async completeReset() {
    console.log("Performing complete system reset...");

    try {
      // Clear local data
      this.clearAllLocalData();

      // Clear database data if connected (through API)
      await this.clearDatabaseData();

      console.log("Complete system reset successful");
      return true;
    } catch (error) {
      console.error("Error during complete reset:", error);
      return false;
    }
  }

  // Clear data with confirmation
  static async clearWithConfirmation(
    message: string = "Are you sure you want to clear all data?"
  ) {
    if (window.confirm(message)) {
      return await this.completeReset();
    }
    return false;
  }

  // Clear data by user role
  static async clearDataByRole(userRole: string) {
    console.log(`Clearing data for role: ${userRole}`);

    if (userRole === "admin") {
      // Admin can clear all data
      return await this.completeReset();
    } else {
      // Other roles can only clear their own data
      const userSpecificKeys = [
        "user_preferences",
        "user_settings",
        "user_cache",
      ];

      return this.clearSpecificData(userSpecificKeys);
    }
  }

  // Clear old data (older than specified days)
  static clearOldData(daysOld: number = 30) {
    console.log(`Clearing data older than ${daysOld} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // This would need to be implemented based on your data structure
    // For now, just clear all demo data
    return this.clearDemoData();
  }

  // Export data before clearing
  static exportDataBeforeClear() {
    console.log("Exporting data before clearing...");

    const dataToExport = {
      leads: localStorage.getItem("leads"),
      customers: localStorage.getItem("customers"),
      reservations: localStorage.getItem("reservations"),
      payments: localStorage.getItem("payments"),
      support_tickets: localStorage.getItem("support_tickets"),
      attendance: localStorage.getItem("attendance"),
      activities: localStorage.getItem("activities"),
      tasks: localStorage.getItem("tasks"),
      notes: localStorage.getItem("notes"),
      categories: localStorage.getItem("categories"),
      suppliers: localStorage.getItem("suppliers"),
      items: localStorage.getItem("items"),
      users: localStorage.getItem("users"),
      exportDate: new Date().toISOString(),
    };

    // Create and download export file
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `travel_crm_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Data exported successfully");
    return true;
  }

  // Get data statistics
  static getDataStatistics() {
    const stats = {
      localStorage: {
        totalKeys: Object.keys(localStorage).length,
        totalSize: JSON.stringify(localStorage).length,
      },
      sessionStorage: {
        totalKeys: Object.keys(sessionStorage).length,
        totalSize: JSON.stringify(sessionStorage).length,
      },
      dataTypes: {
        leads: localStorage.getItem("leads")
          ? JSON.parse(localStorage.getItem("leads") || "[]").length
          : 0,
        customers: localStorage.getItem("customers")
          ? JSON.parse(localStorage.getItem("customers") || "[]").length
          : 0,
        reservations: localStorage.getItem("reservations")
          ? JSON.parse(localStorage.getItem("reservations") || "[]").length
          : 0,
        payments: localStorage.getItem("payments")
          ? JSON.parse(localStorage.getItem("payments") || "[]").length
          : 0,
        support_tickets: localStorage.getItem("support_tickets")
          ? JSON.parse(localStorage.getItem("support_tickets") || "[]").length
          : 0,
        attendance: localStorage.getItem("attendance")
          ? JSON.parse(localStorage.getItem("attendance") || "[]").length
          : 0,
        activities: localStorage.getItem("activities")
          ? JSON.parse(localStorage.getItem("activities") || "[]").length
          : 0,
        tasks: localStorage.getItem("tasks")
          ? JSON.parse(localStorage.getItem("tasks") || "[]").length
          : 0,
        notes: localStorage.getItem("notes")
          ? JSON.parse(localStorage.getItem("notes") || "[]").length
          : 0,
      },
    };

    console.log("Data Statistics:", stats);
    return stats;
  }
}

// Export for use in components
export default DataCleaner;
