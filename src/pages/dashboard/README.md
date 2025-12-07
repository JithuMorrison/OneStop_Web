# Dashboard Pages

This directory contains role-based dashboard pages for the SSN Connect Portal.

## Components

### StudentDashboard.jsx

**Requirements: 3.1, 3.2, 3.3, 3.4, 3.5**

Student-focused dashboard with:

- Quick links to all campus sections (Clubs, Announcements, Posts, Materials, OD Claims, Events, Tools, Messages)
- Current daily streak count display
- Upcoming events from calendar
- Followed announcements and posts feed
- Badges and achievements showcase
- Statistics cards (streak, badges, achievements, events)

**Key Features:**

- Personalized welcome message
- Visual streak counter with fire gradient
- Quick access grid with icon-based navigation
- Upcoming events timeline
- Recent achievements display
- Followed content feeds (announcements and posts)

### TeacherDashboard.jsx

**Requirements: 4.1, 4.2, 4.3, 4.4**

Teacher-focused dashboard with administrative tools:

- Pending OD claims count (highlighted)
- Administrative tools grid (Exam Schedules, OD Approvals, Announcements, Events)
- Upcoming events created by teacher
- Recent announcements created by teacher
- Statistics cards (pending ODs, total ODs, events, announcements)

**Key Features:**

- Prominent pending OD claims alert
- Quick action buttons for creating exam schedules, announcements, and events
- Teacher-specific event filtering
- OD claim management shortcuts
- Statistics tracking for teacher activities

### AdminDashboard.jsx

**Requirements: 5.1, 5.2, 5.3, 5.4**

Admin-focused dashboard with system management:

- Total user counts by role (students, teachers, admins)
- Pending queries count (highlighted)
- System management tools (Clubs, Portals, Tools, User Roles, Queries, Create Teacher)
- Recent queries list with status indicators
- Content statistics (announcements, clubs, portals, tools)

**Key Features:**

- Comprehensive user statistics
- Pending queries alert banner
- System management tool grid
- Recent queries feed with status badges
- Quick action buttons for creating clubs, portals, and tools
- Content statistics overview

## API Endpoints Used

### Student Dashboard

- `GET /api/user/:id` - Fetch user data including streak
- `GET /api/events/upcoming` - Fetch upcoming events
- `GET /api/announcements/followed` - Fetch followed announcements
- `GET /api/posts/followed` - Fetch followed posts

### Teacher Dashboard

- `GET /api/od-claims/teacher/:teacherId?status=pending` - Fetch pending OD claims
- `GET /api/od-claims/teacher/:teacherId` - Fetch all OD claims
- `GET /api/events/teacher/:teacherId` - Fetch teacher's events
- `GET /api/announcements/user/:userId` - Fetch teacher's announcements

### Admin Dashboard

- `GET /api/admin/users` - Fetch all users with role counts
- `GET /api/queries?status=pending` - Fetch pending queries
- `GET /api/queries` - Fetch all queries
- `GET /api/clubs` - Fetch all clubs
- `GET /api/portals` - Fetch all portals
- `GET /api/tools` - Fetch all tools
- `GET /api/announcements` - Fetch all announcements

## Usage

Import and use in routing:

```jsx
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import TeacherDashboard from './pages/dashboard/TeacherDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';

// In routes
<Route path="/dashboard/student" element={<StudentDashboard />} />
<Route path="/dashboard/teacher" element={<TeacherDashboard />} />
<Route path="/dashboard/admin" element={<AdminDashboard />} />
```

## Dependencies

- React Router DOM (navigation)
- React Icons (FiIcons, FaIcons)
- UserContext (authentication and user data)

## Styling

All dashboards use Tailwind CSS with:

- Responsive grid layouts
- Card-based design system
- Gradient backgrounds for key metrics
- Hover effects and transitions
- Color-coded sections by feature type

## Notes

- All dashboards include loading states
- Error handling for failed API calls with fallback empty states
- Navigation integrated throughout for seamless user experience
- Role-based content filtering applied automatically
- Real-time data fetching on component mount
