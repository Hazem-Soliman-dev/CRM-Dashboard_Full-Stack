// Complete Data Cleaner for Travel CRM
// This utility will remove ALL data from the system

export class CompleteDataCleaner {
  // Clear all localStorage data
  static clearAllLocalStorage() {
    console.log('🧹 Clearing all localStorage...');
    localStorage.clear();
    console.log('✅ localStorage cleared');
    return true;
  }

  // Clear all sessionStorage data
  static clearAllSessionStorage() {
    console.log('🧹 Clearing all sessionStorage...');
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    return true;
  }

  // Clear all cookies
  static clearAllCookies() {
    console.log('🍪 Clearing all cookies...');
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('✅ Cookies cleared');
    return true;
  }

  // Clear all IndexedDB data
  static async clearAllIndexedDB() {
    console.log('🗄️ Clearing IndexedDB...');
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          indexedDB.deleteDatabase(db.name || '');
        }
      }
      console.log('✅ IndexedDB cleared');
      return true;
    } catch (error) {
      console.log('⚠️ IndexedDB not available');
      return false;
    }
  }

  // Clear all cache storage
  static async clearAllCacheStorage() {
    console.log('💾 Clearing cache storage...');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      console.log('✅ Cache storage cleared');
      return true;
    } catch (error) {
      console.log('⚠️ Cache storage not available');
      return false;
    }
  }

  // Clear all service workers
  static async clearAllServiceWorkers() {
    console.log('⚙️ Clearing service workers...');
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }
      console.log('✅ Service workers cleared');
      return true;
    } catch (error) {
      console.log('⚠️ Service workers not available');
      return false;
    }
  }

  // Clear all CRM data
  static clearAllCRMData() {
    console.log('🏢 Clearing all CRM data...');
    
    const crmDataTypes = [
      'leads', 'customers', 'reservations', 'payments', 
      'support_tickets', 'attendance', 'activities', 'tasks', 
      'notes', 'categories', 'suppliers', 'items', 'users',
      'sales_cases', 'reports', 'notifications', 'settings'
    ];
    
    crmDataTypes.forEach(type => {
      localStorage.removeItem(type);
      sessionStorage.removeItem(type);
    });
    
    console.log('✅ CRM data cleared');
    return true;
  }

  // Clear all user accounts
  static clearAllUserAccounts() {
    console.log('👥 Clearing all user accounts...');
    
    const userDataTypes = [
      'demoUser', 'userSession', 'userPreferences', 'userSettings',
      'userProfile', 'userPermissions', 'userRole', 'userAuth'
    ];
    
    userDataTypes.forEach(type => {
      localStorage.removeItem(type);
      sessionStorage.removeItem(type);
    });
    
    console.log('✅ User accounts cleared');
    return true;
  }

  // Clear all mock data
  static clearAllMockData() {
    console.log('🎭 Clearing all mock data...');
    
    const mockDataTypes = [
      'mockLeads', 'mockCustomers', 'mockReservations', 'mockPayments',
      'mockUsers', 'mockActivities', 'mockTasks', 'mockNotes',
      'mockCategories', 'mockSuppliers', 'mockItems', 'mockStats'
    ];
    
    mockDataTypes.forEach(type => {
      localStorage.removeItem(type);
      sessionStorage.removeItem(type);
    });
    
    console.log('✅ Mock data cleared');
    return true;
  }

  // Clear all statistics and analytics
  static clearAllStatistics() {
    console.log('📊 Clearing all statistics...');
    
    const statsTypes = [
      'revenueData', 'leadSourceData', 'customerStats', 'bookingStats',
      'paymentStats', 'attendanceStats', 'performanceStats', 'analyticsData'
    ];
    
    statsTypes.forEach(type => {
      localStorage.removeItem(type);
      sessionStorage.removeItem(type);
    });
    
    console.log('✅ Statistics cleared');
    return true;
  }

  // Clear all form data
  static clearAllFormData() {
    console.log('📝 Clearing all form data...');
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
        input.checked = false;
      } else {
        (input as HTMLInputElement).value = '';
      }
    });
    
    console.log('✅ Form data cleared');
    return true;
  }

  // Clear all application state
  static clearAllApplicationState() {
    console.log('🔄 Clearing application state...');
    
    // Clear global variables
    if ((window as any).appState) {
      (window as any).appState = {};
    }
    
    if ((window as any).cachedData) {
      (window as any).cachedData = {};
    }
    
    if ((window as any).userPreferences) {
      (window as any).userPreferences = {};
    }
    
    // Clear any other global state
    const globalStateKeys = [
      'appState', 'cachedData', 'userPreferences', 'systemSettings',
      'theme', 'language', 'filters', 'searchHistory'
    ];
    
    globalStateKeys.forEach(key => {
      if ((window as any)[key]) {
        (window as any)[key] = {};
      }
    });
    
    console.log('✅ Application state cleared');
    return true;
  }

  // Complete system cleanup
  static async completeSystemCleanup() {
    console.log('🚀 Starting complete system cleanup...');
    
    try {
      // Clear all storage
      this.clearAllLocalStorage();
      this.clearAllSessionStorage();
      this.clearAllCookies();
      
      // Clear all databases
      await this.clearAllIndexedDB();
      await this.clearAllCacheStorage();
      await this.clearAllServiceWorkers();
      
      // Clear all application data
      this.clearAllCRMData();
      this.clearAllUserAccounts();
      this.clearAllMockData();
      this.clearAllStatistics();
      this.clearAllFormData();
      this.clearAllApplicationState();
      
      console.log('✅ Complete system cleanup finished');
      return true;
      
    } catch (error) {
      console.error('❌ Error during system cleanup:', error);
      return false;
    }
  }

  // Complete cleanup with confirmation
  static async completeCleanupWithConfirmation() {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will delete ALL data from the system!\n\n' +
      'This includes:\n' +
      '- All user accounts\n' +
      '- All customer data\n' +
      '- All bookings and reservations\n' +
      '- All financial records\n' +
      '- All system settings\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure you want to continue?'
    );
    
    if (confirmed) {
      const finalConfirmed = window.confirm(
        '🚨 FINAL WARNING: This will permanently delete everything!\n\n' +
        'Last chance to cancel...\n\n' +
        'Are you 100% sure?'
      );
      
      if (finalConfirmed) {
        const success = await this.completeSystemCleanup();
        
        if (success) {
          alert('✅ System cleanup completed!\n\nAll data has been permanently deleted.\n\nThe page will now reload.');
          window.location.reload();
        } else {
          alert('❌ System cleanup failed. Please try again.');
        }
      }
    }
  }

  // Get system data statistics
  static getSystemDataStatistics() {
    const stats = {
      localStorage: {
        totalKeys: Object.keys(localStorage).length,
        totalSize: JSON.stringify(localStorage).length
      },
      sessionStorage: {
        totalKeys: Object.keys(sessionStorage).length,
        totalSize: JSON.stringify(sessionStorage).length
      },
      cookies: {
        totalCookies: document.cookie.split(';').length
      }
    };
    
    console.log('📊 System Data Statistics:', stats);
    return stats;
  }

  // Check if system is clean
  static isSystemClean() {
    const localStorageEmpty = Object.keys(localStorage).length === 0;
    const sessionStorageEmpty = Object.keys(sessionStorage).length === 0;
    const cookiesEmpty = document.cookie === '';
    
    const isClean = localStorageEmpty && sessionStorageEmpty && cookiesEmpty;
    
    console.log('🔍 System Clean Check:', {
      localStorageEmpty,
      sessionStorageEmpty,
      cookiesEmpty,
      isClean
    });
    
    return isClean;
  }
}

// Export for use in components
export default CompleteDataCleaner;
