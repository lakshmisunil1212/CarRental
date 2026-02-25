# RentMyRide - Role-Based Access Control Implementation

## Overview
This document outlines the complete implementation of role-based access control (RBAC) for the RentMyRide car rental application. The system now supports two distinct user roles: **Customer (user)** and **Admin/Rental Agent (admin)**.

---

## User Roles & Permissions

### 1. **Customer Role (user)**
- **Can Access:**
  - Home page (`/`)
  - Browse cars (`/cars`, `/cars/:id`)
  - Create bookings (`/booking`, `/booking/checkout`)
  - View profile (`/profile`)
  - View my bookings (`/bookings`)
  - Help & FAQ, Terms, Privacy pages
  
- **Cannot Access:**
  - Admin dashboard
  - Car management (create/edit/delete)
  - Booking management
  - Reports & Analytics

### 2. **Admin Role (admin)**
- **Can Access:**
  - All customer-accessible pages
  - Admin dashboard (`/admin`)
  - Fleet management (`/admin/cars`, `/admin/cars/new`, `/admin/cars/:id/edit`)
  - Booking management (`/admin/bookings`)
  - Reports & Analytics (`/admin/reports`)
  
- **Cannot Access (Restricted):**
  - Customer profile (different dashboard)
  - Other customers' bookings except through admin panel

---

## New/Updated Components & Pages

### Components Created:
1. **ProtectedRoute.jsx** - Route protection component
   - Location: `client/src/components/ProtectedRoute.jsx`
   - Validates user authentication and role
   - Redirects to login if not authenticated
   - Redirects to unauthorized page if wrong role

### Pages Created:
1. **LoginSelector.jsx** (`/auth/login`)
   - Landing page for login type selection
   - Options: Customer Login, Admin Login
   - Beautiful card-based UI design
   - Location: `client/src/pages/Auth/LoginSelector.jsx`

2. **CustomerLogin.jsx** (`/auth/login/customer`)
   - Customer-specific login page
   - Sky-blue themed UI
   - Auto-fills role as "user"
   - Location: `client/src/pages/Auth/CustomerLogin.jsx`

3. **AdminLogin.jsx** (`/auth/login/admin`)
   - Admin/Rental agent login page
   - Orange-themed UI
   - Auto-fills role as "admin"
   - Location: `client/src/pages/Auth/AdminLogin.jsx`

4. **AdminBookings.jsx** (`/admin/bookings`)
   - View and manage all customer bookings
   - Filter by status (pending, confirmed, completed, cancelled)
   - Statistics dashboard
   - Location: `client/src/pages/Admin/Bookings.jsx`

5. **AdminReports.jsx** (`/admin/reports`)
   - Analytics and reporting dashboard
   - Revenue tracking
   - Vehicle utilization metrics
   - Top customer analysis
   - Location: `client/src/pages/Admin/Reports.jsx`

6. **Unauthorized.jsx** (`/unauthorized`)
   - Access denied page
   - Displays when user tries to access restricted role content
   - Options to go back, navigate to dashboard, or logout
   - Location: `client/src/pages/Unauthorized.jsx`

### Pages Updated:
1. **Register.jsx** (`/auth/register`)
   - Enhanced form with validation
   - Beautiful styled layout matching auth pages
   - Auto-registers users as customers (role: "user")
   - Location: `client/src/pages/Auth/Register.jsx`

2. **Help/index.jsx** (`/help`)
   - Comprehensive FAQ section
   - Contact methods (phone, email, live chat, hours)
   - Beautiful card-based design
   - Expandable FAQ items
   - Location: `client/src/pages/Help/index.jsx`

3. **Terms.jsx** (`/terms`)
   - 8 detailed sections covering terms and conditions
   - Professional legal document styling
   - Warning notice for demo
   - Location: `client/src/pages/Terms.jsx`

4. **Privacy.jsx** (`/privacy`)
   - 8 detailed sections covering privacy policy
   - Data protection information
   - User rights information
   - Professional styling with icons
   - Location: `client/src/pages/Privacy.jsx`

5. **Admin/Dashboard.jsx**
   - Updated menu items to link to new pages
   - Links to `/admin/bookings` and `/admin/reports`
   - Location: `client/src/pages/Admin/Dashboard.jsx`

6. **MainLayout.jsx**
   - Admin link now conditional (only shows for admins)
   - Different styling based on user role
   - Location: `client/src/layouts/MainLayout.jsx`

---

## Protected Routes Implementation

### Route Protection in App.jsx:
```jsx
// Customer Routes (Protected)
<Route path="/profile" element={<ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute>} />
<Route path="/bookings" element={<ProtectedRoute requiredRole="user"><MyBookings /></ProtectedRoute>} />

// Admin Routes (Protected)
<Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/cars" element={<ProtectedRoute requiredRole="admin"><AdminCars /></ProtectedRoute>} />
<Route path="/admin/cars/new" element={<ProtectedRoute requiredRole="admin"><AdminCarCreate /></ProtectedRoute>} />
<Route path="/admin/cars/:id/edit" element={<ProtectedRoute requiredRole="admin"><AdminCarEdit /></ProtectedRoute>} />
<Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
<Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
```

