# Design Document

## Overview

SSN Connect is a unified campus portal built with React and Supabase, providing role-based access to campus activities, content sharing, and communication features. The system follows a component-based architecture with direct Supabase integration from the frontend, eliminating the need for a separate backend API layer.

### Technology Stack

- **Frontend Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Supabase JS Client
- **File Storage**: Supabase Storage

### Key Design Principles

1. **Role-Based Access Control**: All features respect user roles (student, teacher, admin)
2. **Direct Database Access**: Frontend communicates directly with Supabase using Row Level Security (RLS)
3. **Component Reusability**: Shared UI components across different pages
4. **Real-time Updates**: Leverage Supabase real-time subscriptions for chat and notifications
5. **Responsive Design**: Mobile-first approach using Tailwind CSS
6. **Performance**: Lazy loading, code splitting, and optimized queries

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Context    │      │
│  │              │  │              │  │              │      │
│  │ - Auth       │  │ - Navbar     │  │ - UserCtx    │      │
│  │ - Dashboard  │  │ - Sidebar    │  │ - NotifCtx   │      │
│  │ - Shared     │  │ - Cards      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │    Services     │                        │
│                   │                 │                        │
│                   │ - Supabase      │                        │
│                   │ - Auth          │                        │
│                   │ - Data Access   │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    Supabase     │
                    │                 │
                    │ - PostgreSQL    │
                    │ - Auth          │
                    │ - Storage       │
                    │ - Real-time     │
                    └─────────────────┘
```

### Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── RightPanel.jsx
│   ├── shared/
│   │   ├── PostCard.jsx
│   │   ├── AnnouncementCard.jsx
│   │   ├── MaterialCard.jsx
│   │   ├── ClubCard.jsx
│   │   ├── NotificationBell.jsx
│   │   └── ChatPanel.jsx
│   └── forms/
│       ├── PostForm.jsx
│       ├── AnnouncementForm.jsx
│       └── MaterialForm.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboard/
│   │   ├── StudentDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── AdminDashboard.jsx
│   └── shared/
│       ├── Clubs.jsx
│       ├── Announcements.jsx
│       ├── Posts.jsx
│       ├── Materials.jsx
│       ├── Profile.jsx
│       ├── ODClaim.jsx
│       ├── CalendarEvents.jsx
│       ├── PortalsTools.jsx
│       ├── Query.jsx
│       └── CGPACalculator.jsx
├── context/
│   ├── UserContext.jsx
│   └── NotificationContext.jsx
├── services/
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── userService.js
│   ├── clubService.js
│   ├── announcementService.js
│   ├── postService.js
│   ├── materialService.js
│   ├── odService.js
│   ├── eventService.js
│   ├── queryService.js
│   └── notificationService.js
├── hooks/
│   ├── useAuth.js
│   ├── useNotifications.js
│   └── useRealtime.js
├── utils/
│   ├── roles.js
│   ├── emailValidation.js
│   ├── dateUtils.js
│   └── hashtagParser.js
├── App.jsx
├── routes.jsx
└── main.jsx
```

## Components and Interfaces

### Core Components

#### 1. Layout Components

**Navbar Component**

- Displays logo, search bar, notification bell, and profile menu
- Responsive design that collapses on mobile
- Search functionality for users and content
- Props: `user`, `notifications`, `onSearch`

**Sidebar Component**

- Role-based navigation links
- Collapsible on mobile devices
- Active link highlighting
- Props: `userRole`, `activePage`

**RightPanel Component**

- Toggleable chat panel
- Contact list and chat threads
- Real-time message updates
- Props: `isOpen`, `onToggle`, `userId`

#### 2. Shared UI Components

**PostCard Component**

- Displays post with image, title, description
- Like and comment functionality
- Share button with contact selection
- Props: `post`, `onLike`, `onComment`, `onShare`

**AnnouncementCard Component**

- Shows announcement with category badge
- Registration button if enabled
- Hashtag display and parsing
- Props: `announcement`, `onRegister`, `onLike`

**MaterialCard Component**

- Displays material with file/link preview
- Download or external link button
- Like and comment section
- Props: `material`, `onLike`, `onComment`

**ClubCard Component**

- Shows club logo, name, description
- Member list with roles
- Edit button for authorized users
- Props: `club`, `canEdit`, `onEdit`

#### 3. Form Components

**PostForm Component**

- Title, description, image upload
- Visibility selector (students only, teachers only, everyone)
- Hashtag input
- Props: `onSubmit`, `initialData`

**AnnouncementForm Component**

- Title, description, category selector
- Image upload and additional image links
- Hashtag input with format validation
- Registration toggle and custom fields
- Props: `onSubmit`, `userRole`

**MaterialForm Component**

- Title, description input
- File upload or link input
- Category selector
- Props: `onSubmit`

### Service Layer Interfaces

#### Authentication Service

```javascript
interface AuthService {
  // Register new user with role-based email validation
  register(userData: {
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'admin',
    rollNumber?: string,
    digitalId: string,
    department: string,
    joinYear: number,
    section?: string
  }): Promise<User>

  // Login user and return session
  login(email: string, password: string): Promise<Session>

  // Logout current user
  logout(): Promise<void>

  // Get current authenticated user
  getCurrentUser(): Promise<User | null>

  // Validate email format based on role
  validateEmail(email: string, role: string): boolean
}
```

