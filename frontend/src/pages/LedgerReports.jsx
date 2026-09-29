import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"


function LedgerReports() {
  const navigate = useNavigate()

  const [entries, setEntries] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showExpense, setShowExpense] =
    useState(false)

  const [description, setDescription] =
    useState("")

  const [amount, setAmount] =
    useState("")

  const [saving, setSaving] =
    useState(false)

  const [filter, setFilter] =
    useState("ALL")


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


  const fetchLedger = async () => {
    if (!token) {
      logout()
      return
    }

    setLoading(true)

    try {
      const response =
        await fetch(
          "https://pos-billing-system-ldhr.onrender.com/api/ledger/",
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
          "/admin",
          {
            replace: true,
          }
        )

        return
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load ledger."
        )
      }

      const data =
        await response.json()

      setEntries(data)

    } catch (error) {
      console.error(
        "Ledger error:",
        error
      )

      alert(
        "Unable to load ledger."
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchLedger()
  }, [])


  const totalSales =
    useMemo(() => {
      return entries
        .filter(
          (entry) =>
            entry.entry_type ===
            "SALE"
        )
        .reduce(
          (total, entry) =>
            total +
            Number(entry.amount),
          0
        )
    }, [entries])


  const totalReturns =
    useMemo(() => {
      return entries
        .filter(
          (entry) =>
            entry.entry_type ===
            "RETURN"
        )
        .reduce(
          (total, entry) =>
            total +
            Math.abs(
              Number(entry.amount)
            ),
          0
        )
    }, [entries])


  const totalExpenses =
    useMemo(() => {
      return entries
        .filter(
          (entry) =>
            entry.entry_type ===
            "EXPENSE"
        )
        .reduce(
          (total, entry) =>
            total +
            Math.abs(
              Number(entry.amount)
            ),
          0
        )
    }, [entries])


  const netAmount =
    totalSales -
    totalReturns -
    totalExpenses


  const filteredEntries =
    useMemo(() => {
      if (filter === "ALL") {
        return entries
      }

      return entries.filter(
        (entry) =>
          entry.entry_type ===
          filter
      )
    }, [
      entries,
      filter,
    ])


  const addExpense = async (
    event
  ) => {
    event.preventDefault()

    const expenseAmount =
      Number(amount)

    if (!description.trim()) {
      alert(
        "Enter an expense description."
      )

      return
    }

    if (
      !expenseAmount ||
      expenseAmount <= 0
    ) {
      alert(
        "Enter a valid expense amount."
      )

      return
    }

    setSaving(true)

    try {
      const response =
        await fetch(
          "https://pos-billing-system-ldhr.onrender.com/api/ledger/",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                entry_type:
                  "EXPENSE",

                description:
                  description.trim(),

                amount:
                  expenseAmount,
              }),
          }
        )

      if (response.status === 401) {
        logout()
        return
      }

      const data =
        await response.json()

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to add expense."
        )

        return
      }

      alert(
        "Expense added successfully."
      )

      setDescription("")
      setAmount("")
      setShowExpense(false)

      await fetchLedger()

    } catch (error) {
      console.error(
        "Expense error:",
        error
      )

      alert(
        "Unable to add expense."
      )

    } finally {
      setSaving(false)
    }
  }


  const getTypeStyle = (
    type
  ) => {
    if (type === "SALE") {
      return (
        "bg-green-100 " +
        "text-green-700"
      )
    }

    if (type === "RETURN") {
      return (
        "bg-orange-100 " +
        "text-orange-700"
      )
    }

    return (
      "bg-red-100 " +
      "text-red-700"
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Ledger & Reports
            </h1>

            <p className="mt-2 text-gray-600">
              Financial summary and
              transaction ledger
            </p>
          </div>


          <button
            onClick={() =>
              setShowExpense(
                !showExpense
              )
            }
            className="bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800"
          >
            {showExpense
              ? "Cancel"
              : "+ Add Expense"}
          </button>

        </div>


        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

          <div className="bg-white border rounded-xl p-6">

            <p className="text-gray-500">
              Total Sales
            </p>

            <p className="text-2xl font-bold mt-2">
              ₹{totalSales.toFixed(2)}
            </p>

          </div>


          <div className="bg-white border rounded-xl p-6">

            <p className="text-gray-500">
              Total Returns
            </p>

            <p className="text-2xl font-bold mt-2">
              ₹{totalReturns.toFixed(2)}
            </p>

          </div>


          <div className="bg-white border rounded-xl p-6">

            <p className="text-gray-500">
              Total Expenses
            </p>

            <p className="text-2xl font-bold mt-2">
              ₹{totalExpenses.toFixed(2)}
            </p>

          </div>


          <div className="bg-slate-900 text-white rounded-xl p-6">

            <p className="text-slate-300">
              Net Amount
            </p>

            <p className="text-2xl font-bold mt-2">
              ₹{netAmount.toFixed(2)}
            </p>

          </div>

        </div>


        {/* EXPENSE FORM */}

        {showExpense && (
          <div className="bg-white border rounded-xl p-6 mt-8">

            <h2 className="text-xl font-bold">
              Add Expense
            </h2>

            <p className="text-gray-500 mt-1">
              Record a business expense
              in the ledger
            </p>


            <form
              onSubmit={addExpense}
              className="mt-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block font-medium mb-2">
                    Description *
                  </label>

                  <input
                    type="text"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Example: Electricity bill"
                    className="w-full border rounded-lg p-3"
                  />
                </div>


                <div>
                  <label className="block font-medium mb-2">
                    Amount *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="0.00"
                    className="w-full border rounded-lg p-3"
                  />
                </div>

              </div>


              <button
                type="submit"
                disabled={saving}
                className="mt-5 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Add Expense"}
              </button>

            </form>

          </div>
        )}


        {/* LEDGER */}

        <div className="mt-10">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-xl font-bold">
                Ledger Entries
              </h2>

              <p className="text-gray-500 mt-1">
                Sales, returns and expenses
              </p>
            </div>


            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="border rounded-lg p-3 bg-white"
            >
              <option value="ALL">
                All Entries
              </option>

              <option value="SALE">
                Sales
              </option>

              <option value="RETURN">
                Returns
              </option>

              <option value="EXPENSE">
                Expenses
              </option>
            </select>

          </div>


          {loading ? (
            <div className="bg-white border rounded-xl p-8">
              Loading ledger...
            </div>

          ) : filteredEntries.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center">

              <p className="text-gray-500">
                No ledger entries found.
              </p>

            </div>

          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-900 text-white">

                    <tr>
                      <th className="p-4 text-left">
                        Date
                      </th>

                      <th className="p-4 text-left">
                        Type
                      </th>

                      <th className="p-4 text-left">
                        Description
                      </th>

                      <th className="p-4 text-left">
                        Invoice
                      </th>

                      <th className="p-4 text-right">
                        Amount
                      </th>
                    </tr>

                  </thead>


                  <tbody>

                    {filteredEntries.map(
                      (entry) => (
                        <tr
                          key={entry.id}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="p-4 whitespace-nowrap">

                            {new Date(
                              entry.created_at
                            ).toLocaleString()}

                          </td>


                          <td className="p-4">

                            <span
                              className={
                                `inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(
                                  entry.entry_type
                                )}`
                              }
                            >
                              {entry.entry_type}
                            </span>

                          </td>


                          <td className="p-4">
                            {entry.description}
                          </td>


                          <td className="p-4">
                            {entry.invoice_number ||
                              "-"}
                          </td>


                          <td
                            className={`p-4 text-right font-bold ${
                              Number(
                                entry.amount
                              ) < 0
                                ? "text-red-600"
                                : "text-green-700"
                            }`}
                          >

                            {Number(
                              entry.amount
                            ) < 0
                              ? "-₹"
                              : "₹"}

                            {Math.abs(
                              Number(
                                entry.amount
                              )
                            ).toFixed(2)}

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


export default LedgerReports