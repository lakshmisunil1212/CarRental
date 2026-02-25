# RentMyRide - Quick Reference Guide

## Login Options

### Customer Login
- **URL:** `/auth/login/customer`
- **Theme:** Sky Blue
- **Default Role:** user
- **Redirects to:** Home (`/`) on success

### Admin Login
- **URL:** `/auth/login/admin`
- **Theme:** Orange
- **Default Role:** admin
- **Redirects to:** Admin Dashboard (`/admin`) on success

---

## Route Access Matrix

| Route | Public | Customer | Admin | Notes |
|-------|--------|----------|-------|-------|
| `/` | ✅ | ✅ | ✅ | Home page |
| `/cars` | ✅ | ✅ | ✅ | Browse cars |
| `/cars/:id` | ✅ | ✅ | ✅ | Car details |
| `/booking` | ✅ | ✅ | ✅ | Create booking |
| `/booking/checkout` | ✅ | ✅ | ✅ | Checkout page |
| `/auth/login` | ✅ | ✅ | ✅ | Login selector |
| `/auth/login/customer` | ✅ | - | - | Customer login |
| `/auth/login/admin` | ✅ | - | - | Admin login |
| `/auth/register` | ✅ | - | - | Register as customer |
| `/profile` | ❌ | ✅ | ❌ | Customer profile |
| `/bookings` | ❌ | ✅ | ❌ | My bookings |
| `/help` | ✅ | ✅ | ✅ | FAQ & Help |
| `/terms` | ✅ | ✅ | ✅ | Terms & Conditions |
| `/privacy` | ✅ | ✅ | ✅ | Privacy Policy |
| `/admin` | ❌ | ❌ | ✅ | Admin dashboard |
| `/admin/cars` | ❌ | ❌ | ✅ | Manage fleet |
| `/admin/cars/new` | ❌ | ❌ | ✅ | Add car |
| `/admin/cars/:id/edit` | ❌ | ❌ | ✅ | Edit car |
| `/admin/bookings` | ❌ | ❌ | ✅ | Manage bookings |
| `/admin/reports` | ❌ | ❌ | ✅ | Analytics |
| `/unauthorized` | ✅ | ✅ | ✅ | Access denied |
| `/404` | ✅ | ✅ | ✅ | Not found |

---

## Features by Role

### 🛍️ Customer Features
- Browse available cars
- View car details and specifications
- Create new bookings
- Complete checkout
- View their bookings
- Manage profile
- Access help and support

### 👨‍💼 Admin Features
- All customer features
- Add/edit/delete cars from fleet
- View all customer bookings
- Filter and manage booking statuses
- View business analytics
- Check revenue reports
- Analyze vehicle utilization
- See top customers

---

## Common User Tasks

### How to Access as Customer
1. Go to `/auth/login`
2. Click "Customer" option
3. Enter email and password
4. Redirected to home page
5. Can now see "Profile" and "Bookings" in nav menu

### How to Access as Admin
1. Go to `/auth/login`
2. Click "Admin / Rental Agent" option
3. Enter email and password
4. Redirected to admin dashboard
5. Can now see admin icon (🔧) in nav menu

### What Happens If Wrong Access
- Try to access admin page as customer → Redirect to `/unauthorized`
- Try to access customer profile as admin → Redirect to `/unauthorized`
- Try to access protected page without login → Redirect to `/auth/login`

---

## Component Details

### ProtectedRoute
**Purpose:** Validate user role before rendering protected pages
**Usage:**
```jsx
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```
**Behavior:**
- If not logged in → Redirects to `/auth/login`
- If logged in but wrong role → Redirects to `/unauthorized`
- If correct role → Renders component

### Navigation Badge
- Admin users see orange admin icon in header
- Clicking it goes to `/admin`
- Customers don't see this icon

---

## Styling & Colors

### Login Pages
- **Customer:** Sky Blue (#0EA5E9)
- **Admin:** Orange (#EA580C)

### Components
- **Cards:** White with slate borders
- **Primary Action:** Sky Blue for customer, Orange for admin
- **Status Indicators:**
  - Confirmed: Emerald Green
  - Pending: Amber Yellow
  - Cancelled: Red

---

## Test Credentials (Demo)

Since this uses mock auth with localStorage, you can:
1. Register with any email at `/auth/register` (creates customer account)
2. Use that email to login at `/auth/login/customer`
3. For admin, use same process at `/auth/login/admin` (creates admin account)

---

## Important Files

### Critical Files
- `client/src/App.jsx` - Route configuration
- `client/src/components/ProtectedRoute.jsx` - Access control
- `client/src/layouts/MainLayout.jsx` - Navigation
- `server/routes/auth.js` - Authentication backend

### Page Files
- `client/src/pages/Auth/LoginSelector.jsx`
- `client/src/pages/Auth/CustomerLogin.jsx`
- `client/src/pages/Auth/AdminLogin.jsx`
- `client/src/pages/Admin/Bookings.jsx`
- `client/src/pages/Admin/Reports.jsx`
- `client/src/pages/Unauthorized.jsx`

---

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Access Denied" | Wrong role | Use correct login type or ask for account upgrade |
| "No token provided" | Not logged in | Login at `/auth/login` |
| "Invalid token" | Session expired | Login again |
| "Email already registered" | Account exists | Use different email or login instead |

---

## Customization Guide

### Change Login Colors
Edit `CustomerLogin.jsx` and `AdminLogin.jsx`:
- Replace `sky` with `indigo`, `cyan`, etc.
- Replace `orange` with `amber`, `red`, etc.

### Change Role Names
- Update in `User.js` model enum
- Update in auth routes
- Update in ProtectedRoute logic
- Update in component strings

### Add New Admin Routes
1. Create page component
2. Add import to `App.jsx`
3. Add route with `<ProtectedRoute requiredRole="admin">`
4. Add link in admin dashboard

### Add New Customer Routes
1. Create page component
2. Add import to `App.jsx`
3. Add route with `<ProtectedRoute requiredRole="user">`
4. Add link in customer nav

---

Last Updated: February 25, 2026
