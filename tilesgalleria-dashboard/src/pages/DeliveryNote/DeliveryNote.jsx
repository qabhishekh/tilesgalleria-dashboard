import { useNavigate } from "react-router-dom";

export default function DeliveryNote() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
        {/* 🔹 Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-900 flex items-center gap-2">
            🚚 Delivery Note
          </h2>
          <button
            onClick={() => navigate("/add-delivery-note")}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md transition text-sm sm:text-base"
          >
            <i className="fas fa-plus"></i> Create Delivery Note
          </button>
        </div>

        {/* 🔹 Table Controls (Show entries + Search) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 text-sm gap-3">
          {/* Show entries */}
          <div className="flex items-center gap-2">
            <label htmlFor="entries" className="text-gray-700">
              Show
            </label>
            <select
              id="entries"
              className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="text-gray-700">entries</span>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="search" className="text-gray-700 whitespace-nowrap">
              Search:
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search..."
              className="flex-1 sm:flex-none border rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* 🔹 Table */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[500px]">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                {["Sr. No.", "Company Name", "Action"].map((head, idx) => (
                  <th
                    key={idx}
                    className="px-3 sm:px-4 py-2 sm:py-3 font-semibold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* If no data */}
              <tr>
                <td
                  colSpan="3"
                  className="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500 italic"
                >
                  No data available in table
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🔹 Footer (Pagination Controls) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 text-xs sm:text-sm text-gray-600 gap-3">
          <span>Showing 0 of 0 entries</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-100 transition text-xs sm:text-sm">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-lg bg-indigo-600 text-white shadow text-xs sm:text-sm">
              1
            </button>
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-100 transition text-xs sm:text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