#### User Service

```javascript
interface UserService {
  // Get user by ID
  getUserById(userId: string): Promise<User>

  // Update user profile
  updateProfile(userId: string, updates: Partial<User>): Promise<User>

  // Follow/unfollow user
  followUser(followerId: string, followedId: string): Promise<void>
  unfollowUser(followerId: string, followedId: string): Promise<void>

  // Update daily streak
  updateStreak(userId: string): Promise<number>

  // Award badge/achievement
  awardBadge(userId: string, badge: string): Promise<void>

  // Search users by email
  searchUserByEmail(email: string): Promise<User | null>
}
```

#### Club Service

```javascript
interface ClubService {
  // Create new club (admin only)
  createClub(clubData: {
    name: string,
    logo: string,
    description: string,
    subdomains?: string[],
    moderators: { email: string, role: string }[]
  }): Promise<Club>

  // Update club (moderators only)
  updateClub(clubId: string, updates: Partial<Club>): Promise<Club>

  // Get all clubs
  getAllClubs(): Promise<Club[]>

  // Check if user can edit club
  canEditClub(userId: string, clubId: string): Promise<boolean>
}
```

#### Announcement Service

```javascript
interface AnnouncementService {
  // Create announcement
  createAnnouncement(data: {
    title: string,
    description: string,
    category: string,
    image: File,
    additionalImages?: string[],
    hashtag: string,
    registrationEnabled: boolean,
    registrationFields?: string[]
  }): Promise<Announcement>

  // Get announcements with filters
  getAnnouncements(filters?: { category?: string }): Promise<Announcement[]>

  // Register for announcement
  registerForAnnouncement(announcementId: string, userId: string, data: any): Promise<void>

  // Get registrations (creator only)
  getRegistrations(announcementId: string): Promise<Registration[]>

  // Issue badges to participants
  issueBadges(announcementId: string, userIds: string[], badge: string): Promise<void>

  // Parse hashtag for calendar
  parseHashtag(hashtag: string): { type: string, name: string, startDate: Date, endDate: Date }
}
```

#### Post Service

```javascript
interface PostService {
  // Create post
  createPost(data: {
    title: string,
    description: string,
    image?: File,
    visibility: 'students' | 'teachers' | 'everyone',
    hashtags?: string[]
  }): Promise<Post>

  // Get posts based on user role
  getPosts(userRole: string, filters?: { hashtags?: string[] }): Promise<Post[]>

  // Share post with contacts
  sharePost(postId: string, contactIds: string[]): Promise<void>
}
```

#### Material Service

```javascript
interface MaterialService {
  // Upload material
  uploadMaterial(data: {
    title: string,
    description: string,
    file?: File,
    link?: string
  }): Promise<Material>

  // Get all materials
  getMaterials(): Promise<Material[]>

  // Share material
  shareMaterial(materialId: string, contactIds: string[]): Promise<void>
}
```

#### OD Service

```javascript
interface ODService {
  // Create OD claim (student)
  createODClaim(data: {
    eventId: string,
    teacherId: string,
    description: string
  }): Promise<ODClaim>

  // Get student's OD claims
  getStudentODClaims(studentId: string): Promise<ODClaim[]>

  // Get teacher's OD claims
  getTeacherODClaims(teacherId: string, status?: string): Promise<ODClaim[]>

  // Approve/reject OD claim (teacher)
  updateODStatus(odId: string, status: 'accepted' | 'rejected'): Promise<void>
}
```

#### Event Service

```javascript
interface EventService {
  // Create exam schedule (teacher)
  createExamSchedule(data: {
    examName: string,
    date: Date,
    year: number,
    semester: number,
    numberOfExams: number
  }): Promise<ExamSchedule>

  // Get events for date range
  getEvents(startDate: Date, endDate: Date): Promise<Event[]>

  // Get events for specific date
  getEventsForDate(date: Date): Promise<Event[]>
}
```

#### Notification Service

