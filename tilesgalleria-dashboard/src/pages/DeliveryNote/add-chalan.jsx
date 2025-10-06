import { useState } from "react";

export default function AddChalan() {
  const [rows, setRows] = useState([
    { id: 1, productCode: "", quantity: "", total: "" },
  ]);

  // Add new row
  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, productCode: "", quantity: "", total: "" },
    ]);
  };

  // Remove selected row
  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Handle input change
  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
        {/* 🔹 Header */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2 flex items-center gap-2">
          📄 Add Chalan
        </h2>

        {/* 🔹 Form */}
        <form className="space-y-6 sm:space-y-8">
          {/* Customer Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-lg border shadow-sm">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
              Challan Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Customer / Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  placeholder="Enter Company Name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:bg-gray-50 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:bg-gray-50 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg shadow border">
            <table className="w-full text-xs sm:text-sm text-gray-700 border-collapse min-w-[600px]">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-left">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 w-10">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">
                    Product Description
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">
                    Product QTY (per/m²)
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3">Total Amount</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-2 sm:px-4 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <input
                        type="text"
                        value={row.productCode}
                        onChange={(e) =>
                          handleChange(row.id, "productCode", e.target.value)
                        }
                        placeholder="Enter product"
                        className="w-full border rounded-lg px-2 sm:px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleChange(row.id, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="w-full border rounded-lg px-2 sm:px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <input
                        type="number"
                        value={row.total}
                        onChange={(e) =>
                          handleChange(row.id, "total", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full border rounded-lg px-2 sm:px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={addRow}
              className="px-4 sm:px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition text-sm"
            >
              + Add More
            </button>
            <button
              type="submit"
              className="px-5 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition text-sm"
            >
              ✅ Add Chalan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
