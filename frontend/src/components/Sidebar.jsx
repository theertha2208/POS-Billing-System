import { useState } from "react"

import {
  NavLink,
  useNavigate,
} from "react-router-dom"


function Sidebar({
  forceMobile = false,
}) {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] =
    useState(false)


  // =====================================================
  // GET CURRENT USER
  // =====================================================

  let user = null

  try {
    const storedUser =
      localStorage.getItem("user")

    if (storedUser) {
      user =
        JSON.parse(storedUser)
    }

  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    )

    user = null
  }


  const role = user?.role


  // =====================================================
  // ADMIN PATHS
  // =====================================================

  const adminBase =
    forceMobile
      ? "/mobile-admin"
      : "/admin"


  // =====================================================
  // NAVIGATION STYLE
  // =====================================================

  const linkClass =
    ({ isActive }) =>
      `block rounded-lg px-4 py-3 transition-colors ${
        isActive
          ? "bg-slate-700 text-white"
          : "text-slate-200 hover:bg-slate-800 hover:text-white"
      }`


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "accessToken"
    )

    localStorage.removeItem(
      "refreshToken"
    )

    localStorage.removeItem(
      "user"
    )

    setMenuOpen(false)

    navigate(
      "/login",
      {
        replace: true,
      }
    )
  }


  // =====================================================
  // CLOSE MENU
  // =====================================================

  const closeMenu = () => {
    setMenuOpen(false)
  }


  // =====================================================
  // MENU CONTENT
  // =====================================================

  const MenuContent = () => (
    <>

      <div>

        <h1 className="text-2xl font-bold">
          POS Billing
        </h1>


        <p className="text-slate-400 text-sm mt-2 mb-10">

          {role === "admin"
            ? forceMobile
              ? "Mobile Admin Portal"
              : "Admin Portal"
            : "Billing Portal"}

        </p>


        <nav className="space-y-3">


          {/* =====================================
              ADMIN MENU
          ===================================== */}

          {role === "admin" && (
            <>

              <NavLink
                to={adminBase}
                end
                onClick={closeMenu}
                className={linkClass}
              >
                Dashboard
              </NavLink>


              <NavLink
                to={`${adminBase}/products`}
                onClick={closeMenu}
                className={linkClass}
              >
                Products
              </NavLink>


              <NavLink
                to={`${adminBase}/staff`}
                onClick={closeMenu}
                className={linkClass}
              >
                Staff
              </NavLink>


              <NavLink
                to={`${adminBase}/suppliers`}
                onClick={closeMenu}
                className={linkClass}
              >
                Suppliers
              </NavLink>


              <NavLink
                to={`${adminBase}/returns`}
                onClick={closeMenu}
                className={linkClass}
              >
                Product Returns
              </NavLink>


              <NavLink
                to={`${adminBase}/sales`}
                onClick={closeMenu}
                className={linkClass}
              >
                Transactions
              </NavLink>


              <NavLink
                to={`${adminBase}/ledger`}
                onClick={closeMenu}
                className={linkClass}
              >
                Ledger & Reports
              </NavLink>

            </>
          )}


          {/* =====================================
              STAFF MENU
          ===================================== */}

          {role === "staff" && (
            <>

              <NavLink
                to="/billing"
                end
                onClick={closeMenu}
                className={linkClass}
              >
                Billing
              </NavLink>


              <NavLink
                to="/billing/sales"
                onClick={closeMenu}
                className={linkClass}
              >
                Sales
              </NavLink>

            </>
          )}

        </nav>

      </div>


      {/* =========================================
          USER INFORMATION
      ========================================= */}

      <div className="mt-auto pt-8">

        {user && (

          <div className="border-t border-slate-700 pt-5">

            <p className="text-sm text-slate-400">
              Signed in as
            </p>


            <p className="font-semibold mt-1">

              {user.first_name ||
                user.username}

            </p>


            <p className="text-xs text-slate-400 mt-1 capitalize">
              {role}
            </p>


            <button
              type="button"
              onClick={logout}
              className="
                w-full
                mt-4
                border
                border-slate-600
                rounded-lg
                px-4
                py-3
                text-left
                hover:bg-slate-800
                transition-colors
              "
            >
              Logout
            </button>

          </div>

        )}

      </div>

    </>
  )


  // =====================================================
  // NORMAL MOBILE INTERFACE
  // Used when /admin or /billing is opened on a phone
  // =====================================================

  const NormalMobileInterface = () => (
    <>

      {/* MOBILE TOP BAR */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          h-16
          bg-slate-900
          text-white
          flex
          items-center
          justify-between
          px-5
          z-50
          shadow
        "
      >

        <div>

          <h1 className="font-bold text-lg">
            POS Billing
          </h1>


          <p className="text-xs text-slate-400">

            {role === "admin"
              ? "Admin Portal"
              : "Billing Portal"}

          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-lg
            hover:bg-slate-800
          "
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
        >

          {menuOpen ? (

            <span className="text-3xl leading-none">
              ×
            </span>

          ) : (

            <div className="space-y-1.5">

              <span className="block w-6 h-0.5 bg-white" />

              <span className="block w-6 h-0.5 bg-white" />

              <span className="block w-6 h-0.5 bg-white" />

            </div>

          )}

        </button>

      </header>


      {/* MOBILE BACKDROP */}

      {menuOpen && (

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="
            fixed
            inset-0
            bg-black/50
            z-40
          "
        />

      )}


      {/* MOBILE DRAWER */}

      {menuOpen && (

        <aside
          className="
            fixed
            top-0
            left-0
            h-screen
            w-72
            max-w-[85vw]
            bg-slate-900
            text-white
            p-6
            flex
            flex-col
            z-50
            shadow-2xl
          "
        >

          <div className="h-4" />

          <MenuContent />

        </aside>

      )}

    </>
  )


  // =====================================================
  // DEDICATED MOBILE ADMIN INTERFACE
  // Used only by /mobile-admin
  // =====================================================

  const ForcedMobileInterface = () => (
    <>

      {/* =========================================
          PHONE-WIDTH TOP BAR
      ========================================= */}

      <header
        className="
          fixed
          top-0
          left-1/2
          -translate-x-1/2
          w-full
          max-w-[430px]
          h-16
          bg-slate-900
          text-white
          flex
          items-center
          justify-between
          px-5
          z-50
          shadow
        "
      >

        <div>

          <h1 className="font-bold text-lg">
            POS Billing
          </h1>


          <p className="text-xs text-slate-400">
            Mobile Admin Portal
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-lg
            hover:bg-slate-800
          "
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
        >

          {menuOpen ? (

            <span className="text-3xl leading-none">
              ×
            </span>

          ) : (

            <div className="space-y-1.5">

              <span className="block w-6 h-0.5 bg-white" />

              <span className="block w-6 h-0.5 bg-white" />

              <span className="block w-6 h-0.5 bg-white" />

            </div>

          )}

        </button>

      </header>


      {/* =========================================
          PHONE-WIDTH BACKDROP
      ========================================= */}

      {menuOpen && (

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="
            fixed
            top-0
            bottom-0
            left-1/2
            -translate-x-1/2
            w-full
            max-w-[430px]
            bg-black/50
            z-40
          "
        />

      )}


      {/* =========================================
          PHONE-WIDTH DRAWER

          IMPORTANT:
          Drawer does not exist until ☰ is clicked.
      ========================================= */}

      {menuOpen && (

        <aside
          className="
            fixed
            top-0
            bottom-0

            w-72
            max-w-[85vw]

            bg-slate-900
            text-white

            p-6

            flex
            flex-col

            z-50

            shadow-2xl
          "
          style={{
            left:
              "max(calc(50% - 215px), 0px)",
          }}
        >

          <div className="h-4" />

          <MenuContent />

        </aside>

      )}

    </>
  )


  // =====================================================
  // FORCE MOBILE MODE
  // =====================================================

  if (forceMobile) {
    return (
      <ForcedMobileInterface />
    )
  }


  // =====================================================
  // NORMAL RESPONSIVE PORTAL
  // =====================================================

  return (
    <>

      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside
        className="
          hidden
          md:flex
          fixed
          left-0
          top-0
          w-64
          h-screen
          bg-slate-900
          text-white
          p-6
          flex-col
          z-40
        "
      >

        <MenuContent />

      </aside>


      {/* =========================================
          NORMAL MOBILE VERSION
      ========================================= */}

      <div className="md:hidden">

        <NormalMobileInterface />

      </div>

    </>
  )
}


export default Sidebar