```javascript
interface NotificationService {
  // Create notification
  createNotification(data: {
    userId: string,
    type: 'like' | 'comment' | 'announcement' | 'od_status' | 'event_reminder' | 'message',
    content: string,
    relatedId?: string
  }): Promise<Notification>

  // Get user notifications
  getNotifications(userId: string): Promise<Notification[]>

  // Mark notification as read
  markAsRead(notificationId: string): Promise<void>

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): Subscription
}
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  name: string;
  role: "student" | "teacher" | "admin";
  email: string;
  rollNumber?: string; // 13 digits, students only
  digitalId: string; // 7 digits
  department: string;
  joinYear: number;
  section?: string;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  liked: string[]; // IDs of liked content
  registeredEvents: string[]; // event IDs
  badges: string[];
  streak: number;
  achievements: string[];
  posts: string[]; // post IDs
  announcements: string[]; // announcement IDs
  materials: string[]; // material IDs
  chats: string[]; // chat thread IDs
  contacts: string[]; // user IDs
  ods: string[]; // OD claim IDs
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Club Model

```typescript
interface Club {
  id: string;
  name: string;
  logo: string; // image URL
  description: string;
  subdomains?: string[];
  members: {
    userId: string;
    role: string;
  }[];
  moderators: {
    userId: string;
    type: "teacher" | "student";
  }[];
  worksDone: string[];
  createdBy: string; // admin user ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Announcement Model

```typescript
interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string; // URL
  additionalImages?: string[];
  hashtag: string; // #type_name_startDate_endDate
  createdBy: string; // user ID
  likes: number;
  likedBy: string[]; // user IDs
  comments: Comment[];
  registrationEnabled: boolean;
  registrationFields?: string[];
  registrations?: Registration[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Post Model

```typescript
interface Post {
  id: string;
  title: string;
  description: string;
  image?: string; // URL
  visibility: "students" | "teachers" | "everyone";
  hashtags?: string[];
  createdBy: string; // user ID
  likes: number;
  likedBy: string[]; // user IDs
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Material Model

```typescript
interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  externalLink?: string;
  uploadedBy: string; // user ID
  likes: number;
  likedBy: string[]; // user IDs
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Model

```typescript
interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
}
```

### ODClaim Model

```typescript
interface ODClaim {
  id: string;
  studentId: string;
  eventId: string;
  eventName: string;
  teacherId: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model

```typescript
interface Event {
  id: string;
  name: string;
  type: string; // from hashtag
  startDate: Date;
  endDate: Date;
  sourceType: "announcement" | "exam_schedule";
  sourceId: string;
  createdAt: Date;
}
```

### ExamSchedule Model

```typescript
interface ExamSchedule {
  id: string;
  examName: string;
  date: Date;
  year: number;
  semester: number;
  numberOfExams: number;
  createdBy: string; // teacher user ID
  createdAt: Date;
}
```

### ChatThread Model

```typescript
interface ChatThread {
  id: string;
  participants: string[]; // user IDs
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model

```typescript
interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}
```

### Notification Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type:
    | "like"
    | "comment"
    | "announcement"
    | "od_status"
    | "event_reminder"
    | "message";
  content: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}
```

### Query Model

```typescript
interface Query {
  id: string;
  title: string;
  description: string;
  submittedBy: string; // user ID
  submitterRole: "student" | "teacher";
  status: "pending" | "responded";
  response?: string;
  respondedAt?: Date;
  createdAt: Date;
}
```

### Portal Model

```typescript
interface Portal {
  id: string;
  title: string;
  description: string;
  externalLink: string;
  createdBy: string; // admin user ID
  createdAt: Date;
}
```

### Tool Model

```typescript
interface Tool {
  id: string;
  title: string;
  description: string;
  externalLink: string;
  createdBy: string; // admin user ID
  createdAt: Date;
}
```

### Registration Model

```typescript
interface Registration {
  id: string;
  announcementId: string;
  userId: string;
  data: Record<string, any>; // custom registration fields
  badgeIssued: boolean;
  createdAt: Date;
}
```

## Supabase Database Schema

### Tables

**users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  email TEXT UNIQUE NOT NULL,
  roll_number TEXT,
  digital_id TEXT NOT NULL,
  department TEXT NOT NULL,
  join_year INTEGER NOT NULL,
  section TEXT,
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  liked TEXT[] DEFAULT '{}',
  registered_events TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  streak INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  posts TEXT[] DEFAULT '{}',
  announcements TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  chats TEXT[] DEFAULT '{}',
  contacts TEXT[] DEFAULT '{}',
  ods TEXT[] DEFAULT '{}',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**clubs**

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  description TEXT NOT NULL,
  subdomains TEXT[] DEFAULT '{}',
  members JSONB DEFAULT '[]',
  moderators JSONB DEFAULT '[]',
  works_done TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**announcements**

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  additional_images TEXT[] DEFAULT '{}',
  hashtag TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  registration_enabled BOOLEAN DEFAULT FALSE,
  registration_fields TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**posts**

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('students', 'teachers', 'everyone')),
  hashtags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**materials**

```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  external_link TEXT,
  uploaded_by UUID REFERENCES users(id),
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**od_claims**

```sql
CREATE TABLE od_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  event_id UUID,
  event_name TEXT NOT NULL,
  teacher_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**events**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('announcement', 'exam_schedule')),
  source_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**exam_schedules**

```sql
CREATE TABLE exam_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_name TEXT NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  number_of_exams INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**chat_threads**

```sql
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participants TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**messages**

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**notifications**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'announcement', 'od_status', 'event_reminder', 'message')),
  content TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**queries**

```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id),
  submitter_role TEXT NOT NULL CHECK (submitter_role IN ('student', 'teacher')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
  response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**portals**

```sql
CREATE TABLE portals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  external_link TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**tools**

```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  external_link TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**registrations**

```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id),
  user_id UUID REFERENCES users(id),
  data JSONB NOT NULL,
  badge_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

Supabase RLS policies ensure data security at the database level:

**Users Table**

- Users can read all user profiles
- Users can only update their own profile
- Admin can update any user

**Clubs Table**

- All users can read clubs
- Only moderators can update their assigned clubs
- Only admin can create clubs

**Announcements Table**

- All users can read announcements
- Students and teachers can create announcements
- Only creator can update/delete their announcements

**Posts Table**

- Users can read posts based on visibility settings
- Any user can create posts
- Only creator can update/delete their posts

**Materials Table**

- All users can read materials
- Any user can upload materials
- Only uploader can update/delete their materials

