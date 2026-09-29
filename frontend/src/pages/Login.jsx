import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!username.trim() || !password) {
      setError("Please enter username and password.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Unable to login.")
        setLoading(false)
        return
      }

      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      if (data.user.role === "admin") {
        navigate("/admin", { replace: true })
      } else {
        navigate("/billing", { replace: true })
      }
    } catch (error) {
      console.error(error)
      setError(
        "Unable to connect to the server. Make sure Django is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            POS Billing
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to continue
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block font-medium mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              className="w-full border rounded-lg p-3"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full border rounded-lg p-3"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg p-3 font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login