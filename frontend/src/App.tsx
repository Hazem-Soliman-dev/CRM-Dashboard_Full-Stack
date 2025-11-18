import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastContainer } from "./components/ui/ToastContainer";
import { LoginPage } from "./components/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import {
  DashboardPage as DashboardView,
  ActivitiesPage as CRMActivitiesPage,
  DealsPage as CRMDealsPage,
  LeadsPage as CRMLeadsPage,
  ListingsPage as CRMListingsPage,
  OwnersPage as CRMOwnersPage,
  PropertiesPage as CRMPropertiesPage,
  NotificationsPage as CRMNotificationsPage,
  SupportPage as CRMSupportPage,
  TasksPage as CRMTasksPage,
  SettingsPage as CRMSettingsView,
} from "./pages/crm";
import { CustomersPage } from "./components/customers/CustomersPage";
import { ProductServiceCategoriesPage } from "./components/categories/ProductServiceCategoriesPage";
import { FinancePage } from "./components/finance/FinancePage";
import { ReportsPage } from "./components/reports/ReportsPage";
import { UsersPage } from "./components/users/UsersPage";
import { AttendancePage } from "./components/attendance/AttendancePage";
import InvoicePrint from "./pages/print/InvoicePrint";
import ReportPrint from "./pages/print/ReportPrint";

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Public print routes for headless PDF rendering */}
            <Route path="/print/invoice/:id" element={<InvoicePrint />} />
            <Route path="/print/report/:id" element={<ReportPrint />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardView />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute requiredModule="dashboard">
                    <DashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations"
                element={
                  <ProtectedRoute requiredModule="operations">
                    <CRMActivitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="deals"
                element={
                  <ProtectedRoute requiredModule="deals">
                    <CRMDealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads"
                element={
                  <ProtectedRoute requiredModule="leads">
                    <CRMLeadsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reservations"
                element={
                  <ProtectedRoute requiredModule="reservations">
                    <CRMListingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owners"
                element={
                  <ProtectedRoute requiredModule="owners">
                    <CRMOwnersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="properties"
                element={
                  <ProtectedRoute requiredModule="properties">
                    <CRMPropertiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks"
                element={
                  <ProtectedRoute requiredModule="tasks">
                    <CRMTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute requiredModule="notifications">
                    <CRMNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customers"
                element={
                  <ProtectedRoute requiredModule="customers">
                    <CustomersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="product-categories"
                element={
                  <ProtectedRoute requiredModule="categories">
                    <ProductServiceCategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="sales"
                element={
                  <ProtectedRoute requiredModule="sales">
                    <CRMDealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="accounting"
                element={
                  <ProtectedRoute requiredModule="accounting">
                    <FinancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredModule="reports">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="support"
                element={
                  <ProtectedRoute requiredModule="support">
                    <CRMSupportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredModule="settings">
                    <CRMSettingsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredModule="users">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="attendance"
                element={
                  <ProtectedRoute requiredModule="attendance">
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <ToastContainer />
        </Router>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
