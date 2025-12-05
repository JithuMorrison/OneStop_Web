# Project Structure

## Root Files

- `index.html` - Entry HTML file
- `vite.config.js` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint flat config with React rules
- `backend.cjs` - Express.js backend server (CommonJS, legacy)
- `package.json` - Dependencies and scripts

## Source Directory (`src/`)

### Entry Points

- `main.jsx` - React app entry point with StrictMode
- `App.jsx` - Main app component with routing and authentication logic

### Pages (Top-level Components)

- `Login.jsx` - Authentication page
- `Dashboard.jsx` - Main student/teacher dashboard
- `admindash.jsx` - Admin dashboard
- `profile.jsx` - User profile page
- `search.jsx` - User search functionality
- `feed.jsx` - Social feed page
- `Networking.jsx` - Networking hub with nested routes
- `Materials.jsx` - Materials browsing and management
- `FileUpload.jsx` - File upload interface
- `cgpacalc.jsx` - CGPA calculator tool
- `timetable.jsx` - Timetable management

### Organized Directories

#### `src/services/`

Service layer for API interactions with Supabase and backend:

- `supabaseClient.jsx` - Supabase client initialization
- `authService.jsx` - Authentication operations
- `postService.jsx` - Post CRUD operations
- `announcementService.jsx` - Announcement management
- `materialService.jsx` - Material upload/retrieval
- `eventService.jsx` - Event management
- `clubService.jsx` - Club operations
- `odService.jsx` - OD claim workflows
- `notificationService.jsx` - Notification handling
- `queryService.jsx` - Query submission and responses
- `userService.jsx` - User profile operations

#### `src/components/`

Reusable React components (currently scaffolded):

- `forms/` - Form components
- `layout/` - Layout components (navigation, headers, etc.)
- `shared/` - Shared UI components

#### `src/pages/`

Page-level components organized by feature (currently scaffolded):

- `auth/` - Authentication pages
- `dashboard/` - Dashboard-specific pages
- `shared/` - Shared page components

#### `src/context/`

React Context providers for global state (currently scaffolded)

#### `src/hooks/`

Custom React hooks (currently scaffolded)

#### `src/utils/`

Utility functions and helpers (currently scaffolded)

### Styling

- `index.css` - Global styles and Tailwind directives
- `App.css` - App-specific styles

## Database (`supabase/ & MongoDB/`)

- `migrations/001_initial_schema.sql` - Complete database schema with tables, indexes, RLS policies, and triggers
- MongoDB is the main db, while supabase is only for image storing

## Conventions

### File Naming

- React components: PascalCase with `.jsx` extension (e.g., `Dashboard.jsx`, `FileUpload.jsx`)
- Services: camelCase with `Service` suffix and `.jsx` extension (e.g., `authService.jsx`)
- Utilities: camelCase with `.jsx` extension (e.g., `formatDate.jsx`)
- **All React-related code files must use `.jsx` extension, not `.js`**

### Component Organization

- Top-level pages in `src/` root (legacy pattern)
- New organized pages should go in `src/pages/`
- Reusable components in `src/components/`
- Keep components focused and single-responsibility

### Service Pattern

- All API calls go through service files (`.jsx` extension)
- Services export an object with methods
- Use async/await for all asynchronous operations
- Handle errors at service level and propagate to UI

### State Management

- Local state with `useState` for component-specific data
- Context API for shared state (to be implemented in `src/context/`)
- Authentication state managed in `App.jsx` with localStorage

### Routing

- React Router DOM v7 with declarative routes in `App.jsx`
- Protected routes check `isAuthenticated` state
- Role-based redirects (admin vs regular users)
