import {
  useEffect,
  useState,
} from "react"

import { useNavigate } from "react-router-dom"


function SalesHistory() {
  const navigate = useNavigate()

  const [bills, setBills] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


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


  useEffect(() => {
    const fetchBills = async () => {
      const token =
        localStorage.getItem(
          "accessToken"
        )

      if (!token) {
        logout()
        return
      }

      try {
        const response =
          await fetch(
            "http://127.0.0.1:8000/api/bills/",
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
            "Unable to fetch sales history"
          )
        }

        const data =
          await response.json()

        setBills(data)
      } catch (error) {
        console.error(error)

        setError(
          "Unable to load sales history."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen p-10">
        <p>
          Loading sales history...
        </p>
      </div>
    )
  }


  return (
    <div className="min-h-screen p-10">

      <h1 className="text-3xl font-bold">
        Sales History
      </h1>

      <p className="mt-2 text-gray-600">
        View completed customer bills
      </p>


      {error && (
        <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}


      {!error &&
        bills.length === 0 && (
          <p className="mt-8 text-gray-500">
            No completed sales found.
          </p>
        )}


      {!error &&
        bills.length > 0 && (
          <div className="mt-8 overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-slate-900 text-white">

                  <th className="p-3 text-left">
                    Invoice
                  </th>

                  <th className="p-3 text-left">
                    Customer
                  </th>

                  <th className="p-3 text-left">
                    Items
                  </th>

                  <th className="p-3 text-left">
                    Payment
                  </th>

                  <th className="p-3 text-left">
                    Total
                  </th>

                  <th className="p-3 text-left">
                    Date
                  </th>

                </tr>
              </thead>


              <tbody>

                {bills.map(
                  (bill) => (
                    <tr
                      key={bill.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-medium">
                        {
                          bill.invoice_number
                        }
                      </td>


                      <td className="p-3">
                        {
                          bill.customer_name ||
                          "Walk-in Customer"
                        }

                        {bill.customer_phone && (
                          <div className="text-sm text-gray-500">
                            {
                              bill.customer_phone
                            }
                          </div>
                        )}
                      </td>


                      <td className="p-3">

                        {bill.items.map(
                          (item) => (
                            <div
                              key={
                                item.id
                              }
                            >
                              {
                                item.product_name
                              }
                              {" × "}
                              {
                                item.quantity
                              }
                            </div>
                          )
                        )}

                      </td>


                      <td className="p-3">
                        {
                          bill.payment_method
                        }
                      </td>


                      <td className="p-3 font-semibold">
                        ₹
                        {Number(
                          bill.grand_total
                        ).toFixed(2)}
                      </td>


                      <td className="p-3">
                        {new Date(
                          bill.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

    </div>
  )
}


export default SalesHistory