**OD Claims Table**

- Students can read their own OD claims
- Teachers can read OD claims where they are tagged
- Students can create OD claims
- Teachers can update status of OD claims where they are tagged

**Events Table**

- All users can read events
- Teachers can create exam schedules
- System automatically creates events from announcements

**Notifications Table**

- Users can only read their own notifications
- System creates notifications (via triggers)

**Queries Table**

- Students and teachers can create queries
- Users can read their own queries
- Admin can read all queries and respond

**Portals/Tools Tables**

- All users can read portals and tools
- Only admin can create/update/delete

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Authentication and Registration Properties

Property 1: Student email validation
_For any_ email string and student registration attempt, the system should accept the registration only if the email matches the pattern `{name}{number}@ssn.edu.in`
**Validates: Requirements 1.1**

Property 2: Teacher email validation
_For any_ email string and teacher registration attempt, the system should accept the registration only if the email matches the pattern `{name}@ssn.edu.in`
**Validates: Requirements 1.2**

Property 3: User registration completeness
_For any_ valid registration data, the created user record should contain all required fields: name, role, email, digital_id, department, join_year, and section
**Validates: Requirements 1.4**

Property 4: Student roll number requirement
_For any_ student registration, the created user record should contain a roll_number field with exactly 13 digits
**Validates: Requirements 1.5**

Property 5: Role-based dashboard routing
_For any_ user login, the system should redirect to the dashboard corresponding to the user's role (student → StudentDashboard, teacher → TeacherDashboard, admin → AdminDashboard)
**Validates: Requirements 1.6**

Property 6: First login achievement
_For any_ user logging in for the first time, the system should add "Welcome Achievement" to the user's achievements array, and subsequent logins should not add duplicate achievements
**Validates: Requirements 1.7**

### Streak and Gamification Properties

Property 7: Consecutive login streak increment
_For any_ user with login history, if the user logs in on consecutive days, the streak counter should increment by exactly one
**Validates: Requirements 2.1**

Property 8: Missed day streak reset
_For any_ user with a streak, if the user misses a day between logins, the streak counter should reset to zero
**Validates: Requirements 2.2**

Property 9: Timezone-aware streak calculation
_For any_ user login from different timezones, the streak calculation should consider the user's local timezone when determining if logins are consecutive
**Validates: Requirements 2.5**

### Dashboard Properties

Property 10: Dashboard streak display
_For any_ user viewing their dashboard, the displayed streak count should match the user's current streak value in the database
**Validates: Requirements 2.4, 3.2**

Property 11: Upcoming events display
_For any_ student dashboard load, the displayed upcoming events should only include events with start dates in the future
**Validates: Requirements 3.3**

Property 12: Followed content display
_For any_ student dashboard load, the displayed announcements and posts should only include content from users in the student's following array
**Validates: Requirements 3.4**

Property 13: Teacher pending OD count accuracy
_For any_ teacher dashboard load, the displayed pending OD claims count should equal the number of OD claims where the teacher is tagged and status is "pending"
**Validates: Requirements 4.2**

Property 14: Teacher created events filter
_For any_ teacher dashboard load, the displayed upcoming events should only include events created by that teacher
**Validates: Requirements 4.3**

Property 15: Admin user count accuracy
_For any_ admin dashboard load, the displayed user counts by role should equal the actual number of users with each role in the database
**Validates: Requirements 5.2**

Property 16: Admin pending queries count accuracy
_For any_ admin dashboard load, the displayed pending queries count should equal the number of queries with status "pending"
**Validates: Requirements 5.3**

### Club Management Properties

Property 17: Club creation required fields
_For any_ club creation attempt, the system should reject the creation if any required field (name, logo, description) is missing
**Validates: Requirements 6.1**

Property 18: Club moderator limits
_For any_ club creation, the system should enforce that exactly one teacher email and at most three student emails are assigned as moderators
**Validates: Requirements 6.2**

Property 19: Moderator email existence validation
_For any_ club creation with moderator emails, the system should verify that all provided emails exist in the users table before creating the club
**Validates: Requirements 6.3**

Property 20: Club member data persistence
_For any_ club creation with member details, the stored club record should contain all member information with their respective roles
**Validates: Requirements 6.4**

Property 21: Club edit access control
_For any_ user viewing a club, edit controls should be visible if and only if the user's ID is in the club's moderators list
**Validates: Requirements 6.5, 6.6**

Property 22: Club list completeness
_For any_ user navigating to the Clubs page, all clubs in the database should be displayed with their logo, name, description, subdomains, members, and works done
**Validates: Requirements 7.1, 7.2, 7.4**

### Announcement Properties

Property 23: Announcement required fields validation
_For any_ announcement creation attempt, the system should reject the creation if any required field (title, description, category, image) is missing
**Validates: Requirements 8.1**

Property 24: Announcement hashtag format validation
_For any_ announcement creation, the system should accept the hashtag only if it matches the format `#type_eventName_startDate_endDate` where dates are in dd-mm-yyyy format
**Validates: Requirements 8.3**

Property 25: Registration data access control
_For any_ announcement with registration enabled, only the announcement creator should be able to view the list of registrants and their data
**Validates: Requirements 8.5**

