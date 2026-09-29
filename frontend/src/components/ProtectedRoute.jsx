import { Navigate } from "react-router-dom"

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token = localStorage.getItem("accessToken")
  const storedUser = localStorage.getItem("user")

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  let user

  try {
    user = JSON.parse(storedUser)
  } catch {
    localStorage.clear()

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/billing"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute