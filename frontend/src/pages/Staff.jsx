import {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"


function Staff() {
  const navigate = useNavigate()

  const [staff, setStaff] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showForm, setShowForm] =
    useState(false)

  const [
    editingStaff,
    setEditingStaff,
  ] = useState(null)

  const [saving, setSaving] =
    useState(false)

  const [formData, setFormData] =
    useState({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      is_active: true,
    })


  const getToken = () =>
    localStorage.getItem(
      "accessToken"
    )


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

    navigate(
      "/login",
      {
        replace: true,
      }
    )
  }


  const fetchStaff = async () => {

    const token = getToken()

    if (!token) {
      logout()
      return
    }

    try {

      const response = await fetch(
        "https://pos-billing-system-ldhr.onrender.com/api/staff/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        logout()
        return
      }

      if (response.status === 403) {
        alert(
          "Admin access is required."
        )

        navigate(
          "/",
          {
            replace: true,
          }
        )

        return
      }

      if (!response.ok) {
        throw new Error(
          "Unable to fetch staff."
        )
      }

      const data =
        await response.json()

      setStaff(data)

    } catch (error) {

      console.error(
        "Staff fetch error:",
        error
      )

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {
    fetchStaff()
  }, [])


  const resetForm = () => {

    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      is_active: true,
    })

    setEditingStaff(null)
    setShowForm(false)
  }


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData({
      ...formData,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    })
  }


  const handleSubmit =
    async (event) => {

      event.preventDefault()

      if (
        !formData.username.trim()
      ) {
        alert(
          "Username is required."
        )

        return
      }

      if (
        !editingStaff &&
        !formData.password
      ) {
        alert(
          "Password is required when creating staff."
        )

        return
      }

      if (
        formData.password &&
        formData.password.length < 6
      ) {
        alert(
          "Password must contain at least 6 characters."
        )

        return
      }

      const token = getToken()

      if (!token) {
        logout()
        return
      }

      const payload = {
        username:
          formData.username.trim(),

        first_name:
          formData.first_name.trim(),

        last_name:
          formData.last_name.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        is_active:
          formData.is_active,
      }

      if (formData.password) {
        payload.password =
          formData.password
      }

      let url =
        "https://pos-billing-system-ldhr.onrender.com/api/staff/"

      let method =
        "POST"

      if (editingStaff) {
        url =
          `https://pos-billing-system-ldhr.onrender.com/api/staff/${editingStaff.id}/`

        method =
          "PUT"
      }

      setSaving(true)

      try {

        const response =
          await fetch(
            url,
            {
              method,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          )

        if (
          response.status === 401
        ) {
          logout()
          return
        }

        if (
          response.status === 403
        ) {
          alert(
            "Admin access is required."
          )

          return
        }

        const data =
          response.status !== 204
            ? await response.json()
            : {}

        if (!response.ok) {

          const messages = []

          Object.entries(
            data
          ).forEach(
            ([field, value]) => {

              if (
                Array.isArray(
                  value
                )
              ) {
                messages.push(
                  `${field}: ${value.join(" ")}`
                )
              } else {
                messages.push(
                  `${field}: ${value}`
                )
              }
            }
          )

          alert(
            messages.join("\n") ||
            "Unable to save staff."
          )

          return
        }

        alert(
          editingStaff
            ? "Staff updated successfully."
            : "Staff created successfully."
        )

        resetForm()
        fetchStaff()

      } catch (error) {

        console.error(
          "Staff save error:",
          error
        )

        alert(
          "Unable to save staff."
        )

      } finally {

        setSaving(false)

      }
    }


  const editStaff = (
    member
  ) => {

    setEditingStaff(
      member
    )

    setFormData({
      username:
        member.username || "",

      first_name:
        member.first_name || "",

      last_name:
        member.last_name || "",

      email:
        member.email || "",

      password: "",

      phone:
        member.phone || "",

      address:
        member.address || "",

      is_active:
        member.is_active,
    })

    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }


  const deleteStaff =
    async (member) => {

      const confirmed =
        window.confirm(
          `Delete staff account "${member.username}"?`
        )

      if (!confirmed) {
        return
      }

      const token =
        getToken()

      if (!token) {
        logout()
        return
      }

      try {

        const response =
          await fetch(
            `https://pos-billing-system-ldhr.onrender.com/api/staff/${member.id}/`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status === 401
        ) {
          logout()
          return
        }

        if (
          response.status === 403
        ) {
          alert(
            "Admin access is required."
          )

          return
        }

        if (!response.ok) {
          alert(
            "Unable to delete staff."
          )

          return
        }

        alert(
          "Staff deleted successfully."
        )

        fetchStaff()

      } catch (error) {

        console.error(
          "Delete error:",
          error
        )

        alert(
          "Unable to delete staff."
        )
      }
    }


  const toggleStatus =
    async (member) => {

      const token =
        getToken()

      if (!token) {
        logout()
        return
      }

      try {

        const response =
          await fetch(
            `https://pos-billing-system-ldhr.onrender.com/api/staff/${member.id}/`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  is_active:
                    !member.is_active,
                }),
            }
          )

        if (
          response.status === 401
        ) {
          logout()
          return
        }

        if (!response.ok) {
          alert(
            "Unable to change staff status."
          )

          return
        }

        fetchStaff()

      } catch (error) {

        console.error(
          "Status update error:",
          error
        )

        alert(
          "Unable to change staff status."
        )
      }
    }


  return (
    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              Staff Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage billing staff accounts
            </p>

          </div>


          <button
            onClick={() => {

              if (showForm) {
                resetForm()
              } else {
                resetForm()
                setShowForm(true)
              }

            }}
            className="bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800"
          >
            {showForm
              ? "Cancel"
              : "+ Add Staff"}
          </button>

        </div>


        {showForm && (

          <div className="bg-white border rounded-xl p-6 mb-8">

            <h2 className="text-xl font-bold mb-6">

              {editingStaff
                ? "Edit Staff"
                : "Create Billing Staff"}

            </h2>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                <div>
                  <label className="block font-medium mb-2">
                    Username *
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={
                      formData.username
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                    required
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Password{" "}
                    {!editingStaff &&
                      "*"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder={
                      editingStaff
                        ? "Leave blank to keep current password"
                        : "Minimum 6 characters"
                    }
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={
                      formData.first_name
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={
                      formData.last_name
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div className="md:col-span-2">

                  <label className="block font-medium mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    className="w-full border rounded-lg p-3"
                  />

                </div>


                <div className="md:col-span-2">

                  <label className="flex items-center gap-3">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={
                        handleChange
                      }
                      className="h-5 w-5"
                    />

                    <span className="font-medium">
                      Active Staff Account
                    </span>

                  </label>

                </div>

              </div>


              <div className="flex gap-3 mt-6">

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingStaff
                      ? "Update Staff"
                      : "Create Staff"}
                </button>


                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="border px-6 py-3 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}


        {loading ? (

          <p>
            Loading staff...
          </p>

        ) : staff.length === 0 ? (

          <div className="bg-white border rounded-xl p-8 text-center">

            <p className="text-gray-500">
              No billing staff accounts found.
            </p>

          </div>

        ) : (

          <div className="bg-white border rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-900 text-white">

                  <tr>

                    <th className="p-4 text-left">
                      Username
                    </th>

                    <th className="p-4 text-left">
                      Name
                    </th>

                    <th className="p-4 text-left">
                      Email
                    </th>

                    <th className="p-4 text-left">
                      Phone
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-left">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {staff.map(
                    (member) => (

                      <tr
                        key={
                          member.id
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4 font-semibold">
                          {
                            member.username
                          }
                        </td>


                        <td className="p-4">

                          {[
                            member.first_name,
                            member.last_name,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(" ") ||
                            "-"}

                        </td>


                        <td className="p-4">
                          {
                            member.email ||
                            "-"
                          }
                        </td>


                        <td className="p-4">
                          {
                            member.phone ||
                            "-"
                          }
                        </td>


                        <td className="p-4">

                          <span
                            className={
                              member.is_active
                                ? "inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                                : "inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                            }
                          >
                            {member.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>


                        <td className="p-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              onClick={() =>
                                editStaff(
                                  member
                                )
                              }
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Edit
                            </button>


                            <button
                              onClick={() =>
                                toggleStatus(
                                  member
                                )
                              }
                              className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600"
                            >
                              {member.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>


                            <button
                              onClick={() =>
                                deleteStaff(
                                  member
                                )
                              }
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}


export default Staff