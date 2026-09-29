import {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"


function Billing() {
  const navigate = useNavigate()

  const [products, setProducts] =
    useState([])

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState("")

  const [quantity, setQuantity] =
    useState(1)

  const [cart, setCart] =
    useState([])

  const [
    customerName,
    setCustomerName,
  ] = useState("")

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("")

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("Cash")

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false)

  const [
    completedBill,
    setCompletedBill,
  ] = useState(null)


  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const getToken = () => {
    return localStorage.getItem(
      "accessToken"
    )
  }


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


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
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
    }
  }


  useEffect(() => {
    fetchProducts()
  }, [])


  // =====================================================
  // ADD PRODUCT TO CART
  // =====================================================

  const addToCart = () => {
    if (!selectedProduct) {
      alert(
        "Please select a product"
      )

      return
    }

    const product =
      products.find(
        (item) =>
          item.id ===
          Number(
            selectedProduct
          )
      )

    if (!product) {
      return
    }

    const qty =
      Number(quantity)

    if (
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      alert(
        "Quantity must be at least 1"
      )

      return
    }

    const existingItem =
      cart.find(
        (item) =>
          item.id ===
          product.id
      )

    const existingQuantity =
      existingItem
        ? existingItem.quantity
        : 0

    const newQuantity =
      existingQuantity + qty

    if (
      newQuantity >
      product.stock
    ) {
      alert(
        `Only ${product.stock} items are available in stock.`
      )

      return
    }

    if (existingItem) {
      setCart(
        cart.map(
          (item) =>
            item.id ===
            product.id
              ? {
                  ...item,
                  quantity:
                    newQuantity,
                }
              : item
        )
      )

    } else {
      setCart([
        ...cart,

        {
          ...product,
          quantity: qty,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
  }


  // =====================================================
  // CART QUANTITY
  // =====================================================

  const increaseQuantity = (
    id
  ) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          if (
            item.quantity >=
            item.stock
          ) {
            alert(
              `Only ${item.stock} items are available in stock.`
            )

            return item
          }

          return {
            ...item,
            quantity:
              item.quantity + 1,
          }
        }

        return item
      })
    )
  }


  const decreaseQuantity = (
    id
  ) => {
    setCart(
      cart.map((item) => {
        if (
          item.id === id &&
          item.quantity > 1
        ) {
          return {
            ...item,
            quantity:
              item.quantity - 1,
          }
        }

        return item
      })
    )
  }


  const removeFromCart = (
    id
  ) => {
    setCart(
      cart.filter(
        (item) =>
          item.id !== id
      )
    )
  }


  // =====================================================
  // TOTAL
  // =====================================================

  const grandTotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.selling_price
        ) *
          item.quantity,

      0
    )


  // =====================================================
  // COMPLETE SALE
  // =====================================================

  const completeSale =
    async () => {

      if (
        cart.length === 0
      ) {
        alert(
          "Cart is empty"
        )

        return
      }

      const token =
        getToken()

      if (!token) {
        logout()
        return
      }

      setIsProcessing(true)

      const saleData = {
        customer_name:
          customerName,

        customer_phone:
          customerPhone,

        payment_method:
          paymentMethod,

        items:
          cart.map(
            (item) => ({
              product_id:
                item.id,

              quantity:
                item.quantity,
            })
          ),
      }

      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/api/complete-sale/",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  saleData
                ),
            }
          )

        if (
          response.status ===
          401
        ) {
          logout()
          return
        }

        const data =
          await response.json()

        if (!response.ok) {
          alert(
            data.error ||
              data.detail ||
              "Unable to complete sale."
          )

          return
        }

        setCompletedBill(
          data.bill
        )

        setCart([])

        setSelectedProduct("")

        setQuantity(1)

        setCustomerName("")

        setCustomerPhone("")

        setPaymentMethod(
          "Cash"
        )

        fetchProducts()

      } catch (error) {
        console.error(
          "Sale error:",
          error
        )

        alert(
          "Could not connect to the server. Make sure Django is running."
        )

      } finally {
        setIsProcessing(
          false
        )
      }
    }


  // =====================================================
  // PRINT INVOICE
  // =====================================================

  const printInvoice = () => {
    window.print()
  }


  // =====================================================
  // CLOSE INVOICE
  // =====================================================

  const closeInvoice = () => {
    setCompletedBill(null)
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">

      <div className="billing-page">

        <h1 className="text-3xl font-bold">
          Billing
        </h1>

        <p className="mt-2 text-gray-600">
          Create a new customer bill
        </p>


        {/* CUSTOMER DETAILS */}

        <div className="mt-8 max-w-3xl">

          <h2 className="text-xl font-semibold mb-4">
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block font-medium mb-2">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                placeholder="Enter customer name"
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Phone Number
              </label>

              <input
                type="text"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(
                    e.target.value
                  )
                }
                placeholder="Enter phone number"
                className="w-full border rounded-lg p-3"
              />
            </div>

          </div>
        </div>


        {/* PRODUCT SELECTION */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold mb-4">
            Select Product
          </h2>

          <select
            value={
              selectedProduct
            }
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
            className="w-full max-w-2xl border rounded-lg p-3"
          >

            <option value="">
              Choose a product
            </option>

            {products.map(
              (product) => (

                <option
                  key={
                    product.id
                  }
                  value={
                    product.id
                  }
                  disabled={
                    product.stock ===
                    0
                  }
                >
                  {product.name}
                  {" — "}
                  {product.category ||
                    "No Category"}
                  {" — "}
                  {product.product_code ||
                    "No Code"}
                  {" — ₹"}
                  {product.selling_price}
                  {" — Stock: "}
                  {product.stock}
                </option>

              )
            )}

          </select>


          {/* SELECTED PRODUCT INFORMATION */}

          {selectedProduct && (() => {
            const product =
              products.find(
                (item) =>
                  item.id ===
                  Number(
                    selectedProduct
                  )
              )

            if (!product) {
              return null
            }

            return (
              <div className="mt-4 max-w-2xl bg-slate-50 border rounded-lg p-4">

                <p className="font-semibold text-lg">
                  {product.name}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">

                  <span className="bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded-full">
                    Category:{" "}
                    {product.category ||
                      "No Category"}
                  </span>

                  <span className="bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded-full">
                    Code:{" "}
                    {product.product_code ||
                      "No Code"}
                  </span>

                </div>

                <p className="text-gray-600 mt-3">
                  Price: ₹
                  {Number(
                    product.selling_price
                  ).toFixed(2)}
                </p>

                <p className="text-gray-600 mt-1">
                  Available Stock:{" "}
                  {product.stock}
                </p>

              </div>
            )
          })()}


          <div className="mt-4">

            <label className="block font-medium mb-2">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              className="w-full max-w-md border rounded-lg p-3"
            />

          </div>


          <button
            onClick={
              addToCart
            }
            className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800"
          >
            Add to Cart
          </button>

        </div>


        {/* CART */}

        <div className="mt-10">

          <h2 className="text-xl font-semibold mb-4">
            Cart
          </h2>

          {cart.length === 0 ? (

            <p className="text-gray-500">
              No items added to cart.
            </p>

          ) : (
            <>

              <div className="space-y-3">

                {cart.map(
                  (item) => (

                    <div
                      key={
                        item.id
                      }
                      className="border rounded-lg p-5 max-w-3xl"
                    >

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">

                        <div>

                          <h3 className="font-semibold text-lg">
                            {item.name}
                          </h3>


                          {/* CATEGORY + PRODUCT CODE */}

                          <div className="flex flex-wrap gap-2 mt-2">

                            <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                              {item.category ||
                                "No Category"}
                            </span>

                            <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                              {item.product_code ||
                                "No Code"}
                            </span>

                          </div>


                          <p className="text-gray-600 mt-2">
                            ₹
                            {item.selling_price}
                            {" × "}
                            {item.quantity}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Available stock:{" "}
                            {item.stock}
                          </p>

                        </div>


                        <div className="font-bold text-lg">

                          ₹
                          {(
                            Number(
                              item.selling_price
                            ) *
                            item.quantity
                          ).toFixed(
                            2
                          )}

                        </div>

                      </div>


                      <div className="flex flex-wrap items-center gap-3 mt-5">

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                          className="border rounded-lg px-4 py-2 font-bold hover:bg-gray-100"
                        >
                          −
                        </button>


                        <span className="font-semibold min-w-8 text-center">
                          {
                            item.quantity
                          }
                        </span>


                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                          className="border rounded-lg px-4 py-2 font-bold hover:bg-gray-100"
                        >
                          +
                        </button>


                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                          className="sm:ml-3 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* GRAND TOTAL */}

              <div className="mt-6 max-w-3xl border-t pt-5 flex justify-between">

                <span className="text-xl font-bold">
                  Grand Total
                </span>

                <span className="text-xl font-bold">
                  ₹
                  {grandTotal.toFixed(
                    2
                  )}
                </span>

              </div>


              {/* PAYMENT */}

              <div className="mt-8 max-w-3xl">

                <h2 className="text-xl font-semibold mb-4">
                  Payment
                </h2>

                <label className="block font-medium mb-2">
                  Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full max-w-md border rounded-lg p-3"
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                </select>


                <button
                  onClick={
                    completeSale
                  }
                  disabled={
                    isProcessing
                  }
                  className="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >

                  {isProcessing
                    ? "Processing..."
                    : "Complete Sale"}

                </button>

              </div>

            </>
          )}

        </div>

      </div>


      {/* =================================================
          INVOICE MODAL
      ================================================= */}

      {completedBill && (

        <div className="invoice-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="invoice-modal bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">


            {/* PRINT AREA */}

            <div
              id="invoice-print-area"
              className="invoice-print-area p-8 md:p-10"
            >

              {/* HEADER */}

              <div className="text-center border-b pb-6">

                <h1 className="text-3xl font-bold">
                  POS Billing
                </h1>

                <p className="text-gray-500 mt-2">
                  Sales Invoice
                </p>

              </div>


              {/* BILL INFORMATION */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-7">

                <div>

                  <p className="text-sm text-gray-500">
                    Invoice Number
                  </p>

                  <p className="font-semibold break-all">
                    {
                      completedBill.invoice_number
                    }
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Date
                  </p>

                  <p className="font-semibold">
                    {new Date(
                      completedBill.created_at
                    ).toLocaleString()}
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="font-semibold">
                    {
                      completedBill.customer_name ||
                      "Walk-in Customer"
                    }
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Phone
                  </p>

                  <p className="font-semibold">
                    {
                      completedBill.customer_phone ||
                      "-"
                    }
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <p className="font-semibold">
                    {
                      completedBill.payment_method
                    }
                  </p>

                </div>


                <div>

                  <p className="text-sm text-gray-500">
                    Staff
                  </p>

                  <p className="font-semibold">
                    {
                      completedBill.staff_username ||
                      "Billing Staff"
                    }
                  </p>

                </div>

              </div>


              {/* ITEMS */}

              <div className="mt-10 overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b">

                      <th className="py-3 text-left">
                        Product
                      </th>

                      <th className="py-3 text-center">
                        Qty
                      </th>

                      <th className="py-3 text-right">
                        Price
                      </th>

                      <th className="py-3 text-right">
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {completedBill.items?.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-b"
                        >

                          <td className="py-4">
                            {
                              item.product_name
                            }
                          </td>

                          <td className="py-4 text-center">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="py-4 text-right">
                            ₹
                            {Number(
                              item.price
                            ).toFixed(
                              2
                            )}
                          </td>

                          <td className="py-4 text-right">
                            ₹
                            {Number(
                              item.total
                            ).toFixed(
                              2
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* TOTALS */}

              <div className="mt-8 border-t pt-6">

                <div className="flex justify-between py-2">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      completedBill.subtotal
                    ).toFixed(
                      2
                    )}
                  </span>

                </div>


                <div className="flex justify-between py-2">

                  <span>
                    Tax
                  </span>

                  <span>
                    ₹
                    {Number(
                      completedBill.tax
                    ).toFixed(
                      2
                    )}
                  </span>

                </div>


                <div className="flex justify-between border-t mt-3 pt-5 text-xl font-bold">

                  <span>
                    Grand Total
                  </span>

                  <span>
                    ₹
                    {Number(
                      completedBill.grand_total
                    ).toFixed(
                      2
                    )}
                  </span>

                </div>

              </div>


              {/* FOOTER */}

              <div className="text-center text-gray-500 mt-10">
                Thank you for your purchase.
              </div>

            </div>


            {/* BUTTONS */}

            <div className="invoice-actions flex justify-end gap-3 px-8 pb-8">

              <button
                onClick={
                  closeInvoice
                }
                className="border rounded-lg px-6 py-3 hover:bg-gray-100"
              >
                Close
              </button>


              <button
                onClick={
                  printInvoice
                }
                className="bg-slate-900 text-white rounded-lg px-6 py-3 hover:bg-slate-800"
              >
                Print Invoice
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default Billing