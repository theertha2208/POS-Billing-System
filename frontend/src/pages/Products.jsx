import {
  useEffect,
  useState,
} from "react"

import { useNavigate } from "react-router-dom"


function Products() {
  const navigate = useNavigate()

  const [products, setProducts] =
    useState([])

  const [suppliers, setSuppliers] =
    useState([])

  const [showForm, setShowForm] =
    useState(false)

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null)

  const [loading, setLoading] =
    useState(true)


  const [formData, setFormData] =
    useState({
      name: "",
      product_code: "",
      category: "Other",
      supplier: "",
      purchase_price: "",
      selling_price: "",
      stock: "",
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


  const fetchProducts =
    async () => {

      const token = getToken()

      if (!token) {
        logout()
        return
      }

      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/api/products/",
            {
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

        if (!response.ok) {
          throw new Error(
            "Unable to fetch products"
          )
        }

        const data =
          await response.json()

        setProducts(data)

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        )

      } finally {

        setLoading(false)

      }
    }


  const fetchSuppliers =
    async () => {

      const token = getToken()

      if (!token) {
        logout()
        return
      }

      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/api/suppliers/",
            {
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

        if (!response.ok) {
          throw new Error(
            "Unable to fetch suppliers"
          )
        }

        const data =
          await response.json()

        setSuppliers(data)

      } catch (error) {

        console.error(
          "Error fetching suppliers:",
          error
        )

      }
    }


  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [])


  const resetForm = () => {
    setFormData({
      name: "",
      product_code: "",
      category: "Other",
      supplier: "",
      purchase_price: "",
      selling_price: "",
      stock: "",
    })

    setEditingProduct(null)
    setShowForm(false)
  }


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }


  const handleSubmit =
    async (event) => {

      event.preventDefault()

      if (
        !formData.name ||
        !formData.product_code ||
        !formData.purchase_price ||
        !formData.selling_price ||
        formData.stock === ""
      ) {
        alert(
          "Please fill all required fields."
        )

        return
      }


      const token = getToken()

      if (!token) {
        logout()
        return
      }


      const dataToSend = {
        ...formData,

        supplier:
          formData.supplier
            ? Number(
                formData.supplier
              )
            : null,

        stock:
          Number(
            formData.stock
          ),
      }


      let url =
        "http://127.0.0.1:8000/api/products/"

      let method =
        "POST"


      if (editingProduct) {

        url =
          `http://127.0.0.1:8000/api/products/${editingProduct.id}/`

        method =
          "PUT"
      }


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
                  dataToSend
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
            "Admin permission is required."
          )

          return
        }


        if (!response.ok) {

          const errorData =
            await response.json()

          console.error(
            errorData
          )

          alert(
            "Unable to save product. Check that the product code is unique and all fields are valid."
          )

          return
        }


        alert(
          editingProduct
            ? "Product updated successfully."
            : "Product added successfully."
        )


        resetForm()

        fetchProducts()

      } catch (error) {

        console.error(
          "Error saving product:",
          error
        )

        alert(
          "Something went wrong while saving the product."
        )
      }
    }


  const handleEdit = (
    product
  ) => {

    setEditingProduct(
      product
    )

    setFormData({
      name:
        product.name,

      product_code:
        product.product_code,

      category:
        product.category,

      supplier:
        product.supplier || "",

      purchase_price:
        product.purchase_price,

      selling_price:
        product.selling_price,

      stock:
        product.stock,
    })

    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }


  const handleDelete =
    async (product) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${product.name}"?`
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
            `http://127.0.0.1:8000/api/products/${product.id}/`,
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
            "Admin permission is required."
          )

          return
        }


        if (!response.ok) {

          alert(
            "Unable to delete this product. It may be connected to a completed bill."
          )

          return
        }


        alert(
          "Product deleted successfully."
        )

        fetchProducts()

      } catch (error) {

        console.error(
          "Error deleting product:",
          error
        )

        alert(
          "Something went wrong while deleting the product."
        )
      }
    }


  const getSupplierName = (
    supplierId
  ) => {

    if (!supplierId) {
      return "No Supplier"
    }

    const supplier =
      suppliers.find(
        (item) =>
          item.id ===
          supplierId
      )

    return supplier
      ? supplier.name
      : "Unknown Supplier"
  }


  return (
    <div className="min-h-screen p-10 bg-gray-50">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Products
            </h1>

            <p className="text-gray-600 mt-2">
              Manage products and inventory
            </p>
          </div>


          <button
            onClick={() => {

              if (showForm) {
                resetForm()
              } else {

                setEditingProduct(
                  null
                )

                setFormData({
                  name: "",
                  product_code: "",
                  category:
                    "Other",
                  supplier: "",
                  purchase_price:
                    "",
                  selling_price:
                    "",
                  stock: "",
                })

                setShowForm(
                  true
                )
              }
            }}
            className="bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800"
          >
            {showForm
              ? "Cancel"
              : "+ Add Product"}
          </button>

        </div>


        {showForm && (
          <div className="bg-white border rounded-xl p-6 mb-8">

            <h2 className="text-xl font-bold mb-6">
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </h2>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block font-medium mb-2">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Product Code *
                  </label>

                  <input
                    type="text"
                    name="product_code"
                    value={
                      formData.product_code
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  >
                    <option value="Men">
                      Men
                    </option>

                    <option value="Women">
                      Women
                    </option>

                    <option value="Kids">
                      Kids
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Supplier
                  </label>

                  <select
                    name="supplier"
                    value={
                      formData.supplier
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  >

                    <option value="">
                      No Supplier
                    </option>

                    {suppliers.map(
                      (supplier) => (
                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                        >
                          {
                            supplier.name
                          }
                        </option>
                      )
                    )}

                  </select>
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Purchase Price *
                  </label>

                  <input
                    type="number"
                    name="purchase_price"
                    min="0"
                    step="0.01"
                    value={
                      formData.purchase_price
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Selling Price *
                  </label>

                  <input
                    type="number"
                    name="selling_price"
                    min="0"
                    step="0.01"
                    value={
                      formData.selling_price
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Stock *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

              </div>


              <div className="flex gap-3 mt-6">

                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Save Product"}
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
            Loading products...
          </p>

        ) : products.length === 0 ? (

          <div className="bg-white border rounded-xl p-8 text-center">

            <p className="text-gray-500">
              No products found.
            </p>

          </div>

        ) : (

          <div className="bg-white border rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-900 text-white">

                  <tr>
                    <th className="text-left p-4">
                      Product
                    </th>

                    <th className="text-left p-4">
                      Code
                    </th>

                    <th className="text-left p-4">
                      Category
                    </th>

                    <th className="text-left p-4">
                      Supplier
                    </th>

                    <th className="text-left p-4">
                      Purchase Price
                    </th>

                    <th className="text-left p-4">
                      Selling Price
                    </th>

                    <th className="text-left p-4">
                      Stock
                    </th>

                    <th className="text-left p-4">
                      Actions
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {products.map(
                    (product) => (

                      <tr
                        key={
                          product.id
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4 font-semibold">
                          {
                            product.name
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.product_code
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.category
                          }
                        </td>

                        <td className="p-4">
                          {
                            getSupplierName(
                              product.supplier
                            )
                          }
                        </td>

                        <td className="p-4">
                          ₹
                          {Number(
                            product.purchase_price
                          ).toFixed(2)}
                        </td>

                        <td className="p-4">
                          ₹
                          {Number(
                            product.selling_price
                          ).toFixed(2)}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              product.stock <=
                              5
                                ? "font-semibold text-red-600"
                                : "font-semibold"
                            }
                          >
                            {
                              product.stock
                            }
                          </span>
                        </td>


                        <td className="p-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Edit
                            </button>


                            <button
                              onClick={() =>
                                handleDelete(
                                  product
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


export default Products