---

## Backend Authentication Updates

### Updated Routes in `server/routes/auth.js`:

1. **POST /auth/register**
   - Now accepts optional `role` parameter
   - Defaults to "user" role (secure by default)
   - Only allows admin role creation through specific means

2. **POST /auth/login**
   - Now accepts optional `role` parameter
   - Validates that user's role matches the login type
   - Returns 403 error if role mismatch
   - Returns user info including role

3. **GET /auth/verify** (New)
   - Verifies JWT token validity
   - Returns user information including role
   - Can be used on page refresh to persist login

---

## Navigation Changes

### Header Navigation (MainLayout):
- **For Customers:**
  - Cars, Booking, Help (standard nav)
  - No Admin dashboard icon
  - Profile dropdown with: My Profile, My Bookings, Logout

- **For Admins:**
  - Cars, Booking, Help (standard nav)
  - Admin dashboard icon (orange) in navbar
  - Profile options may differ

---

## File Structure Summary

### New Files Created:
```
client/src/
├── components/
│   └── ProtectedRoute.jsx (NEW)
├── pages/
│   ├── Auth/
│   │   ├── LoginSelector.jsx (NEW)
│   │   ├── CustomerLogin.jsx (NEW)
│   │   └── AdminLogin.jsx (NEW)
│   ├── Admin/
│   │   ├── Bookings.jsx (NEW)
│   │   └── Reports.jsx (NEW)
│   └── Unauthorized.jsx (NEW)
```

### Modified Files:
```
client/src/
├── App.jsx (Updated routes & imports)
├── pages/
│   ├── Auth/
│   │   └── Register.jsx (Enhanced)
│   ├── Help/
│   │   └── index.jsx (Completely redesigned)
│   ├── Terms.jsx (Completely redesigned)
│   └── Privacy.jsx (Completely redesigned)
├── layouts/
│   └── MainLayout.jsx (Role-based nav)
└── pages/Admin/
    └── Dashboard.jsx (Updated links)

server/
├── routes/
│   └── auth.js (Role validation & /verify endpoint)
```

---

## User Flow Diagrams

### Authentication Flow:
```
Start → /auth/login (LoginSelector)
  ├─ [Customer] → /auth/login/customer (CustomerLogin)
  │   └─ Success → / (Home - customer dashboard)
  │
  └─ [Admin] → /auth/login/admin (AdminLogin)
      └─ Success → /admin (Admin Dashboard)
```

### Access Control Flow:
```
User accesses protected route →
  ├─ Not logged in? → Redirect to /auth/login
  ├─ Logged in but wrong role? → Redirect to /unauthorized
  └─ Correct role? → Load page
```

---

## Testing Checklist

- [ ] Customer can register and login as user role
- [ ] Admin can login as admin role
- [ ] Customer cannot access /admin routes
- [ ] Admin can access all /admin routes
- [ ] Customer can access /profile and /bookings
- [ ] Admin cannot access /profile (shows unauthorized)
- [ ] Nav admin icon only shows for admins
- [ ] Logout works and redirects properly
- [ ] All new pages (Help, Terms, Privacy) load correctly
- [ ] Unauthorized page displays properly with correct role info
- [ ] Reports page shows analytics correctly
- [ ] Bookings page shows all bookings with filters
- [ ] Back buttons work across new pages

---

## Security Considerations

1. **Role Validation:** Role is validated on both frontend (ProtectedRoute) and backend (auth routes)
2. **Token Storage:** JWT stored in localStorage (consider httpOnly cookies in production)
3. **Session Persistence:** Role persists in localStorage until logout
4. **Authorization Checks:** Backend should validate role for all admin API endpoints

---

## Future Enhancements

1. Add more granular permissions (e.g., "view_reports", "edit_cars", "manage_users")
2. Implement JWT refresh tokens
3. Add email verification for new registrations
4. Add password reset functionality
5. Add two-factor authentication for admins
6. Implement audit logging for admin actions
7. Add role-based API rate limiting
8. Create admin user management page

---

## Production Deployment Notes

Before deploying to production:
1. Replace mock localStorage auth with real JWT tokens
2. Update Terms.jsx and Privacy.jsx with actual legal content
3. Configure HTTPS for all auth endpoints
4. Implement backend role validation on all protected endpoints
5. Add CORS configuration for API
6. Set httpOnly flag on authentication cookies
7. Implement rate limiting on auth endpoints
8. Add email verification for new accounts
9. Add admin approval workflow for new admins
10. Implement proper error handling and logging

---

Last Updated: February 25, 2026
