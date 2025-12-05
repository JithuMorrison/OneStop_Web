# Technology Stack

## Frontend

- **Framework**: React 19 with React Router DOM for routing
- **Build Tool**: Vite 6 with HMR (Hot Module Replacement)
- **Styling**: Tailwind CSS 4 with Vite plugin
- **Icons**: React Icons
- **HTTP Client**: Axios for API calls

## Backend

- **Primary Database**: MongoDB
- **Legacy Backend**: Express.js with MongoDB (Mongoose ODM)
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Email**: Nodemailer for OTP and notifications
- **File Storage**: Supabase Storage buckets

## Development Tools

- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **Package Manager**: npm
- **Environment**: Node.js with ES modules

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)

# Build
npm run build        # Production build to dist/

# Preview
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint on all files
```

## Environment Variables

Required in `.env` file:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `MONGOURL` - MongoDB connection string (legacy)
- `JWT_SECRET` - JWT signing secret
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `PORT` - Backend server port (default: 5000)

## Architecture Notes

- Frontend uses Vite's `import.meta.env` for environment variables (must be prefixed with `VITE_`)
- Backend uses CommonJS (`backend.cjs`) while frontend uses ES modules
- Supabase client initialized in `src/services/supabaseClient.jsx`
- Service layer pattern for API interactions (see `src/services/`)
- RLS policies handle authorization at database level
- **All React code files use `.jsx` extension** (components, services, utilities, hooks, contexts)
