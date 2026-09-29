import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Suppliers() {
  const navigate = useNavigate()

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  })

  const getToken = () => {
    return localStorage.getItem("accessToken")
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")

    navigate("/login", {
      replace: true,
    })
  }

  const fetchSuppliers = async () => {
    const token = getToken()

    if (!token) {
      logout()
      return
    }

    try {
      const response = await fetch(
        "https://pos-billing-system-ldhr.onrender.com/api/suppliers/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        logout()
        return
      }

      if (response.status === 403) {
        alert("Admin access is required.")

        navigate("/admin", {
          replace: true,
        })

        return
      }

      if (!response.ok) {
        throw new Error(
          "Unable to fetch suppliers."
        )
      }

      const data = await response.json()

      setSuppliers(data)
    } catch (error) {
      console.error(
        "Supplier fetch error:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    })

    setEditingSupplier(null)
    setShowForm(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      alert("Supplier name is required.")
      return
    }

    if (!formData.phone.trim()) {
      alert("Phone number is required.")
      return
    }

    const token = getToken()

    if (!token) {
      logout()
      return
    }

    const payload = {
      name: formData.name.trim(),
      contact_person:
        formData.contact_person.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
    }

    let url =
      "https://pos-billing-system-ldhr.onrender.com/api/suppliers/"

    let method = "POST"

    if (editingSupplier) {
      url =
        `https://pos-billing-system-ldhr.onrender.com/api/suppliers/${editingSupplier.id}/`

      method = "PUT"
    }

    setSaving(true)

    try {
      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
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
        return
      }

      const data =
        response.status !== 204
          ? await response.json()
          : {}

      if (!response.ok) {
        const messages = []

        Object.entries(data).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
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
            "Unable to save supplier."
        )

        return
      }

      alert(
        editingSupplier
          ? "Supplier updated successfully."
          : "Supplier created successfully."
      )

      resetForm()
      fetchSuppliers()
    } catch (error) {
      console.error(
        "Supplier save error:",
        error
      )

      alert(
        "Unable to save supplier."
      )
    } finally {
      setSaving(false)
    }
  }

  const editSupplier = (supplier) => {
    setEditingSupplier(supplier)

    setFormData({
      name: supplier.name || "",
      contact_person:
        supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    })

    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const deleteSupplier = async (
    supplier
  ) => {
    const confirmed =
      window.confirm(
        `Delete supplier "${supplier.name}"?`
      )

    if (!confirmed) {
      return
    }

    const token = getToken()

    if (!token) {
      logout()
      return
    }

    try {
      const response = await fetch(
        `https://pos-billing-system-ldhr.onrender.com/api/suppliers/${supplier.id}/`,
        {
          method: "DELETE",

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
        return
      }

      if (!response.ok) {
        alert(
          "Unable to delete supplier."
        )
        return
      }

      alert(
        "Supplier deleted successfully."
      )

      fetchSuppliers()
    } catch (error) {
      console.error(
        "Supplier delete error:",
        error
      )

      alert(
        "Unable to delete supplier."
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Supplier Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage product suppliers
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
              : "+ Add Supplier"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingSupplier
                ? "Edit Supplier"
                : "Add Supplier"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block font-medium mb-2">
                    Supplier Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Contact Person
                  </label>

                  <input
                    type="text"
                    name="contact_person"
                    value={
                      formData.contact_person
                    }
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border rounded-lg p-3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="border px-6 py-3 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <p className="text-gray-500">
              No suppliers found.
            </p>
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-4 text-left">
                      Supplier
                    </th>

                    <th className="p-4 text-left">
                      Contact Person
                    </th>

                    <th className="p-4 text-left">
                      Phone
                    </th>

                    <th className="p-4 text-left">
                      Email
                    </th>

                    <th className="p-4 text-left">
                      Address
                    </th>

                    <th className="p-4 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4 font-semibold">
                          {supplier.name}
                        </td>

                        <td className="p-4">
                          {supplier.contact_person ||
                            "-"}
                        </td>

                        <td className="p-4">
                          {supplier.phone}
                        </td>

                        <td className="p-4">
                          {supplier.email ||
                            "-"}
                        </td>

                        <td className="p-4">
                          {supplier.address ||
                            "-"}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                editSupplier(
                                  supplier
                                )
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteSupplier(
                                  supplier
                                )
                              }
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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

export default Suppliers