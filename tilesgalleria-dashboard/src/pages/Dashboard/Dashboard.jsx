import { useEffect, useState } from "react";
import { FaUsers, FaFileAlt, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [leads, setLeads] = useState([]);

  // 🔹 Summary counts
  const [summary, setSummary] = useState({
    customers: 0,
    invoices: 0,
    quotations: 0,
    products: 0,
    purchases: 0,
    leads: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (process.env.NODE_ENV === "development") {
          console.log("🔹 API Response:", res.data);
        }

        // ✅ summary counts direct
        setSummary({
          customers: res.data.counts?.customers || 0,
          invoices: res.data.counts?.invoices || 0,
          quotations: res.data.counts?.totalQuotations || 0, // merged total (backend se aata hai)
          products: res.data.counts?.products || 0,
          purchases: res.data.counts?.purchases || 0,
          leads: res.data.counts?.leads || 0,
          autoQuotations: res.data.counts?.quotations || 0,
          manualQuotations: res.data.counts?.manualQuotations || 0,
        });

        // ✅ set recents
        if (res.data.recents) {
          if (res.data.recents.products) setProducts(res.data.recents.products);
          if (res.data.recents.invoices) setInvoices(res.data.recents.invoices);
          if (res.data.recents.purchases) setPurchases(res.data.recents.purchases);
          if (res.data.recents.leads) setLeads(res.data.recents.leads);

          // ✅ normalize quotations
          if (res.data.recents.quotations) {
            const normalized = res.data.recents.quotations.map((q) => ({
              ...q,
              displayNo: q.quoNo || "-",
              displayCustomer:
                q.type === "auto"              
                  ? q.customer?.name || "-"
                  : q.customer?.name || q.customer?.name || "-",
              displayDate: new Date(q.date || q.createdAt).toLocaleDateString(),
              displayTotal: `AU$ ${(q.grandTotal || 0).toFixed(2)}`,
              displayStatus: q.status || "Draft",
              displayType: q.type === "manual" ? "Manual" : "Auto",
            }));
            setQuotations(normalized);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load summary", err);
        setError("Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);



  const cards = [
    {
      title: "Customers",
      value: summary.customers,
      icon: <FaUsers className="text-lg" />,
      color: "from-indigo-500 to-purple-600",
      path: "/customers",
    },
    {
      title: "Invoices",
      value: summary.invoices,
      icon: <FaFileAlt className="text-lg" />,
      color: "from-blue-500 to-cyan-600",
      path: "/invoices",
    },
    {
      title: "Quotations",
      value: summary.quotations,
      icon: <FaFileAlt className="text-lg" />,
      color: "from-green-500 to-emerald-600",
      path: "/quotations",
    },
    {
      title: "Products",
      value: summary.products,
      icon: <FaShoppingCart className="text-lg" />,
      color: "from-pink-500 to-rose-600",
      path: "/inventory",
    },
  ];

  return (
    <div className="p-6 space-y-12 bg-gradient-to-br min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-indigo-700 drop-shadow-md">
        📊 Dashboard
      </h1>

      {/* Loading & Error */}
      {loading && <p className="text-gray-500 italic">Loading summary…</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {/* Top Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-gray-700">{card.title}</h5>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.path);
                  }}
                  className="text-xs px-3 py-1 border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 transition"
                >
                  View All
                </button>
              </div>
              <div className="flex items-center mt-6">
                <div
                  className={`h-14 w-14 flex items-center justify-center rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg`}
                >
                  {card.icon}
                </div>
                <p className="ml-5 text-3xl font-extrabold text-gray-800">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Invoices */}
        <CardTable
          title="🧾 Recent Invoices"
          headers={["Invoice No.", "Customer", "Company Name", "Amount", "Status", "Action"]}
          rows={
            invoices.length > 0
              ? invoices.map((inv) => [
                inv.invoiceNo || "-",
                inv.customer?.name || inv.customerName || "-",
                inv.customerName || "-",
                `AU$ ${(inv.grandTotal || 0).toFixed(2)}`,
                <StatusBadge status={inv.status === "paid" ? "Paid" : "Unpaid"} />,
                <button onClick={() => navigate(`/invoices`)} className="text-indigo-600 underline text-xs">View</button>,
              ])
              : []
          }
        />

        {/* Quotations */}
        <CardTable
          title="📑 Recent Quotations"
          headers={[
            "Quotation No.",
            "Customer",
            "Quotation Date",
            "Amount",
            "Type",
            "Status",
            "Action",
          ]}
          rows={
            quotations.length > 0
              ? quotations.map((q) => [
                q.displayNo,
                q.displayCustomer,
                q.displayDate,
                q.displayTotal,
                q.displayType,  // ✅ show "Auto" or "Manual"
                <StatusBadge status={q.displayStatus} />,
                <button
                  onClick={() => navigate(`/quotations`)}
                  className="text-indigo-600 underline text-xs"
                >
                  View
                </button>,
              ])
              : []
          }

        />




        {/* Purchases */}
        <CardTable
          title="🛒 Recent Purchases"
          headers={[
            "Purchase No.",
            "Vendor",
            "Purchase Date",
            "Products",
            "Total",
            "Status",
            "Action",
          ]}
          rows={
            purchases.length > 0
              ? purchases.map((p) => [
                p.purchaseNo || "-",
                p.vendor?.name || "-", // ✅ vendor name
                new Date(p.date).toLocaleDateString(),
                p.items?.map((it) => it.product?.name).join(", ") || "-", // ✅ product names
                `AU$ ${(p.grandTotal || 0).toFixed(2)}`,
                <StatusBadge status={p.status} />,
                <button onClick={() => navigate(`/purchases`)} className="text-indigo-600 underline text-xs">View</button>,
              ])
              : []
          }
        />



        {/* Leads */}
        <CardTable
          title="📌 Recent Leads"
          headers={[
            "Sr. No.",
            "Customer",
            "Company Name",
            "Mobile No.",
            "Description",
            "Email",
            "Status",
            "Action",
          ]}
          rows={
            leads.length > 0
              ? leads.map((lead, idx) => [
                idx + 1,
                lead.name || "-",
                lead.companyName || "-",
                lead.phone || lead.mobile || "-",
                lead.description || lead.details || "-",
                lead.email || "-",
                <StatusBadge status={lead.status || "New"} />,
                <button onClick={() => navigate(`/leads`)} className="text-indigo-600 underline text-xs">View</button>,
              ])
              : []
          }
        />
      </div>

      {/* Inventory Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
        <div className="flex justify-between items-center mb-6">
          <h5 className="font-semibold text-2xl text-indigo-700 flex items-center gap-2">
            📦 Inventory
          </h5>
          <button onClick={() => navigate("/inventory")} className="text-xs px-3 py-1 border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border">
          <table className="table-auto w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white sticky top-0 z-10">
              <tr>
                {["Sr. No.", "Product Name", "Product Type", "Quantity", "No. of Boxes", "Price"].map(
                  (head, idx) => (
                    <th key={idx} className="px-4 py-2 font-semibold">
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((item, idx) => (
                  <tr
                    key={item._id}
                    className={`border-t hover:bg-indigo-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-2 text-gray-600">{item.productType}</td>
                    <td className="px-4 py-2 text-indigo-700 font-semibold">{item.quantity}</td>
                    <td className="px-4 py-2">{item.boxes}</td>
                    <td className="px-4 py-2 text-green-600 font-bold">AU$ {item.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable CardTable Component */
function CardTable({ title, headers, rows }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-semibold text-lg text-indigo-700">{title}</h5>
        <button className="text-xs px-3 py-1 border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 transition">
          View All
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto">
        <table className="table-auto w-full text-sm text-left border-collapse">
          <thead className="bg-indigo-50 text-indigo-700 sticky top-0 z-10">
            <tr>
              {headers.map((head, idx) => (
                <th key={idx} className="px-4 py-2 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  {row.map((cell, i) => (
                    <td key={i} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-4 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 Status Badge */
function StatusBadge({ status }) {
  const colors = {
    Paid: "bg-green-100 text-green-700 border-green-300",
    Unpaid: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Overdue: "bg-red-100 text-red-700 border-red-300",
    Sent: "bg-blue-100 text-blue-700 border-blue-300",
    New: "bg-purple-100 text-purple-700 border-purple-300",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full border ${colors[status] || "bg-gray-100 text-gray-600 border-gray-300"
        }`}
    >
      {status}
    </span>
  );
}
