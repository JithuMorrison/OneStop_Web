# Login Redirect Fix

## Problem

After clicking login, the user was not being redirected to the dashboard. The login was successful (JWT token and user data were stored in localStorage), but the navigation wasn't working.

## Root Cause

The issue was that `App.jsx` maintains authentication state (`isAuthenticated` and `user`) that is only initialized on component mount. When the user logs in from the `Login.jsx` component:

1. Login succeeds and stores token/user in localStorage
2. Login component calls `navigate('/student/dashboard')`
3. React Router navigates to the dashboard route
4. But `App.jsx` still has `isAuthenticated = false` in its state
5. The protected route sees `isAuthenticated = false` and redirects back to `/login`

This created a redirect loop where the user couldn't access the dashboard even though they were technically logged in.

## Solution

Implemented a two-part fix:

### 1. App.jsx - Listen for Login Events

Updated `App.jsx` to listen for custom 'login' events and re-check authentication:

```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();

  // Listen for custom login event
  const handleLoginEvent = () => {
    checkAuth();
  };

  window.addEventListener("login", handleLoginEvent);

  return () => {
    window.removeEventListener("login", handleLoginEvent);
  };
}, []);
```

### 2. Login.jsx - Dispatch Login Event

Updated `Login.jsx` to dispatch a custom 'login' event after successful authentication:

```javascript
try {
  const { user } = await authService.login(email, password);

  // Dispatch custom login event to notify App.jsx to update auth state
  window.dispatchEvent(new Event("login"));

  // Wait a bit for App.jsx to update state before navigating
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Navigate based on role
  if (user.role === "admin") {
    navigate("/admin/dashboard", { replace: true });
  } else if (user.role === "teacher") {
    navigate("/teacher/dashboard", { replace: true });
  } else {
    navigate("/student/dashboard", { replace: true });
  }
} catch (err) {
  setError(err.message || "Login failed. Please try again.");
}
```

## How It Works

1. User enters credentials and clicks "Log In"
2. `authService.login()` is called, which stores token and user in localStorage
3. Login component dispatches a custom 'login' event
4. App.jsx's event listener catches the event and calls `checkAuth()`
5. `checkAuth()` reads from localStorage and updates `isAuthenticated` and `user` state
6. After a 100ms delay (to ensure state update completes), navigation occurs
7. Protected route now sees `isAuthenticated = true` and allows access to dashboard

## Alternative Solutions Considered

### 1. Context API (Better long-term solution)

Create an AuthContext that wraps the entire app and provides authentication state and functions. This would eliminate the need for events.

**Pros:**

- Cleaner architecture
- No need for custom events
- Easier to test

**Cons:**

- Requires more refactoring
- Would be implemented in Task 5.1 (Create UserContext)

### 2. Page Reload

Simply reload the page after login with `window.location.reload()`.

**Pros:**

- Simplest solution
- Guaranteed to work

**Cons:**

- Poor user experience (page flash)
- Loses any in-memory state
- Slower than state update

### 3. Callback Props

Pass authentication functions down as props from App.jsx to Login.

**Pros:**

- React-native solution
- No events needed

**Cons:**

- Prop drilling
- Harder to maintain with deep component trees

## Testing

To test the fix:

1. Start both servers:

   - Backend: `node backend.cjs` (port 5000)
   - Frontend: `npm run dev` (port 5173)

2. Navigate to http://localhost:5173

3. Register a new account or use existing credentials

4. Click "Log In"

5. Should successfully redirect to the appropriate dashboard based on role:
   - Student → `/student/dashboard`
   - Teacher → `/teacher/dashboard`
   - Admin → `/admin/dashboard`

## Future Improvements

When implementing Task 5.1 (Create UserContext), consider:

1. Creating an `AuthContext` that provides:

   - `user` state
   - `isAuthenticated` state
   - `login()` function
   - `logout()` function
   - `register()` function

2. Wrapping the entire app with `AuthProvider`

3. Using `useAuth()` hook in components instead of calling `authService` directly

4. This will eliminate the need for custom events and make the authentication flow more React-idiomatic

## Files Modified

1. `src/App.jsx` - Added event listener for 'login' event
2. `src/pages/auth/Login.jsx` - Dispatch 'login' event after successful authentication
