import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"


function ProductReturns() {
  const navigate = useNavigate()

  const [bills, setBills] =
    useState([])

  const [returns, setReturns] =
    useState([])

  const [selectedBill, setSelectedBill] =
    useState("")

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState("")

  const [quantity, setQuantity] =
    useState(1)

  const [reason, setReason] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)


  const token =
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


  const fetchData = async () => {
    if (!token) {
      logout()
      return
    }

    setLoading(true)

    try {
      const [
        billsResponse,
        returnsResponse,
      ] = await Promise.all([
        fetch(
          "https://pos-billing-system-ldhr.onrender.com/api/bills/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),

        fetch(
          "https://pos-billing-system-ldhr.onrender.com/api/returns/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),
      ])

      if (
        billsResponse.status === 401 ||
        returnsResponse.status === 401
      ) {
        logout()
        return
      }

      if (
        billsResponse.status === 403 ||
        returnsResponse.status === 403
      ) {
        alert(
          "Admin access is required."
        )

        navigate(
          "/admin",
          {
            replace: true,
          }
        )

        return
      }

      if (
        !billsResponse.ok ||
        !returnsResponse.ok
      ) {
        throw new Error(
          "Unable to load product return data."
        )
      }

      const billsData =
        await billsResponse.json()

      const returnsData =
        await returnsResponse.json()

      setBills(billsData)
      setReturns(returnsData)

    } catch (error) {
      console.error(
        "Return page error:",
        error
      )

      alert(
        "Unable to load product returns."
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchData()
  }, [])


  const bill = useMemo(
    () =>
      bills.find(
        (item) =>
          item.id ===
          Number(selectedBill)
      ),
    [
      bills,
      selectedBill,
    ]
  )


  const billProducts =
    bill?.items || []


  const selectedBillItem =
    billProducts.find(
      (item) =>
        item.product ===
        Number(selectedProduct)
    )


  const getAlreadyReturned = (
    billId,
    productId
  ) => {
    return returns
      .filter(
        (item) =>
          item.bill === billId &&
          item.product === productId
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity
          ),
        0
      )
  }


  const alreadyReturned =
    selectedBillItem && bill
      ? getAlreadyReturned(
          bill.id,
          selectedBillItem.product
        )
      : 0


  const returnableQuantity =
    selectedBillItem
      ? Number(
          selectedBillItem.quantity
        ) - alreadyReturned
      : 0


  const estimatedRefund =
    selectedBillItem
      ? Number(
          selectedBillItem.price
        ) * Number(quantity || 0)
      : 0


  const resetForm = () => {
    setSelectedBill("")
    setSelectedProduct("")
    setQuantity(1)
    setReason("")
  }


  const processReturn =
    async (event) => {
      event.preventDefault()

      if (!selectedBill) {
        alert(
          "Please select an invoice."
        )
        return
      }

      if (!selectedProduct) {
        alert(
          "Please select a product."
        )
        return
      }

      const qty =
        Number(quantity)

      if (
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        alert(
          "Return quantity must be at least 1."
        )
        return
      }

      if (
        qty >
        returnableQuantity
      ) {
        alert(
          `Only ${returnableQuantity} unit(s) can still be returned.`
        )
        return
      }

      const confirmed =
        window.confirm(
          `Process return of ${qty} unit(s) for ₹${estimatedRefund.toFixed(2)}?`
        )

      if (!confirmed) {
        return
      }

      setProcessing(true)

      try {
        const response =
          await fetch(
            "https://pos-billing-system-ldhr.onrender.com/api/process-return/",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  bill_id:
                    Number(
                      selectedBill
                    ),

                  product_id:
                    Number(
                      selectedProduct
                    ),

                  quantity:
                    qty,

                  reason:
                    reason.trim(),
                }),
            }
          )

        if (
          response.status === 401
        ) {
          logout()
          return
        }

        const data =
          await response.json()

        if (!response.ok) {
          alert(
            data.error ||
              "Unable to process return."
          )

          return
        }

        alert(
          `Return completed successfully.\nRefund: ₹${Number(
            data.return.refund_amount
          ).toFixed(2)}`
        )

        resetForm()

        await fetchData()

      } catch (error) {
        console.error(
          "Return error:",
          error
        )

        alert(
          "Unable to process return."
        )

      } finally {
        setProcessing(false)
      }
    }


  return (
    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Product Returns
          </h1>

          <p className="mt-2 text-gray-600">
            Process customer returns
            against completed invoices
          </p>

        </div>


        <div className="bg-white border rounded-xl p-6">

          <h2 className="text-xl font-bold mb-6">
            Process New Return
          </h2>


          {loading ? (
            <p>
              Loading invoices...
            </p>
          ) : (

            <form
              onSubmit={
                processReturn
              }
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                <div className="md:col-span-2">

                  <label className="block font-medium mb-2">
                    Original Invoice *
                  </label>

                  <select
                    value={
                      selectedBill
                    }
                    onChange={(e) => {
                      setSelectedBill(
                        e.target.value
                      )

                      setSelectedProduct(
                        ""
                      )

                      setQuantity(1)
                    }}
                    className="w-full border rounded-lg p-3"
                  >

                    <option value="">
                      Select an invoice
                    </option>

                    {bills.map(
                      (item) => (

                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.invoice_number
                          }
                          {" - "}
                          {
                            item.customer_name ||
                            "Walk-in Customer"
                          }
                          {" - ₹"}
                          {Number(
                            item.grand_total
                          ).toFixed(2)}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {bill && (

                  <div className="md:col-span-2 bg-slate-50 rounded-lg p-4">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                      <div>
                        <p className="text-sm text-gray-500">
                          Invoice
                        </p>

                        <p className="font-semibold">
                          {bill.invoice_number}
                        </p>
                      </div>


                      <div>
                        <p className="text-sm text-gray-500">
                          Customer
                        </p>

                        <p className="font-semibold">
                          {bill.customer_name ||
                            "Walk-in Customer"}
                        </p>
                      </div>


                      <div>
                        <p className="text-sm text-gray-500">
                          Payment
                        </p>

                        <p className="font-semibold">
                          {bill.payment_method}
                        </p>
                      </div>


                      <div>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>

                        <p className="font-semibold">
                          ₹
                          {Number(
                            bill.grand_total
                          ).toFixed(2)}
                        </p>
                      </div>

                    </div>

                  </div>
                )}


                <div>

                  <label className="block font-medium mb-2">
                    Product *
                  </label>

                  <select
                    value={
                      selectedProduct
                    }
                    onChange={(e) => {
                      setSelectedProduct(
                        e.target.value
                      )

                      setQuantity(1)
                    }}
                    disabled={!bill}
                    className="w-full border rounded-lg p-3 disabled:bg-gray-100"
                  >

                    <option value="">
                      Select product
                    </option>

                    {billProducts.map(
                      (item) => {

                        const returned =
                          getAlreadyReturned(
                            bill.id,
                            item.product
                          )

                        const available =
                          Number(
                            item.quantity
                          ) - returned

                        return (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.product
                            }
                            disabled={
                              available <= 0
                            }
                          >
                            {
                              item.product_name
                            }
                            {" - Sold: "}
                            {
                              item.quantity
                            }
                            {" - Returnable: "}
                            {
                              available
                            }
                          </option>
                        )
                      }
                    )}

                  </select>

                </div>


                <div>

                  <label className="block font-medium mb-2">
                    Return Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      returnableQuantity ||
                      undefined
                    }
                    step="1"
                    value={
                      quantity
                    }
                    onChange={(e) =>
                      setQuantity(
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedBillItem
                    }
                    className="w-full border rounded-lg p-3 disabled:bg-gray-100"
                  />

                </div>


                {selectedBillItem && (

                  <div className="md:col-span-2">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Originally Sold
                        </p>

                        <p className="text-xl font-bold">
                          {
                            selectedBillItem.quantity
                          }
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Already Returned
                        </p>

                        <p className="text-xl font-bold">
                          {
                            alreadyReturned
                          }
                        </p>

                      </div>


                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Returnable
                        </p>

                        <p className="text-xl font-bold">
                          {
                            returnableQuantity
                          }
                        </p>

                      </div>

                    </div>

                  </div>
                )}


                <div className="md:col-span-2">

                  <label className="block font-medium mb-2">
                    Reason for Return
                  </label>

                  <textarea
                    rows="3"
                    value={
                      reason
                    }
                    onChange={(e) =>
                      setReason(
                        e.target.value
                      )
                    }
                    placeholder="Example: Size issue, damaged item, customer changed mind..."
                    className="w-full border rounded-lg p-3"
                  />

                </div>


                {selectedBillItem && (

                  <div className="md:col-span-2 bg-slate-900 text-white rounded-xl p-5 flex justify-between items-center">

                    <span className="font-medium">
                      Refund Amount
                    </span>

                    <span className="text-2xl font-bold">
                      ₹
                      {
                        estimatedRefund.toFixed(
                          2
                        )
                      }
                    </span>

                  </div>
                )}

              </div>


              <button
                type="submit"
                disabled={
                  processing ||
                  returnableQuantity <= 0
                }
                className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : "Process Return"}
              </button>

            </form>
          )}

        </div>


        <div className="mt-10">

          <h2 className="text-xl font-bold mb-4">
            Return History
          </h2>


          {!loading &&
            returns.length === 0 && (

              <div className="bg-white border rounded-xl p-8">

                <p className="text-gray-500 text-center">
                  No product returns found.
                </p>

              </div>
            )}


          {returns.length > 0 && (

            <div className="bg-white border rounded-xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-900 text-white">

                    <tr>
                      <th className="p-4 text-left">
                        Invoice
                      </th>

                      <th className="p-4 text-left">
                        Product
                      </th>

                      <th className="p-4 text-left">
                        Quantity
                      </th>

                      <th className="p-4 text-left">
                        Refund
                      </th>

                      <th className="p-4 text-left">
                        Reason
                      </th>

                      <th className="p-4 text-left">
                        Date
                      </th>
                    </tr>

                  </thead>


                  <tbody>

                    {returns.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="p-4 font-medium">
                            {
                              item.invoice_number
                            }
                          </td>


                          <td className="p-4">

                            <div className="font-medium">
                              {
                                item.product_name
                              }
                            </div>

                            <div className="text-sm text-gray-500">
                              {
                                item.product_code
                              }
                            </div>

                          </td>


                          <td className="p-4">
                            {
                              item.quantity
                            }
                          </td>


                          <td className="p-4 font-semibold">
                            ₹
                            {Number(
                              item.refund_amount
                            ).toFixed(2)}
                          </td>


                          <td className="p-4">
                            {
                              item.reason ||
                              "-"
                            }
                          </td>


                          <td className="p-4">
                            {new Date(
                              item.returned_at
                            ).toLocaleString()}
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
    </div>
  )
}


export default ProductReturns