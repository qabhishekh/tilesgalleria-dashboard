# Tilesgalleria Backend (Node + Express + MongoDB)

## Quick Start
```bash
cp .env.example .env
npm install
npm run dev
```
- Default port: `8080`
- Health check: `GET /api/health`

## Collections implemented
- Users (auth, roles)
- Customers
- Vendors
- Products (inventory fields)
- Invoices
- Quotations
- Purchases
- Leads
- Expenses
- Addresses (Shipping Address)

## Dashboard
`GET /api/dashboard/summary` returns counts and recent lists for your widgets.

## DataTables Support
Most list endpoints accept `start`, `length`, `search`, and `order[field,dir]` query params.