Property 26: Announcement creator attribution
_For any_ announcement creation, the stored announcement should contain the creator's user ID and the creator's announcements array should include the announcement ID
**Validates: Requirements 8.6**

Property 27: Badge issuance to participants
_For any_ completed event with registrations, when the creator issues badges, all registered participants should receive the badge in their badges array
**Validates: Requirements 8.7**

Property 28: Announcement category filtering
_For any_ category filter applied on the Announcements page, the displayed announcements should only include those matching the selected category
**Validates: Requirements 9.2**

Property 29: Registration button visibility
_For any_ announcement displayed, a registration button should be visible if and only if registration_enabled is true
**Validates: Requirements 9.5**

Property 30: Announcement registration enrollment
_For any_ user registering for an announcement, the user's ID should be added to the announcement's registrations list and the announcement ID should be added to the user's registered_events array
**Validates: Requirements 9.6**

### Post Properties

Property 31: Post required fields validation
_For any_ post creation attempt, the system should reject the creation if any required field (title, description, visibility) is missing
**Validates: Requirements 10.1**

Property 32: Post creator data consistency
_For any_ post creation, the post record should contain the creator's user ID and the creator's posts array should include the post ID
**Validates: Requirements 10.4**

Property 33: Post visibility access control
_For any_ user viewing posts, the displayed posts should only include those where the visibility setting permits the user's role (students see 'students' and 'everyone', teachers see 'teachers' and 'everyone')
**Validates: Requirements 10.5**

Property 34: Post hashtag filtering
_For any_ hashtag filter applied, the displayed posts should only include those containing the selected hashtag in their hashtags array
**Validates: Requirements 10.3**

### Sharing Properties

Property 35: Share contacts display
_For any_ user clicking share on a post or material, the displayed contacts list should match the user's contacts array
**Validates: Requirements 11.1**

Property 36: Share notification creation
_For any_ content shared with contacts, each selected contact should receive a notification with the shared content ID
**Validates: Requirements 11.2, 11.3**

Property 37: Shared content navigation
_For any_ user clicking a shared content notification, the system should navigate directly to the specific post or material referenced in the notification
**Validates: Requirements 11.4**

### Material Properties

Property 38: Material required fields validation
_For any_ material upload attempt, the system should reject the upload if title or description is missing, or if both file and link are missing
**Validates: Requirements 12.1**

Property 39: Material uploader data consistency
_For any_ material upload, the material record should contain the uploader's user ID and the uploader's materials array should include the material ID
**Validates: Requirements 12.2**

### Like and Comment Properties

Property 40: Like action consistency
_For any_ user liking content (announcement, post, or material), the content's like count should increment by one and the content ID should be added to the user's liked array
**Validates: Requirements 9.3, 10.6, 12.4**

Property 41: Comment storage and display
_For any_ user commenting on content (announcement, post, or material), the comment should be stored in the content's comments array with the commenter's user ID and name, and should be displayed with the content
**Validates: Requirements 9.4, 10.7, 12.5**

### Profile and Social Properties

Property 42: Profile data completeness
_For any_ user viewing a profile, all user fields should be displayed including name, role, email, department, join year, section, digital ID, roll number (if student), streak, badges, and achievements
**Validates: Requirements 13.1**

Property 43: Profile content display
_For any_ user viewing a profile, all posts, announcements, and materials created by that user should be displayed
**Validates: Requirements 13.2**

Property 44: Social metrics accuracy
_For any_ profile view, the displayed followers count should equal the length of the user's followers array and the following count should equal the length of the following array
**Validates: Requirements 13.3**

Property 45: Follow action bidirectional update
_For any_ user following another user, the followed user's ID should be added to the follower's following array and the follower's ID should be added to the followed user's followers array
**Validates: Requirements 13.5**

### Chat Properties

Property 46: Chat thread display completeness
_For any_ user opening the chat panel, all chat threads in the user's chats array should be displayed
**Validates: Requirements 14.1**

Property 47: User search by email
_For any_ email search query, the system should return the user with matching email if one exists in the database
**Validates: Requirements 14.2**

Property 48: Chat thread creation bidirectional
_For any_ user initiating a chat, a new chat thread should be created and its ID should be added to both participants' chats arrays
**Validates: Requirements 14.3**

Property 49: Message sending side effects
_For any_ message sent, the message should be stored in the chat thread and the recipient's ID should be added to the sender's contacts array if not already present
**Validates: Requirements 14.4**

Property 50: Real-time message updates
_For any_ open chat panel, when a new message is sent to a thread, the message should appear in the chat without requiring a page refresh
**Validates: Requirements 14.6**

### OD Claim Properties

Property 51: OD claim required fields validation
_For any_ OD claim creation attempt, the system should reject the creation if event selection or teacher tag is missing
**Validates: Requirements 15.1**

Property 52: OD claim initial state
_For any_ OD claim creation, the claim should be created with status "pending" and the claim ID should be added to the student's ods array
**Validates: Requirements 15.2**

Property 53: Student OD claims display
_For any_ student viewing the OD Claims page, all OD claims in the student's ods array should be displayed with their current status
**Validates: Requirements 15.3**

Property 54: Teacher OD claims filtering
_For any_ teacher viewing the OD Claims page, only OD claims where the teacher's ID matches the teacher_id field should be displayed
**Validates: Requirements 16.1**

