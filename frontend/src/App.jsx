import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import Sidebar from "@/components/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Products from "@/pages/Products"
import Staff from "@/pages/Staff"
import Suppliers from "@/pages/Suppliers"
import ProductReturns from "@/pages/ProductReturns"
import LedgerReports from "@/pages/LedgerReports"
import Billing from "@/pages/Billing"
import SalesHistory from "@/pages/SalesHistory"


// =====================================================
// NORMAL DESKTOP / RESPONSIVE PORTAL LAYOUT
// =====================================================

function PortalLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      <main
        className="
          min-w-0
          min-h-screen
          pt-16
          md:pt-0
          md:ml-64
        "
      >
        {children}
      </main>

    </div>
  )
}


// =====================================================
// MOBILE ADMIN LAYOUT
// Forces the mobile-style navigation even on desktop.
// =====================================================

function MobileAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar forceMobile />

      <main
        className="
          min-h-screen
          min-w-0
          pt-16
          max-w-[430px]
          mx-auto
          bg-white
          shadow-xl
        "
      >
        {children}
      </main>

    </div>
  )
}


// =====================================================
// HOME REDIRECT
// =====================================================

function HomeRedirect() {
  const token =
    localStorage.getItem(
      "accessToken"
    )

  const storedUser =
    localStorage.getItem(
      "user"
    )

  if (
    !token ||
    !storedUser
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  try {
    const user =
      JSON.parse(
        storedUser
      )

    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      )
    }

    if (user.role === "staff") {
      return (
        <Navigate
          to="/billing"
          replace
        />
      )
    }

  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    )

    localStorage.removeItem(
      "accessToken"
    )

    localStorage.removeItem(
      "refreshToken"
    )

    localStorage.removeItem(
      "user"
    )
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  )
}


// =====================================================
// APPLICATION
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ============================= */}
        {/* LOGIN                         */}
        {/* ============================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ============================= */}
        {/* HOME                          */}
        {/* ============================= */}

        <Route
          path="/"
          element={
            <HomeRedirect />
          }
        />


        {/* ============================= */}
        {/* NORMAL ADMIN PORTAL           */}
        {/* ============================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <Dashboard />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/products"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <Products />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <Staff />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/suppliers"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <Suppliers />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/returns"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <ProductReturns />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <SalesHistory />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/ledger"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <PortalLayout>
                <LedgerReports />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        {/* ========================================= */}
        {/* DEDICATED MOBILE ADMIN PORTAL             */}
        {/* ========================================= */}

        <Route
          path="/mobile-admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <Dashboard />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/products"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <Products />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/staff"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <Staff />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/suppliers"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <Suppliers />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/returns"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <ProductReturns />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/sales"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <SalesHistory />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/mobile-admin/ledger"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <MobileAdminLayout>
                <LedgerReports />
              </MobileAdminLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* STAFF BILLING PORTAL          */}
        {/* ============================= */}

        <Route
          path="/billing"
          element={
            <ProtectedRoute
              allowedRoles={[
                "staff",
              ]}
            >
              <PortalLayout>
                <Billing />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/billing/sales"
          element={
            <ProtectedRoute
              allowedRoles={[
                "staff",
              ]}
            >
              <PortalLayout>
                <SalesHistory />
              </PortalLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================= */}
        {/* UNKNOWN URL                   */}
        {/* ============================= */}

        <Route
          path="*"
          element={
            <HomeRedirect />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}


export default App