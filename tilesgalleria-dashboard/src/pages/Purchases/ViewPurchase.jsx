import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import image from "../../assets/logos/tiles-logo.png";

export default function ViewPurchase() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        const [purchaseRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/purchases/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPurchase(purchaseRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("❌ Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, token]);

  const getProductDetails = (item) => {
    if (item.product?._id) return item.product;
    return products.find((p) => p._id === item.product) || {};
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!purchase) return <div className="p-6 text-red-600">Purchase not found!</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header with Print + Back */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 no-print"
        >
          🖨 Print Purchase
        </button>
      </div>

      {/* ✅ Print root */}
      <div id="print-root" className="invoice-container bg-white rounded-lg shadow p-6">
        <header className="flex justify-between items-start border-b pb-4">
          <div className="logo">
            <img
              src={image}
              alt="Logo"
              style={{ maxWidth: "150px" }}
            />
          </div>
          <div className="text-right">
            <p className="font-bold">TILES GALLERIA AUSTRALIA PTY LTD</p>
            <p>33 First Avenue Kilkenny, SA 5009</p>
            <p>ABN No: 91 672 836 038</p>
          </div>
        </header>

        {/* Customer & Purchase Info */}
        <section className="flex justify-between mt-6">
          <div>
            <p className="font-semibold">Customer Address:</p>
            <p>{purchase.vendor?.name || "N/A"}</p>
            <p>{purchase.vendor?.address || "-"}</p>
          </div>
          <div className="text-right">
            <p>
              <strong>Purchase #:</strong> {purchase.purchaseNo || "-"}
            </p>
            <p>
              Pu. Date: {new Date(purchase.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </section>

        {/* Product Table */}
        <section className="mt-6">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Product Name</th>
                <th className="border p-2">Image</th>
                <th className="border p-2">No. of Boxes</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items?.length > 0 ? (
                purchase.items.map((item, i) => {
                  const prod = getProductDetails(item);
                  return (
                    <tr key={i}>
                      <td className="border p-2">
                        <p className="text-sm text-gray-600">{prod.name || "-"}</p>
                        <p className="text-sm text-gray-600">Type: {item.productType || prod.productType || "-"}</p>
                        <p className="text-sm text-gray-600">Texture: {prod.texture || "-"}</p>
                        <p className="text-sm text-gray-600">Size: {prod.size || "-"}</p>
                      </td>
                      <td className="border p-2 text-center">
                        {prod.image ? (
                          <img
                            src={
                              prod.image.startsWith("http")
                                ? prod.image
                                : `http://localhost:8080/uploads/${prod.image}`
                            }
                            alt={prod.name}
                            className="h-12 w-12 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="border p-2 text-center">{item.boxes || "-"}</td>
                      <td className="border p-2 text-center">{item.qty || "-"}</td>
                      <td className="border p-2 text-right">
                        AU$ {item.purchasePrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="border p-2 text-right">
                        AU$ {item.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Totals Section */}
        <div className="flex justify-between mt-6">
          <div>
            <p className="mt-2 font-semibold">Please pay to:</p>
            <p>TILES GALLERIA AUSTRALIA PTY LTD</p>
            <p>BSB No: 162095161</p>
            <p>Account No: 015356</p>
          </div>

          <table className="text-right border-collapse">
            <tbody>
              <tr>
                <td className="px-4 py-1">Sub Total:</td>
                <td>AU$ {purchase.subTotal?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">Discount:</td>
                <td>- AU$ {purchase.discount?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">After Discount:</td>
                <td>AU$ {purchase.amountAfterDiscount?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">GST (10%):</td>
                <td>AU$ {purchase.gst?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">Shipping Charge:</td>
                <td>AU$ {purchase.shippingCharge?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr className="font-bold border-t">
                <td className="px-4 py-1">Total:</td>
                <td>AU$ {purchase.grandTotal?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">Advance Paid:</td>
                <td>AU$ {purchase.advance?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td className="px-4 py-1">Balance Due:</td>
                <td>AU$ {purchase.balance?.toFixed(2) || "0.00"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