Property 55: OD status filter accuracy
_For any_ status filter applied on OD claims, the displayed claims should only include those matching the selected status
**Validates: Requirements 16.2**

Property 56: OD approval side effects
_For any_ teacher approving or rejecting an OD claim, the claim status should be updated to "accepted" or "rejected" and a notification should be created for the student
**Validates: Requirements 16.3, 16.4**

### Calendar and Event Properties

Property 57: Hashtag event extraction
_For any_ announcement created with a hashtag in format `#type_eventName_startDate_endDate`, the system should extract the type, name, start date, and end date and create a corresponding event record
**Validates: Requirements 17.2**

Property 58: Automatic event calendar addition
_For any_ event extracted from an announcement hashtag, the event should be automatically added to the calendar on the extracted dates
**Validates: Requirements 17.3**

Property 59: Calendar date event filtering
_For any_ calendar date clicked, the displayed events should only include those with start_date or end_date matching the selected date
**Validates: Requirements 17.4**

Property 60: Exam schedule required fields validation
_For any_ exam schedule creation attempt, the system should reject the creation if any required field (exam_name, date, year, semester, number_of_exams) is missing
**Validates: Requirements 18.1**

Property 61: Exam schedule calendar integration
_For any_ exam schedule created, the exam should appear on the calendar on the specified date
**Validates: Requirements 18.2**

### Portal and Tool Properties

Property 62: Portal and tool required fields validation
_For any_ portal or tool creation attempt, the system should reject the creation if any required field (title, description, external_link) is missing
**Validates: Requirements 19.1, 19.2**

Property 63: Portal and tool list completeness
_For any_ user navigating to the Portals or Tools section, all portals or tools in the database should be displayed with title, description, and clickable link
**Validates: Requirements 19.3, 19.4**

### Query Properties

Property 64: Query required fields validation
_For any_ query submission attempt, the system should reject the submission if title or description is missing
**Validates: Requirements 20.1**

Property 65: Query submission side effects
_For any_ query submitted, the query should be created with status "pending" and a notification should be created for the admin
**Validates: Requirements 20.2**

Property 66: User query display filtering
_For any_ student or teacher viewing the Query page, only queries submitted by that user should be displayed
**Validates: Requirements 20.3**

Property 67: Admin query list completeness
_For any_ admin viewing the Query section, all queries in the database should be displayed
**Validates: Requirements 21.1**

Property 68: Query status filter accuracy
_For any_ status filter applied on queries, the displayed queries should only include those matching the selected status
**Validates: Requirements 21.2**

Property 69: Query response side effects
_For any_ admin responding to a query, the query status should be updated to "responded", the response text should be stored, and a notification should be created for the submitter
**Validates: Requirements 21.3, 21.4**

### Notification Properties

Property 70: Content interaction notifications
_For any_ user receiving a like or comment on their content, a notification should be created with type "like" or "comment" and the relevant content ID
**Validates: Requirements 22.1, 22.2**

Property 71: Announcement broadcast notifications
_For any_ new announcement posted, notifications should be created for all users in the database
**Validates: Requirements 22.3**

Property 72: Message notification creation
_For any_ message sent, a notification should be created for the recipient with type "message"
**Validates: Requirements 14.5, 22.6**

Property 73: Notification read state update
_For any_ notification clicked, the notification's read field should be updated to true and the system should navigate to the related content
**Validates: Requirements 22.8**

### CGPA Calculator Properties

Property 74: CGPA calculation correctness
_For any_ set of course grades and credits entered, the calculated CGPA should equal sum(grade_points × credits) / sum(credits)
**Validates: Requirements 23.2, 23.3**

Property 75: CGPA reactive recalculation
_For any_ course added or removed in the CGPA calculator, the displayed CGPA should automatically recalculate to reflect the change
**Validates: Requirements 23.4**

Property 76: CGPA data persistence
_For any_ CGPA data saved, the data should be stored in the user's profile and retrievable on subsequent visits
**Validates: Requirements 23.5**

### Navigation Properties

Property 77: Role-based sidebar links
_For any_ user viewing the sidebar, the displayed navigation links should match the links appropriate for the user's role
**Validates: Requirements 24.2**

Property 78: Client-side navigation
_For any_ sidebar link clicked, the navigation should occur without a full page reload (SPA behavior)
**Validates: Requirements 24.3**

Property 79: Notification dropdown display
_For any_ user clicking the notifications bell, a dropdown should appear displaying recent notifications from the user's notifications list
**Validates: Requirements 24.4**

## Error Handling

### Error Categories

#### 1. Authentication Errors

- **Invalid Credentials**: Display user-friendly message "Invalid email or password"
- **Email Format Error**: Display specific message based on role (e.g., "Student email must match format: name123@ssn.edu.in")
- **Session Expired**: Automatically redirect to login page with message "Your session has expired. Please login again."
- **Duplicate Email**: Display "An account with this email already exists"

#### 2. Validation Errors

- **Required Field Missing**: Highlight missing fields with red border and display "This field is required"
- **Invalid Format**: Display format-specific error (e.g., "Roll number must be exactly 13 digits")
- **File Size Exceeded**: Display "File size must be less than 5MB"
- **Invalid File Type**: Display "Only PDF, JPG, PNG files are allowed"
- **Hashtag Format Error**: Display "Hashtag must follow format: #type_eventName_DD-MM-YYYY_DD-MM-YYYY"

