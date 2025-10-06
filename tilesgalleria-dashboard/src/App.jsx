import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";

import Quotations from "./pages/Quotations/Quotations";
import AddQuotations from "./pages/Quotations/add-quotations";
import AddQuotationsManual from "./pages/Quotations/add-quotations-manual";
import EditQuotation from "./pages/Quotations/edit-quotation";
import ViewQuotation from "./pages/Quotations/ViewQuotation";


import DeliveryNote from "./pages/DeliveryNote/DeliveryNote";
import AddChalan from "./pages/DeliveryNote/add-chalan";

import Invoices from "./pages/Invoices/Invoices";
import CreateInvoiceManual from "./pages/Invoices/create-inovice-manual";
import CreateInvoiceNew from "./pages/Invoices/create-invoice-new";
import ViewInvoice from "./pages/Invoices/ViewInvoice";
import EditInvoice from "./pages/Invoices/EditInvoice";

import Purchases from "./pages/Purchases/Purchases";
import AddPurchases from "./pages/Purchases/AddPurchases";
import EditPurchase from "./pages/Purchases/EditPurchase";
import ViewPurchase from "./pages/Purchases/ViewPurchase";
import PrePurchases from "./pages/PrePurchases/PrePurchases";

import Inventory from "./pages/Inventory/Inventory";
import Category from "./pages/Category/Category"
import AddProducts from "./pages/Inventory/AddProducts";
import EditProduct from "./pages/Inventory/EditProduct";

import Customers from "./pages/Customers/Customers";
import AddCustomer from "./pages/Customers/AddCustomer";
import EditCustomer from "./pages/Customers/edit_customer";

import Vendors from "./pages/Vendors/Vendors";
import Expenses from "./pages/Expenses/Expenses";
import Settings from "./pages/Settings/Settings";
import ShippingAddress from "./pages/ShippingAddress/ShippingAddress";

import Leads from "./pages/Leads/Leads";
import EditLead from "./pages/Leads/edit-lead";


export default function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/quotations" element={<Quotations />} />
          <Route path="/add-quotations" element={<AddQuotations />} />
          <Route path="/add-quotations-manual" element={<AddQuotationsManual />} />
          <Route path="/edit-quotation/:id" element={<EditQuotation />} />
          <Route path="/view-quotation/:id" element={<ViewQuotation />} />

          <Route path="/delivery-note" element={<DeliveryNote />} />
          <Route path="/add-delivery-note" element={<AddChalan />} />

          <Route path="/invoices" element={<Invoices />} />
          <Route path="/create-invoice-manual" element={<CreateInvoiceManual />} />
          <Route path="/create-invoice" element={<CreateInvoiceNew />} />
          <Route path="/view-invoice/:id" element={<ViewInvoice />} />
          <Route path="/view-manual-invoice/:id" element={<ViewInvoice />} />
          <Route path="/edit-invoice/:id" element={<EditInvoice type="normal" />} />
          <Route path="/edit-manual-invoice/:id" element={<EditInvoice type="manual" />} />

          <Route path="/purchases" element={<Purchases />} />
          <Route path="/add-purchases" element={<AddPurchases />} />
          <Route path="/edit-purchase/:id" element={<EditPurchase />} />
          <Route path="/view-purchase/:id" element={<ViewPurchase />} />
          <Route path="/pre-purchases" element={<PrePurchases />} />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/category" element={<Category/>} />
          <Route path="/add-products" element={<AddProducts />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />

          <Route path="/vendors" element={<Vendors />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shipping-address" element={<ShippingAddress />} />

          <Route path="/leads" element={<Leads />} />
          <Route path="/edit-lead/:id" element={<EditLead />} />


        </Route>
      </Routes>
    </Router>
  );
}