#### 3. Authorization Errors

- **Insufficient Permissions**: Display "You don't have permission to perform this action"
- **Access Denied**: Redirect to appropriate page with message "Access denied"
- **Moderator-Only Action**: Display "Only club moderators can edit this club"

#### 4. Database Errors

- **Connection Failed**: Display "Unable to connect to server. Please check your internet connection."
- **Query Failed**: Log error to console and display "Something went wrong. Please try again."
- **Constraint Violation**: Display user-friendly message based on constraint (e.g., "Cannot delete user with existing posts")

#### 5. Network Errors

- **Timeout**: Display "Request timed out. Please try again."
- **No Internet**: Display "No internet connection. Please check your network."
- **Server Error**: Display "Server error occurred. Please try again later."

#### 6. File Upload Errors

- **Upload Failed**: Display "File upload failed. Please try again."
- **Storage Quota Exceeded**: Display "Storage limit reached. Please contact admin."
- **Invalid URL**: Display "Please provide a valid URL"

### Error Handling Strategy

#### Frontend Error Handling

```javascript
// Centralized error handler
const handleError = (error, context) => {
  // Log error for debugging
  console.error(`Error in ${context}:`, error);

  // Determine error type and display appropriate message
  if (error.message.includes("auth")) {
    showAuthError(error);
  } else if (error.message.includes("validation")) {
    showValidationError(error);
  } else if (error.message.includes("network")) {
    showNetworkError(error);
  } else {
    showGenericError();
  }
};

// Toast notifications for errors
const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
  });
};
```

#### Supabase Error Handling

```javascript
// Wrap Supabase calls with try-catch
const safeSupabaseCall = async (operation, context) => {
  try {
    const { data, error } = await operation();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    handleError(error, context);
    throw error; // Re-throw for component-level handling
  }
};
```

#### Form Validation

- Use client-side validation before submitting to Supabase
- Display inline error messages for each field
- Disable submit button until all validations pass
- Show loading state during submission

#### Retry Logic

- Implement exponential backoff for network errors
- Maximum 3 retry attempts for failed requests
- Display retry count to user

#### Graceful Degradation

- Show cached data when offline
- Display "Offline Mode" indicator
- Queue actions for when connection is restored
- Disable features that require real-time connection

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for universal correctness properties. This ensures both concrete bug detection and general correctness verification across the entire input space.

### Testing Tools and Frameworks

#### Unit Testing

- **Framework**: Vitest (fast, Vite-native test runner)
- **React Testing**: React Testing Library
- **Mocking**: Vitest mocking utilities
- **Coverage**: Vitest coverage with c8

#### Property-Based Testing

- **Framework**: fast-check (JavaScript property-based testing library)
- **Configuration**: Minimum 100 iterations per property test
- **Integration**: Run alongside unit tests in Vitest

#### End-to-End Testing

- **Framework**: Playwright (for critical user flows)
- **Scope**: Authentication, content creation, and role-based access

### Unit Testing Approach

#### Component Testing

Test individual React components in isolation:

- Render behavior with different props
- User interaction handling (clicks, form submissions)
- Conditional rendering based on state
- Error state display

Example:

```javascript
describe("PostCard", () => {
  it("should display post title and description", () => {
    const post = { title: "Test Post", description: "Test Description" };
    render(<PostCard post={post} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("should call onLike when like button is clicked", () => {
    const onLike = vi.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);
    fireEvent.click(screen.getByRole("button", { name: /like/i }));
    expect(onLike).toHaveBeenCalledOnce();
  });
});
```

#### Service Testing

Test service layer functions with mocked Supabase:

- Successful data operations
- Error handling
- Data transformation
- Edge cases (empty results, null values)

Example:

```javascript
describe("authService", () => {
  it("should validate student email format", () => {
    expect(validateEmail("john123@ssn.edu.in", "student")).toBe(true);
    expect(validateEmail("john@ssn.edu.in", "student")).toBe(false);
  });

  it("should throw error for invalid credentials", async () => {
    vi.mocked(supabase.auth.signIn).mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    await expect(login("test@ssn.edu.in", "wrong")).rejects.toThrow();
  });
});
```

#### Integration Testing

Test interactions between components and services:

- Form submission flows
- Data fetching and display
- State management across components

### Property-Based Testing Approach

Property-based tests verify that correctness properties hold across randomly generated inputs. Each property test must:

1. Run a minimum of 100 iterations
2. Include a comment explicitly referencing the design document property
3. Use smart generators that constrain inputs to valid ranges

#### Property Test Structure

```javascript
import fc from "fast-check";

/**
 * Feature: ssn-connect-portal, Property 1: Student email validation
 * Validates: Requirements 1.1
 */
describe("Property 1: Student email validation", () => {
  it("should accept only emails matching student pattern", () => {
    fc.assert(
      fc.property(
        fc.string(), // Generate random email strings
        fc.integer({ min: 0, max: 999 }), // Generate numbers
        (name, number) => {
          const validEmail = `${name}${number}@ssn.edu.in`;
          const invalidEmail = `${name}@ssn.edu.in`;

          expect(validateEmail(validEmail, "student")).toBe(true);
          expect(validateEmail(invalidEmail, "student")).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Generators for Domain Models

Create custom generators for complex domain objects:

```javascript
// User generator
const userArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  role: fc.constantFrom("student", "teacher", "admin"),
  email: fc.emailAddress(),
  digitalId: fc.string({ minLength: 7, maxLength: 7 }),
  department: fc.constantFrom("CSE", "ECE", "EEE", "MECH", "CIVIL"),
  joinYear: fc.integer({ min: 2020, max: 2025 }),
  streak: fc.integer({ min: 0, max: 365 }),
});

// Post generator
const postArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  visibility: fc.constantFrom("students", "teachers", "everyone"),
  hashtags: fc.array(fc.string(), { maxLength: 5 }),
});
```

### Property Test Coverage

Each correctness property from the design document must have a corresponding property-based test:

- **Properties 1-6**: Authentication and registration validation
- **Properties 7-9**: Streak calculation logic
- **Properties 10-16**: Dashboard data accuracy
- **Properties 17-22**: Club management and access control
- **Properties 23-30**: Announcement creation and filtering
- **Properties 31-34**: Post visibility and filtering
- **Properties 35-37**: Sharing functionality
- **Properties 38-39**: Material upload validation
- **Properties 40-41**: Like and comment consistency
- **Properties 42-45**: Profile and social features
- **Properties 46-50**: Chat functionality
- **Properties 51-56**: OD claim workflow
- **Properties 57-61**: Calendar and event management
- **Properties 62-63**: Portal and tool management
- **Properties 64-69**: Query system
- **Properties 70-73**: Notification system
- **Properties 74-76**: CGPA calculator
- **Properties 77-79**: Navigation behavior

### Test Organization

```
src/
├── components/
│   ├── PostCard.jsx
│   └── PostCard.test.jsx
├── services/
│   ├── authService.js
│   └── authService.test.js
└── __tests__/
    ├── properties/
    │   ├── auth.properties.test.js
    │   ├── streak.properties.test.js
    │   ├── clubs.properties.test.js
    │   ├── announcements.properties.test.js
    │   ├── posts.properties.test.js
    │   ├── materials.properties.test.js
    │   ├── profile.properties.test.js
    │   ├── chat.properties.test.js
    │   ├── od.properties.test.js
    │   ├── calendar.properties.test.js
    │   ├── queries.properties.test.js
    │   ├── notifications.properties.test.js
    │   └── cgpa.properties.test.js
    └── integration/
        ├── auth-flow.test.js
        ├── post-creation.test.js
        └── od-workflow.test.js
```

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Mock Supabase calls to avoid hitting real database
3. **Clear Test Names**: Use descriptive names that explain what is being tested
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Edge Cases**: Test boundary conditions, empty inputs, and error states
6. **Property Test Failures**: When a property test fails, use the counterexample to create a specific unit test
7. **Coverage Goals**: Aim for 80%+ code coverage for critical paths
8. **Fast Execution**: Keep unit tests fast (<1s each) for quick feedback

### Continuous Integration

- Run all tests on every commit
- Fail builds if tests don't pass
- Generate coverage reports
- Run property tests with increased iterations (1000+) in CI

### Manual Testing Checklist

For features that are difficult to automate:

- [ ] UI responsiveness on mobile devices
- [ ] Real-time chat message delivery
- [ ] File upload with various file types and sizes
- [ ] Notification bell real-time updates
- [ ] Calendar date picker interaction
- [ ] Image display from external URLs
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Accessibility (keyboard navigation, screen readers)

## Implementation Notes

### Performance Considerations

1. **Lazy Loading**: Use React.lazy() for route-based code splitting
2. **Pagination**: Implement pagination for lists (posts, announcements, materials)
3. **Image Optimization**: Compress images before upload, use lazy loading for images
4. **Query Optimization**: Use Supabase indexes on frequently queried fields
5. **Caching**: Cache user profile and static data in React Context
6. **Debouncing**: Debounce search inputs to reduce API calls

### Security Considerations

1. **Row Level Security**: Implement RLS policies for all Supabase tables
2. **Input Sanitization**: Sanitize all user inputs to prevent XSS attacks
3. **File Upload Validation**: Validate file types and sizes on both client and server
4. **Authentication**: Use Supabase Auth with secure session management
5. **HTTPS Only**: Enforce HTTPS for all connections
6. **Environment Variables**: Store sensitive data (API keys) in environment variables

### Accessibility

1. **Semantic HTML**: Use proper HTML5 semantic elements
2. **ARIA Labels**: Add ARIA labels for interactive elements
3. **Keyboard Navigation**: Ensure all features are keyboard accessible
4. **Color Contrast**: Maintain WCAG AA contrast ratios
5. **Screen Reader Support**: Test with screen readers
6. **Focus Management**: Manage focus for modals and dynamic content

### Deployment

1. **Environment Setup**: Configure separate environments (dev, staging, production)
2. **Build Process**: Use Vite build for optimized production bundle
3. **Hosting**: Deploy to Vercel or Netlify for automatic deployments
4. **Database Migrations**: Use Supabase migrations for schema changes
5. **Monitoring**: Set up error tracking (Sentry) and analytics
6. **Backup**: Regular database backups through Supabase
